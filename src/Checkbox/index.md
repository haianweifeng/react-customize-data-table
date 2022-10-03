## Checkbox

Demo:

```tsx
import React, { useState } from 'react';
import { Checkbox } from 'react-data-table';

const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');

const handleChange = (value: boolean) => {
  setChecked(value);
};

export default () => (
  <Checkbox checked={checked} disabled onChange={handleChange}>
    Checkbox
  </Checkbox>
);
```

More skills for writing demo: https://d.umijs.org/guide/basic#write-component-demo
