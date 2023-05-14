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
    <div
      id="popup-container"
      style={{
        // width: '130px',
        height: '150px',
        padding: '10px',
        // paddingTop: '40px',
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid red',
      }}
    >
      <Tooltip
        // tip={<span style={{ whiteSpace: 'nowrap' }}>指定挂载容器</span>}
        tip="指定挂载容器"
        trigger="click"
        placement="topRight"
        getPopupContainer={() => document.querySelector('#popup-container')}
      >
        <div style={borderStyle}>挂载</div>
      </Tooltip>
    </div>
  );
};
export default App;
