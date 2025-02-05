export function getDebugArg(debugEnv: boolean | string | undefined) {
  if (!debugEnv) {
    return [];
  }

  const sourceMapsArg = ['-r', 'source-map-support/register'];
  const baseDebugArgs = ['--inspect', ...sourceMapsArg];

  if (debugEnv === 'wait') {
    return ['--inspect-wait', ...sourceMapsArg];
  }

  if (debugEnv === 'break') {
    return ['--inspect-brk', ...sourceMapsArg];
  }

  return baseDebugArgs;
}
