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
    <div
      id="popup-container"
      style={{
        height: '150px',
        padding: '10px',
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid red',
      }}
    >
      {/*<div style={{ height: '300px' }}>*/}
      {/*  <Tooltip*/}
      {/*    tip='指定挂载容器'*/}
      {/*    trigger='click'*/}
      {/*    placement='topLeft'*/}
      {/*    // autoAdjustPlacement={false}*/}
      {/*    getPopupContainer={() => document.querySelector('#popup-container')}*/}
      {/*  >*/}
      {/*    <div style={borderStyle}>挂载</div>*/}
      {/*  </Tooltip>*/}
      {/*</div>*/}

      <Tooltip
        tip="指定挂载容器"
        trigger="click"
        placement="top"
        // autoAdjustPlacement={false}
        getPopupContainer={() => document.querySelector('#popup-container')}
      >
        <div style={borderStyle}>挂载</div>
      </Tooltip>
    </div>
  );
};
export default App;
