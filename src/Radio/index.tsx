import styles from './index.less';
import React, { useRef } from 'react';
import { generateUUID } from '../utils/util';
import classnames from 'classnames';

interface RadioProps {
  className?: string;
  style?: React.CSSProperties;
  checked: boolean;
  disabled?: boolean;
  name?: string;
  onChange: (checked: boolean, event: any) => void;
  children?: React.ReactNode;
}
const Radio = (props: RadioProps) => {
  const {
    className = '',
    style = {},
    disabled = false,
    checked,
    children,
    name = 'radio',
    onChange,
  } = props;

  const idRef = useRef<string>(generateUUID());

  const cls = classnames({
    [styles.radio]: true,
    [styles.disabled]: disabled,
    [styles.checked]: checked,
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
        type="radio"
        name={name}
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
