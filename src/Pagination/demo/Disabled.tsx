import React from 'react';
import { Pagination } from 'react-customize-data-table';

const App = () => {
  const infoContent = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  return (
    <Pagination
      disabled
      total={1000}
      defaultCurrent={6}
      layout={['prev', 'pager', 'next', 'sizes', 'jumper', infoContent]}
    />
  );
};

export default App;
