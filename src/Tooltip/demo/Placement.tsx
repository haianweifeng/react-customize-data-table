import React from 'react';
import { Tooltip } from 'react-customize-data-table';

const App = () => {
  const baseStyle: React.CSSProperties = {
    width: '100px',
    textAlign: 'center',
    lineHeight: '32px',
    margin: '4px',
    display: 'inline-block',
  };
  const borderStyle: React.CSSProperties = {
    ...baseStyle,
    border: '1px solid #d9d9d9',
    cursor: 'pointer',
  };
  const placements = [
    [null, 'top-left', 'top', 'top-right', null],
    ['left-top', null, null, null, 'right-top'],
    ['left', null, null, null, 'right'],
    ['left-bottom', null, null, null, 'right-bottom'],
    [null, 'bottom-left', 'bottom', 'bottom-right', null],
  ];

  return (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
      {placements.map((rows, i) => {
        return (
          <div key={i}>
            {rows.map((p, index) => {
              if (p) {
                const placement = p.replace(/-([a-z])/, (arg1, arg2) => {
                  return `${arg2.toUpperCase()}`;
                });
                return (
                  <Tooltip tip={`${p}提示文字`} placement={placement} key={p}>
                    <div style={borderStyle}>{p}</div>
                  </Tooltip>
                );
              }
              return <div key={index} style={baseStyle} />;
            })}
          </div>
        );
      })}
    </div>
  );
};
export default App;
