import styles from './index.less';
import React, { useRef } from 'react';
import { generateUUID } from '../utils/util';
import classnames from 'classnames';

interface RadioProps {
  className?: string;
  style?: React.CSSProperties;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}
const Radio = (props: RadioProps) => {
  const { className = '', style = {}, disabled = false, checked, children, onChange } = props;

  const idRef = useRef<string>(generateUUID());

  const cls = classnames({
    [styles.radio]: true,
    [styles.disabled]: disabled,
    [styles.checked]: checked,
    [className]: !!className,
  });

  const handleChange = (event: any) => {
    const { checked } = event.target;
    onChange(checked);
  };

  return (
    <label className={cls} style={style} htmlFor={idRef.current}>
      <input
        id={idRef.current}
        disabled={disabled}
        type="radio"
        name="radio"
        onChange={handleChange}
        checked={checked}
        className={styles.radioInput}
      />
      <span className={styles.radioInner} />
      {children && <span className={styles.name}>{children}</span>}
    </label>
  );
};
export default Radio;
