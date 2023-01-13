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
      <Tooltip tip="Hover me">
        <div style={borderStyle}>Hover me</div>
      </Tooltip>
      <Tooltip tip="Click me" trigger="click">
        <div style={borderStyle}>Click me</div>
      </Tooltip>
    </>
  );
};
export default App;
