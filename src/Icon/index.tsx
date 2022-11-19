import React from 'react';
import type { ComponentType } from 'react';
import classnames from 'classnames';
import './index.less';

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill: string;
  viewBox?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface IconProps {
  component: ComponentType<CustomIconComponentProps>;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

const Icon = (props: IconProps) => {
  const { className = '', style = {}, component: Component, onClick } = props;

  const cls = classnames({ icon: true, [className]: !!className });

  const svgBaseProps = {
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    'aria-hidden': true,
  };

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <i className={cls} style={style} onClick={handleClick}>
      <Component {...svgBaseProps} />
    </i>
  );
};
export default Icon;
