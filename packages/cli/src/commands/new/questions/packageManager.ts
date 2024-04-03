type PackageManagers = 'npm' | 'yarn' | 'pnpm';

const choices = ['npm', 'yarn', 'pnpm'];

const packageManagerQuestion = (answer: string) => ({
  type: 'list' as const,
  name: 'packageManager' as const,
  message: 'Choose a package manager for the project',
  choices,
  when: () => !choices.includes(answer),
  default: 'none' as const,
});

export { PackageManagers, packageManagerQuestion };
