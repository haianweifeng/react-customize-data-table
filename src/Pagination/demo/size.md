### 大小

###### 内置了 2 种大小供选择，'small' | 'default'，默认为 'default'

Demo:

```tsx
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
```
