import type {
  EnvParameter,
  EnvTemplate,
  EnvironmentManager,
  ClientEnvironmentRepository as Interface,
} from '@tramvai/tokens-common';

export class ClientEnvironmentRepository implements Interface {
  protected parameters: Record<string, string | undefined>;

  constructor(
    private envManager: EnvironmentManager,
    private tokens: EnvParameter[]
  ) {
    this.parameters = {};
    this.processing();
  }

  get(name: string): string | undefined {
    return this.parameters[name];
  }

  set(name: string, value: string | undefined): void {
    this.parameters[name] = value;
  }

  getAll() {
    return this.parameters;
  }

  update(result: Record<string, string>) {
    this.parameters = Object.assign(this.parameters, result);
  }

  private processing() {
    const envParameters = this.envManager.getAll() as Record<string, string | undefined>;

    this.tokens.forEach(({ key, dehydrate }) => {
      const value = envParameters[key];

      if (dehydrate !== false) {
        this.set(key, value);
      }
    });
  }
}
