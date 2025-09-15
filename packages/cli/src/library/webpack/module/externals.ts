import resolveExternal from './resolveExternal';

const modules = ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'];

export default modules.reduce((acc, name) => {
  acc[name] = {
    window: resolveExternal(name),
    commonjs2: name,
    commonjs: name,
    amd: name,
    var: `window${resolveExternal(name)
      .map((s) => `["${s}"]`)
      .join('')}`,
  };

  return acc;
}, {} as Record<string, {}>);
