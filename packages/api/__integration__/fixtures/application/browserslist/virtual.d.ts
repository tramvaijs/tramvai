declare module 'virtual:tramvai/browserslist' {
  const browserslistConfig: {
    defaults: string[];
    [section: string]: string[] | undefined;
  };
  export default browserslistConfig;
}
