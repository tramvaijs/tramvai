import type { EnvTemplate } from '@tramvai/tokens-common';

export type Templates = Record<
  string,
  { fn: EnvTemplate['fn']; validator: EnvTemplate['validator'] }
>;

// use `$[...]` as template placeholder, because this symbols are not used in popular terminal shell for string interpolation
const templateRegex = /(?:\$\[(.+?)\])/g;

export function interpolate({
  envKey,
  envValue,
  templates,
}: {
  envKey: string;
  envValue: string | undefined;
  templates: Templates;
}) {
  const originalValue = envValue;

  if (!envValue || typeof envValue !== 'string') {
    return envValue;
  }

  return envValue.replace(templateRegex, (templateRaw, templateStr) => {
    // expect string in `key:param1,param2` format
    const separatorIndex = templateStr.indexOf(':');
    const paramsExists = separatorIndex >= 0;
    const key = paramsExists ? templateStr.substring(0, separatorIndex) : templateStr;
    const paramsRaw = paramsExists ? templateStr.substring(separatorIndex + 1) : '';
    const params = paramsRaw.split(',').filter(Boolean);
    const template = templates[key];

    if (template) {
      if (template.validator) {
        template.validator(envKey, params);
      }

      return template.fn(...params);
    }

    throw Error(
      `Problem with "${envKey}=${originalValue}" env variable - template for ${templateRaw} not found.`
    );
  });
}
