import type { container, Configuration as RspackConfiguration, RspackOptions } from '@rspack/core';
import type { UniversalFederationPlugin } from '@module-federation/node';

import { Configuration, InputParameters } from '@tramvai/api/lib/config';

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>[0];

export type UniversalFederationPluginOptions = ConstructorParameters<
  typeof UniversalFederationPlugin
>[0];

export type ModuleFederationSharedObject = Record<
  string,
  Exclude<Exclude<Required<ModuleFederationPluginOptions>['shared'], any[]>[string], string>
>;

export type SplitChunksOptions = Required<
  Required<RspackConfiguration>['optimization']
>['splitChunks'];

export type RspackConfigurationFactory = (
  inputParameters: InputParameters,
  extraConfiguration: Partial<Configuration>
) => Promise<RspackOptions>;
