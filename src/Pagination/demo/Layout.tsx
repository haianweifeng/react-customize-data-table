import React from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  return (
    <div>
      <Pagination total={1000} />
      <br />
      <Pagination total={1000} layout={[renderInfo, 'prev', 'pager', 'next', 'sizes', 'jumper']} />
    </div>
  );
};

export default App;
