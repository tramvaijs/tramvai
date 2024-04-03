import isArray from '@tinkoff/utils/is/array';
import type { Route } from '@tinkoff/router';
import type { ExtractDependencyType, PageAction } from '@tramvai/core';
import { resolveLazyComponent } from '@tramvai/react';
import type {
  CHILD_APP_ACTIONS_REGISTRY_TOKEN,
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
  CHILD_APP_PAGE_COMPONENTS_TOKEN,
  ChildAppPageComponent,
  ChildAppPageComponentDecl,
  ChildAppPageService as IChildAppPageService,
} from '@tramvai/tokens-child-app';
import type { COMPONENT_REGISTRY_TOKEN } from '@tramvai/tokens-common';
import type { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

type ActionsRegistry = ExtractDependencyType<typeof CHILD_APP_ACTIONS_REGISTRY_TOKEN>;
type Config = ExtractDependencyType<typeof CHILD_APP_INTERNAL_CONFIG_TOKEN>;
type ComponentRegistry = ExtractDependencyType<typeof COMPONENT_REGISTRY_TOKEN>;
type PageService = ExtractDependencyType<typeof PAGE_SERVICE_TOKEN>;
type PageComponents = ExtractDependencyType<typeof CHILD_APP_PAGE_COMPONENTS_TOKEN>;

export class ChildAppPageService implements IChildAppPageService {
  private actionsRegistry: ActionsRegistry;
  private config: Config;
  private componentRegistry: ComponentRegistry;
  private pageService: PageService;

  constructor({
    actionsRegistry,
    config,
    componentRegistry,
    pageService,
    pageComponents,
  }: {
    actionsRegistry: ActionsRegistry;
    config: Config;
    componentRegistry: ComponentRegistry;
    pageService: PageService;
    pageComponents: PageComponents | null;
  }) {
    this.actionsRegistry = actionsRegistry;
    this.config = config;
    this.componentRegistry = componentRegistry;
    this.pageService = pageService;

    const componentsGroupName = this.getComponentsGroupName();

    (pageComponents || []).forEach((record) => {
      Object.keys(record).forEach((pageComponentName) => {
        const pageComponent = record[pageComponentName];

        if (!this.componentRegistry.get(pageComponentName, componentsGroupName)) {
          this.componentRegistry.add(pageComponentName, pageComponent, componentsGroupName);
        }
      });
    });
  }

  async resolveComponent(route?: Route): Promise<void> {
    const pageComponentName = this.getPageComponentName(route);
    const componentsGroupName = this.getComponentsGroupName();

    if (!pageComponentName) {
      return;
    }

    const pageComponent = this.componentRegistry.get(
      pageComponentName,
      componentsGroupName
    ) as ChildAppPageComponentDecl;

    if (pageComponent) {
      if ('load' in pageComponent) {
        await resolveLazyComponent(pageComponent);
      }

      if ('actions' in pageComponent && isArray(pageComponent.actions)) {
        this.actionsRegistry.add(pageComponentName, pageComponent.actions);
      }
    }
  }

  getComponent(route?: Route): ChildAppPageComponent | void {
    const pageComponentName = this.getPageComponentName(route);
    const componentsGroupName = this.getComponentsGroupName();

    return this.componentRegistry.get(
      pageComponentName,
      componentsGroupName
    ) as ChildAppPageComponentDecl;
  }

  getComponentName(route?: Route): string | void {
    const pageComponentName = this.getPageComponentName(route);

    return pageComponentName;
  }

  getActions(route?: Route): PageAction[] {
    const pageComponentName = this.getPageComponentName(route);

    return [
      ...(this.actionsRegistry.getGlobal() || []),
      ...(this.actionsRegistry.get(pageComponentName) || []),
    ];
  }

  private getPageComponentName(route?: Route): string {
    const config = route?.config ?? this.pageService.getConfig();

    return config?.unstable_childAppPageComponent;
  }

  private getComponentsGroupName() {
    return `${this.config.name}@${this.config.version}`;
  }
}
