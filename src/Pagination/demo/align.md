### 对齐

###### 设置 align 属性控制对齐, 'left' | 'center' | 'right' ,默认值为'left'

Demo:

```tsx
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
```
