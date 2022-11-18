---
order: 4
sidemenu: false
---

### 布局

###### 设置 layout 属性显示需要的内容, 默认值为['prev', 'pager', 'next']

###### prev 表示上一页，next 为下一页，pager 表示页码列表，jumper 表示跳页元素，sizes 用于设置每页显示的页码数量, function({ current, total, pageSize }): 匿名函数，用来信息展示。

Demo:

```tsx
import React from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  const renderInfo = ({ current, total, pageSize }) => {
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
```
