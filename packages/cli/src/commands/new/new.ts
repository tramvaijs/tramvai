import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { packageManagerFactory } from '@tinkoff/package-manager-wrapper';
import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';
import type { Params } from './typings';
import { installDependencies } from './steps/installDependencies';
import { renderTemplate } from './steps/renderTemplate';
import { initializationGit } from './steps/initializationGit';
import type { ConfigEntry } from '../../typings/configEntry/common';
import type { Templates } from './questions/template';
import { templateQuestion } from './questions/template';
import type { PackageManagers } from './questions/packageManager';
import { packageManagerQuestion } from './questions/packageManager';
import type { TestingFrameworks } from './questions/testingFramework';
import { testingFrameworkQuestion } from './questions/testingFramework';
import type { Type } from './questions/type';
import { typeQuestion } from './questions/type';

// ts не копирует файлы, так что шаблона не будет в lib директории =(
const getPathToTemplate = (type: Type, template: Templates) =>
  path.resolve(__dirname, '../../../src/commands/new/templates', type, template);
const getPathToShared = () => path.resolve(__dirname, '../../../src/commands/new/templates/shared');
const getPathToBlock = (type: Type) =>
  path.resolve(__dirname, '../../../src/commands/new/templates', type, 'block');
const getPathToMonorepoBlock = () =>
  path.resolve(__dirname, '../../../src/commands/new/templates/monorepo-block');
const getPathToTestingFramework = (type: Type, testingFramework: TestingFrameworks) =>
  path.resolve(__dirname, '../../../src/commands/new/templates', type, 'testing', testingFramework);

export default async function createNew(context: Context, params: Params): Promise<CommandResult> {
  const {
    name: inputName,
    type: inputType,
    template: inputTemplate,
    packageManager: inputPackageManager,
    testingFramework: inputTestingFramework,
  } = params;
  const directoryName = path.join(process.cwd(), inputName);
  const name = path.basename(directoryName);
  const configEntry: ConfigEntry = {
    type: 'application',
    name,
    root: directoryName,
  };

  const {
    type = inputType,
    template = inputTemplate,
    packageManager = inputPackageManager,
    testingFramework = inputTestingFramework,
  } = await inquirer.prompt<{
    type: Type;
    template: Templates;
    packageManager: PackageManagers;
    testingFramework: TestingFrameworks;
  }>([
    typeQuestion(inputType),
    templateQuestion(inputTemplate),
    packageManagerQuestion(inputPackageManager),
    testingFrameworkQuestion(inputTestingFramework),
  ]);

  const templateDir = getPathToTemplate(type, template);
  const sharedDir = getPathToShared();
  const blockDir = getPathToBlock(type);
  const isMonorepo = template === 'monorepo';
  const baseDir = type === 'app' ? 'apps' : 'child-apps';
  const blockDirectoryName = {
    monorepo: path.join(baseDir, name),
    multirepo: 'src',
  }[template];

  const templateData = {
    configEntry,
    isJest: testingFramework === 'jest',
    isNpm: packageManager === 'npm',
    isYarn: packageManager === 'yarn',
    workspaceBaseDir: isMonorepo ? baseDir : undefined,
  };

  await renderTemplate(templateDir, directoryName, templateData);
  await renderTemplate(sharedDir, directoryName, templateData);
  await renderTemplate(blockDir, path.join(directoryName, blockDirectoryName), templateData);
  if (template === 'monorepo') {
    const monorepoBlockDir = getPathToMonorepoBlock();

    await renderTemplate(
      monorepoBlockDir,
      path.join(directoryName, blockDirectoryName),
      templateData
    );
  }

  if (testingFramework !== 'none') {
    await renderTemplate(
      getPathToTestingFramework(type, testingFramework),
      directoryName,
      templateData
    );
  }

  await initializationGit(directoryName);
  await installDependencies({
    localDir: directoryName,
    type,
    packageManager: packageManagerFactory(
      { rootDir: path.resolve(process.cwd(), directoryName) },
      packageManager
    ),
    testingFramework,
    workspace: isMonorepo ? blockDirectoryName : undefined,
  });

  console.log(
    `\n\n Project ${name} has been successfully created. To run the project, enter in the terminal`,
    chalk.blue(`cd ${name} && npm start`)
  );

  return Promise.resolve({ status: 'ok' });
}
