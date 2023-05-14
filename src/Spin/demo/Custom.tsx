import React from 'react';
import { Spin } from 'react-customize-data-table';

const App = () => {
  const indicatorContent = <div className="spin-plane" />;

  return <Spin tip="Loading..." type="custom" indicator={indicatorContent} />;
};

export default App;
