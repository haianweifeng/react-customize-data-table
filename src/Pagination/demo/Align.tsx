import React from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  return (
    <div>
      <Pagination total={100} />
      <br />
      <Pagination total={100} align="center" />
      <br />
      <Pagination total={100} align="right" />
    </div>
  );
};

export default App;
