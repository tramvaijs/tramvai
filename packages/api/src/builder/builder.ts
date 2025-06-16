type Parameters = {};

export interface BuilderApi {
  build(parameters: Parameters): Promise<void>;
}
