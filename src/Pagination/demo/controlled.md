## 受控

###### 受控制的页码通过设置 current 配合 onChange 属性

###### 受控制的每页显示条目数通过设置 pageSize 配合 onChange 属性

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
```
