## Radio

Demo:

```tsx
import React, { useState } from 'react';
import { Radio } from 'react-data-table';

const [checked, setChecked] = useState<boolean>(false);

const handleChange = (value: boolean) => {
  setChecked(value);
};

export default () => (
  <>
    <Radio checked={checked} onChange={handleChange}>
      Radio
    </Radio>
  </>
);
```

More skills for writing demo: https://d.umijs.org/guide/basic#write-component-demo
