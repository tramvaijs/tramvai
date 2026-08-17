import type { ApplicationConfigEntry } from '../../api';
import type { Validator } from './validator.h';

export const checkPwaDependencies: Validator = async ({ packageManager, config }, parameters) => {
  const { target } = parameters;
  const cfg = config.getProject(target) as ApplicationConfigEntry;

  if (cfg.experiments?.pwa) {
    const pwaConfigs = Array.isArray(cfg.experiments.pwa)
      ? cfg.experiments.pwa
      : [cfg.experiments.pwa];

    const isIconsConfigExists = pwaConfigs.some((pwaConfig) => Boolean(pwaConfig.icon?.src));

    if (isIconsConfigExists && packageManager.name !== 'unknown') {
      const sharpInstalled = await packageManager.exists({ name: 'sharp' });

      if (!sharpInstalled) {
        throw Error(
          'You need to install `sharp` library for PWA icon generation in devDependencies'
        );
      }
    }
  }

  return { name: 'checkPwaDependencies', status: 'ok' };
};
