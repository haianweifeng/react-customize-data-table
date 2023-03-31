import React, { useRef } from 'react';
import classnames from 'classnames';
import { generateUUID } from '../utils/util';
import './index.less';
import { PREFIXCLS } from '../utils/constant';

interface CheckboxProps {
  className?: string;
  style?: React.CSSProperties;
  checked: boolean | 'indeterminate';
  disabled?: boolean;
  onChange: (checked: boolean, event: any) => void;
  children?: React.ReactNode;
}

const Checkbox = (props: CheckboxProps) => {
  const { className = '', style = {}, disabled = false, checked, children, onChange } = props;

  const idRef = useRef<string>(generateUUID());

  const cls = classnames({
    [`${PREFIXCLS}-checkbox`]: true,
    [`${PREFIXCLS}-checkbox-disabled`]: disabled,
    [`${PREFIXCLS}-checkbox-checked`]: checked,
    [`${PREFIXCLS}-checkbox-indeterminate`]: checked === 'indeterminate',
    [className]: !!className,
  });

  const handleChange = (event: any) => {
    const { checked: value } = event.target;
    onChange(value, event.nativeEvent);
  };

  return (
    <label
      className={cls}
      style={style}
      htmlFor={idRef.current}
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
      }}
    >
      <input
        id={idRef.current}
        disabled={disabled}
        type="checkbox"
        onChange={handleChange}
        checked={checked === true}
        className={`${PREFIXCLS}-checkbox-input`}
      />
      <span className={`${PREFIXCLS}-checkbox-inner`} />
      {children && <span className={`${PREFIXCLS}-checkbox-name`}>{children}</span>}
    </label>
  );
};
export default Checkbox;
