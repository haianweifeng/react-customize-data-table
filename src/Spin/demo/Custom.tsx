import React from 'react';
import { Spin } from 'react-data-table';

const App = () => {
  const indicatorContent = <div className="spin-plane"></div>;

  return <Spin tip="Loading..." type="custom" indicator={indicatorContent} />;
};

export default App;