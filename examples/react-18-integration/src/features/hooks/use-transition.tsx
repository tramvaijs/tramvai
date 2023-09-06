import React, { useTransition, useState, Suspense } from 'react';

import { AsyncComponent, SlowList } from '../../shared/ui';

const SlowTab: React.FC = () => {
  return <SlowList />;
};

const NormalTab: React.FC = () => {
  return <div>Normal tab</div>;
};

const AnotherTab: React.FC = () => {
  return <div>Another normal tab</div>;
};

const TabButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ children, isActive, onClick }) => {
  if (isActive) {
    return <b>{children}</b>;
  }

  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
};

export const UseTransitionExample: React.FC = () => {
  const [async, setAsync] = useState(false);
  const [, startTransition] = useTransition();

  const switchType = () => {
    // setAsync((value) => !value); // loading state will appear

    startTransition(() => {
      setAsync((value) => !value);
    });
  };

  return (
    <>
      <h3>useTransition hook</h3>

      <button onClick={switchType} type="button">
        Switch
      </button>

      <Suspense fallback={<h4>Loading...</h4>}>
        {async ? <AsyncComponent /> : <p>Sync component</p>}
      </Suspense>
    </>
  );
};

UseTransitionExample.displayName = 'UseTransitionExample';

export const UseTransitionNavigationExample: React.FC = () => {
  const [tab, setTab] = useState('normal');
  const [isPending, startTransition] = useTransition();

  const changeTab = (nextTab: string) => {
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <>
      <TabButton isActive={tab === 'normal'} onClick={() => changeTab('normal')}>
        Normal
      </TabButton>

      <TabButton isActive={tab === 'slow'} onClick={() => changeTab('slow')}>
        Slow
      </TabButton>

      <TabButton isActive={tab === 'another'} onClick={() => changeTab('another')}>
        Another
      </TabButton>

      {isPending && <p>Loading...</p>}

      {tab === 'normal' && <NormalTab />}
      {tab === 'slow' && <SlowTab />}
      {tab === 'another' && <AnotherTab />}
    </>
  );
};

UseTransitionNavigationExample.displayName = 'UseTransitionNavigationExample';
