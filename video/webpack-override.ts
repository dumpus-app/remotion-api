import path from 'path';
import { enableTailwind } from '@remotion/tailwind';
import { WebpackOverrideFn } from 'remotion';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return enableTailwind({
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...(currentConfiguration.resolve?.alias || {}),
        '~': path.join(process.cwd(), 'src'),
        '#video': path.join(process.cwd(), 'video'),
      },
    },
  });
};
