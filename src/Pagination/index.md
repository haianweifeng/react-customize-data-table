## Pagination

Demo:

```tsx
import React, { useState } from 'react';
import { Pagination } from 'react-data-table';

const App = () => {
  const [current, setCurrent] = useState(6);
  const infoContent = ({ current, total, pageSize }) => {
    return `total ${total}`;
  };

  const handleChange = (page: number, pageSize: number) => {
    console.log(page);
    console.log(pageSize);
    setCurrent(page);
  };

  return (
    <Pagination
      current={current}
      onChange={handleChange}
      defaultCurrent={6}
      total={500}
      size="default"
      layout={['prev', 'pager', 'next', 'sizes', 'jumper', infoContent]}
    />
  );
};

export default App;
```
