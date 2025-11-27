import React from 'react';

import { useActions } from '@tramvai/state';
import { applyMetaRobotsAction } from '.';

export const ApplyMetaRobotsButton = () => {
  const applyMetaRobots = useActions(applyMetaRobotsAction);

  return (
    <button data-testid="apply-robots-skip-meta-button" type="button" onClick={applyMetaRobots}>
      Apply robots:skip meta
    </button>
  );
};
