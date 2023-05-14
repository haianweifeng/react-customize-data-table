import React, { useState } from 'react';
import { Pagination } from 'react-customize-data-table';

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

  const itemRender = (page: number, type: string, originalElement: React.ReactNode) => {
    if (type === 'prev') {
      return <a>上一页</a>;
    }
    if (type === 'next') {
      return <a>下一页</a>;
    }
    console.log(originalElement);
    return <a>{page}</a>;
    // return originalElement;
  };

  return (
    <Pagination
      current={current}
      pageSize={pageSize}
      onChange={handleChange}
      total={1000}
      itemRender={itemRender}
      layout={['prev', 'pager', 'next', 'sizes', 'jumper', infoContent]}
    />
  );
};

export default App;
