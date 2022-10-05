import React, { useRef } from 'react';
import classnames from 'classnames';
import { generateUUID } from '../utils/util';
import styles from './index.less';

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
    [styles.checkbox]: true,
    [styles.disabled]: disabled,
    [styles.checked]: checked,
    [styles.indeterminate]: checked === 'indeterminate',
    [className]: !!className,
  });

  const handleChange = (event: any) => {
    const { checked } = event.target;
    onChange(checked, event.nativeEvent);
  };

  return (
    <label className={cls} style={style} htmlFor={idRef.current}>
      <input
        id={idRef.current}
        disabled={disabled}
        type="checkbox"
        onChange={handleChange}
        checked={!!checked}
        className={styles.checkboxInput}
      />
      <span className={styles.checkboxInner} />
      {children && <span className={styles.name}>{children}</span>}
    </label>
  );
};
export default Checkbox;
