import fs from 'fs';
import path from 'path';
import { copyBuildFile } from './copyBuildFile';
import type { ConfigManager } from '../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../typings/configEntry/application';

export const copyStatsJsonFileToServerDirectory = async (
  clientConfigManager: ConfigManager<ApplicationConfigEntry>
) => {
  const STATS_JSON_FILE_NAME = 'stats.json';

  const statsJsonFileDirectoryPath = clientConfigManager.output.client;

  const statsJsonFilePath = path.resolve(
    clientConfigManager.rootDir,
    statsJsonFileDirectoryPath,
    STATS_JSON_FILE_NAME
  );

  const isExistStatsJsonFilePath = fs.existsSync(statsJsonFilePath);

  // TODO: Необходимо вынести все локальные константы обозначающие тип сборки
  // ('client' | 'server' | 'all') в отдельный enum и переиспользовать по всему коду @tramvai/cli
  const FROM_BUILD_DIRECTORY_TYPE = 'client';

  if (isExistStatsJsonFilePath) {
    // TODO: Если в дальнейшем не предполагается какая-либо функциональность связанная с подобным копированием файлов,
    // то возможно есть смысл перенести всю логику из copyBuildFile непосредственно в утилиту copyStatsJsonFileToServerDirectory
    await copyBuildFile({
      config: clientConfigManager,
      inputPath: statsJsonFileDirectoryPath,
      fromType: FROM_BUILD_DIRECTORY_TYPE,
      fileName: STATS_JSON_FILE_NAME,
    });
  }
};
