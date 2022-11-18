import React from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  return (
    <div>
      <Pagination total={1000} size="small" />
      <br />
      <Pagination total={1000} />
    </div>
  );
};

export default App;
