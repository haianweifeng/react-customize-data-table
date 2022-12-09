import React from 'react';
import { Spin } from 'react-data-table';

const App = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '4px',
        padding: '30px 50px',
      }}
    >
      <Spin />
    </div>
  );
};

export default App;
