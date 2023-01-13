import React, { useState } from 'react';
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
  const [visible, setVisible] = useState<boolean>(false);

  const handleVisible = (isShow: boolean) => {
    setVisible(isShow);
  };

  return (
    <>
      <Tooltip tip="Hover me" visible={visible} onVisibleChange={handleVisible}>
        <div style={borderStyle}>Hover me</div>
      </Tooltip>
    </>
  );
};
export default App;
