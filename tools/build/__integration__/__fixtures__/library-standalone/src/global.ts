declare module '*.svg' {
  const image: string;
  export = image;
}

declare module '*.css' {
  const value: any;
  export default value;
}
