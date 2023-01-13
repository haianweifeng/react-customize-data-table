### 测试 tooltip

```tsx
import React from 'react';
import { Tooltip } from 'react-data-table';

const App = () => {
  return (
    <Tooltip tip="prompt text" trigger="click">
      <span>Tooltip will show on mouse enter.</span>
    </Tooltip>
  );
};

export default App;
```
