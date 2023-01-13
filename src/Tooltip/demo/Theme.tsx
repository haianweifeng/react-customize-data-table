import React from 'react';
import { Tooltip } from 'react-data-table';

const App = () => {
  const borderStyle: React.CSSProperties = {
    width: '100px',
    textAlign: 'center',
    lineHeight: '32px',
    margin: '4px',
    display: 'inline-block',
    border: '1px solid #d9d9d9',
    cursor: 'pointer',
  };
  return (
    <>
      <Tooltip tip="Top Center" placement="top">
        <div style={borderStyle}>Dark</div>
      </Tooltip>
      <Tooltip tip="Bottom Center" placement="bottom" theme="light">
        <div style={borderStyle}>Light</div>
      </Tooltip>
    </>
  );
};
export default App;
