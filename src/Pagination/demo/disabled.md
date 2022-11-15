## 禁用

###### 设置 disabled 属性禁用分页

Demo:

```tsx
import React from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  const infoContent = ({ current, total, pageSize }) => {
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
```
