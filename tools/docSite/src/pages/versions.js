import React from 'react';
import Layout from '@theme/Layout';

export default function Versions() {
  const baseUrl = '/';

  return (
    <Layout title="Tramvai Versions" description="Tramvai Versions Page">
      <div className="container container-fluid">
        <h2>Tramvai Versions</h2>
        <ul>
          <li><a href={baseUrl}>v7.x.x</a></li>
          <li><a href={`${baseUrl}6.x.x`}>v6.x.x</a></li>
          <li><a href={`${baseUrl}5.x.x`}>v5.x.x</a></li>
        </ul>
      </div>
    </Layout>
  );
}
