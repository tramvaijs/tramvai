import type { PackageJSON } from '../types';

export const addDependencies = ({
  packageJSON,
  dependencies,
}: {
  packageJSON: PackageJSON;
  dependencies: [string, string][];
}) => {
  dependencies.forEach(([key, value]) => {
    if (packageJSON.dependencies) {
      if (!packageJSON.dependencies[key]) {
        packageJSON.dependencies[key] = value;
      }
    }
  });
};
