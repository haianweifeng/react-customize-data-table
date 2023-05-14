import React from 'react';
import { Spin } from 'react-customize-data-table';

const App = () => {
  return (
    <Spin isLoading>
      <div
        style={{
          color: '#333',
          width: '100%',
          backgroundColor: '#e6f7ff',
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid #91d5ff',
        }}
      >
        <div style={{ marginBottom: '10px' }}>This is Title</div>
        Some Content Here...
      </div>
    </Spin>
  );
};

export default App;
