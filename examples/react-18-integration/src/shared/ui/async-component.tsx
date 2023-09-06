import React, { useState, useEffect } from 'react';

const Component = () => {
  if (typeof window !== 'undefined') {
    return <p>Async component</p>;
  }

  throw Error('Component for client');
};

export default Component;
