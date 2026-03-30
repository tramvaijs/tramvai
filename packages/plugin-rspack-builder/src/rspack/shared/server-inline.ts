import { Container, optional } from '@tinkoff/dippy';
import type { RuleSetRule } from '@rspack/core';

import { RSPACK_TRANSPILER_TOKEN, resolveRspackTranspilerParameters } from './transpiler';

export const createServerInlineRules = ({ di }: { di: Container }): RuleSetRule[] => {
  const transpiler = di.get(optional(RSPACK_TRANSPILER_TOKEN))!;
  const transpilerParameters = resolveRspackTranspilerParameters({ di, buildTarget: 'client' });
  const inlineTranspilerParameters = {
    // inline transpiler runtime helpers to prevent webpack imports in generated inline scripts
    externalHelpers: false,
    // minimize swc helpers usage to prevent inline scripts bloat, risks is minimal for rarely used inline scripts
    loose: true,
  };

  return [
    {
      test: /\.inline\.ts$/,
      use: [
        {
          loader: transpiler.loader,
          options: transpiler.configFactory({
            ...transpilerParameters,
            ...inlineTranspilerParameters,
            typescript: true,
          }),
        },
      ],
    },
    {
      test: /\.inline(\.es)?\.js$/,
      use: [
        {
          loader: transpiler.loader,
          options: transpiler.configFactory({
            ...transpilerParameters,
            ...inlineTranspilerParameters,
            typescript: false,
          }),
        },
      ],
    },
  ];
};
