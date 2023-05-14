import React, { useState } from 'react';
import { Radio } from 'react-customize-data-table';

const App = () => {
  const [checked, setChecked] = useState<boolean>(false);

  const handleChange = (value: boolean) => {
    setChecked(value);
  };

  return (
    <Radio checked={checked} onChange={handleChange}>
      Radio
    </Radio>
  );
};
export default App;
