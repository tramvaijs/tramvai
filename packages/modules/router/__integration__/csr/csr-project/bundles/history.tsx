import React, { useEffect } from 'react';
import { createBundle } from '@tramvai/core';

export const ReplaceStateInternal = () => {
  useEffect(() => {
    window.history.replaceState({}, '', '../internal/?test=a');
  });

  return <div id="page">Replace State Internal</div>;
};

export const ReplaceStateExternal = () => {
  useEffect(() => {
    window.history.replaceState({}, '', '/test/');
  });

  return <div id="page">Replace State External</div>;
};

export const PushStateInternal = () => {
  useEffect(() => {
    window.history.pushState({}, '', '../internal?test=a');
  });

  return <div id="page">Push State Internal</div>;
};

export const PushStateExternal = () => {
  useEffect(() => {
    window.history.pushState({}, '', '/test/');
  });

  return <div id="page">Push State External</div>;
};

export const EmptyCmp = () => {
  return <div id="page">Empty Component</div>;
};

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'history',
  components: {
    ReplaceStateInternal,
    ReplaceStateExternal,
    PushStateInternal,
    PushStateExternal,
    EmptyCmp,
  },
});
