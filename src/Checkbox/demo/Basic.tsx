import React, { useState } from 'react';
import { Checkbox } from 'react-customize-data-table';

const App = () => {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');

  const handleChange = (value: boolean) => {
    setChecked(value);
  };

  return (
    <Checkbox checked={checked} onChange={handleChange}>
      Checkbox
    </Checkbox>
  );
};
export default App;
