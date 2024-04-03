import React from 'react';
import { useNavigate } from '@tramvai/module-router';

import { BatchingExample } from '../features/batching';
import { SuspenseExample } from '../features/suspense';

import './index.module.css';

export const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <p>Main Page with React {process.env.__TRAMVAI_CONCURRENT_FEATURES ? 18 : 17}</p>

      <button type="button" onClick={() => navigate('hooks')}>
        Hooks
      </button>

      <BatchingExample />

      <SuspenseExample />
    </div>
  );
};

export default MainPage;
