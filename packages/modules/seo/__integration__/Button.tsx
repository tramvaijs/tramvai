import { useActions } from '@tramvai/state';
import React from 'react';
import { applyMetaAction } from '.';

export const Button = () => {
  const applyMeta = useActions(applyMetaAction);
  return (
    <button data-testid="apply-new-meta-button" type="button" onClick={applyMeta}>
      Click!
    </button>
  );
};
