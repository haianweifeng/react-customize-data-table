import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SelectionDropdownProps {
  show: boolean;
  onClick: (type: string) => void;
}
const SelectionDropdown = (props: SelectionDropdownProps) => {
  const { show, onClick } = props;

  const [target, setTarget] = useState<any>(null);

  useEffect(() => {
    setTarget(document.getElementById('selection') as any);
  }, []);

  if (!show) return null;

  const handleClick = (type: string) => {
    onClick(type);
  };

  const content = (
    <div className="selection-dropdown">
      <div className="selection-item" onClick={() => handleClick('all')}>
        Select all data
      </div>
      <div className="selection-item" onClick={() => handleClick('invert')}>
        Invert current page
      </div>
      <div className="selection-item" onClick={() => handleClick('clear')}>
        Clear all data
      </div>
    </div>
  );

  return target ? createPortal(content, target) : null;
};
export default SelectionDropdown;
