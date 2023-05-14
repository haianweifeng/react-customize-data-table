import React from 'react';
import { Pagination } from 'react-customize-data-table';

const App = () => {
  return <Pagination defaultCurrent={1} total={50} />;
};

export default App;
