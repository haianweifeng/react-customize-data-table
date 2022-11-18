import React, { useState } from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  const [current, setCurrent] = useState(6);
  const [pageSize, setPageSize] = useState(10);

  const infoContent = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  const handleChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  };

  return (
    <Pagination
      current={current}
      pageSize={pageSize}
      onChange={handleChange}
      total={1000}
      layout={['prev', 'pager', 'next', 'sizes', 'jumper', infoContent]}
    />
  );
};

export default App;
