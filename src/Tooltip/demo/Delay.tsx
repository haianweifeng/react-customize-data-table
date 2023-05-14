import React from 'react';
import { Tooltip } from 'react-customize-data-table';

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
      <Tooltip tip="Top Center" delay={1000}>
        <div style={borderStyle}>Hover</div>
      </Tooltip>
    </>
  );
};
export default App;
