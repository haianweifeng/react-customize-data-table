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
}

const Icon = (props: IconProps) => {
  const { className = '', style = {}, component: Component } = props;

  const cls = classnames({ icon: true, [className]: !!className });

  const svgBaseProps = {
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    'aria-hidden': true,
  };

  return (
    <i className={cls} style={style}>
      <Component {...svgBaseProps} />
    </i>
  );
};
export default Icon;
