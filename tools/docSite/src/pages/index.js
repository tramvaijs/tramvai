import React from 'react';
// eslint-disable-next-line import/no-unresolved
import Layout from '@theme/Layout';
import { Title } from '../components/main/title';
import { QuickStart } from '../components/main/quick-start';
import { Universal } from '../components/main/universal';
import { Modular } from '../components/main/modular';
import { Performance } from '../components/main/performance';
import { DI } from '../components/main/di';
import { View } from '../components/main/view';
import { State } from '../components/main/state';
import { Commands } from '../components/main/commands';

function Index() {
  return (
    <Layout>
      <Title />
      <QuickStart />
      <Universal />
      <Modular />
      <Performance />
      <DI />
      <View />
      <State />
      <Commands />
    </Layout>
  );
}

export default Index;
