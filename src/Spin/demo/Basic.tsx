import React from 'react';
import { Spin } from 'react-data-table';

const App = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Spin size="small" style={{ flex: 1 }} />
      <Spin style={{ flex: 1 }} />
      <Spin size="large" style={{ flex: 1 }} />
    </div>
  );
};

export default App;
