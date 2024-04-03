import type React from 'react';
import { useEffect, useState } from 'react';

const ExtendRenderHocWithError: React.FC = ({ children }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(true);
  }, []);

  if (error) {
    throw new Error('Error Page Component Client');
  }

  return children;
};

export default ExtendRenderHocWithError;
