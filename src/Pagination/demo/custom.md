## 自定义渲染

###### 设置 itemRender 自定义页码结构

Demo:

```tsx
import React, { useState } from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  const [current, setCurrent] = useState(6);
  const [pageSize, setPageSize] = useState(10);

  const infoContent = ({ current, total, pageSize }) => {
    return `Total ${total} items`;
  };

  const handleChange = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const itemRender = (page, type, originalElement) => {
    if (type === 'prev') {
      return <a>上一页</a>;
    }
    if (type === 'next') {
      return <a>下一页</a>;
    }
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
```
