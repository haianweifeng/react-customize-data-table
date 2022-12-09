import React from 'react';
import { Spin } from 'react-data-table';

const App = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Spin size="small" style={{ flex: 1 }} type="cube" tip="Loading..." />
      <Spin style={{ flex: 1 }} type="cube" tip="Loading..." />
      <Spin size="large" style={{ flex: 1 }} type="cube" tip="Loading..." />
    </div>
  );
};

export default App;
