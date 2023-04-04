import React from 'react';
import classnames from 'classnames';
import './index.less';
import { PREFIXCLS } from '../utils/constant';

export interface SpinProps {
  className?: string;
  style?: React.CSSProperties;
  type?:
    | 'bounce'
    | 'wave'
    | 'cube'
    | 'pulse'
    | 'flow'
    | 'circle'
    | 'circle-fade'
    | 'grid'
    | 'fold'
    | 'ring'
    | 'loading'
    | 'chase'
    | 'chase-bounce'
    | 'custom'
    | 'default';
  isLoading?: boolean;
  size?: 'small' | 'default' | 'large';
  tip?: string | React.ReactNode;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
}

const Spin = (props: SpinProps) => {
  const { size, className = '', tip, style = {}, type, indicator, children, isLoading } = props;

  const renderBounce = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-bounce`}>
        <div className={`${PREFIXCLS}-double-bounce`} />
        <div className={`${PREFIXCLS}-double-bounce`} />
      </div>
    );
  };

  const renderChase = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-chase`}>
        <div className={`${PREFIXCLS}-chase-dot`} />
        <div className={`${PREFIXCLS}-chase-dot`} />
        <div className={`${PREFIXCLS}-chase-dot`} />
        <div className={`${PREFIXCLS}-chase-dot`} />
        <div className={`${PREFIXCLS}-chase-dot`} />
        <div className={`${PREFIXCLS}-chase-dot`} />
      </div>
    );
  };

  const renderWave = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-wave`}>
        <div className={`${PREFIXCLS}-wave-item`} />
        <div className={`${PREFIXCLS}-wave-item`} />
        <div className={`${PREFIXCLS}-wave-item`} />
        <div className={`${PREFIXCLS}-wave-item`} />
        <div className={`${PREFIXCLS}-wave-item`} />
      </div>
    );
  };

  const renderCube = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-cube`}>
        <div className={`${PREFIXCLS}-cube-item`} />
        <div className={`${PREFIXCLS}-cube-item`} />
      </div>
    );
  };

  const rederPulse = () => {
    return <div className={`${PREFIXCLS}-spinner-pulse`} />;
  };

  const renderChaseBounce = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-chase-bounce`}>
        <div className={`${PREFIXCLS}-chase-bounce`} />
        <div className={`${PREFIXCLS}-chase-bounce`} />
      </div>
    );
  };

  const renderCircle = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-circle`}>
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
        <div className={`${PREFIXCLS}-circle-dot`} />
      </div>
    );
  };

  const renderFlow = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-flow`}>
        <div className={`${PREFIXCLS}-flow-dot`} />
        <div className={`${PREFIXCLS}-flow-dot`} />
        <div className={`${PREFIXCLS}-flow-dot`} />
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-grid`}>
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
        <div className={`${PREFIXCLS}-grid-cube`} />
      </div>
    );
  };

  const renderCircleFade = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-circle-fade`}>
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
        <div className={`${PREFIXCLS}-circle-fade-dot`} />
      </div>
    );
  };

  const renderFold = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-fold`}>
        <div className={`${PREFIXCLS}-fold-cube`} />
        <div className={`${PREFIXCLS}-fold-cube`} />
        <div className={`${PREFIXCLS}-fold-cube`} />
        <div className={`${PREFIXCLS}-fold-cube`} />
      </div>
    );
  };

  const renderRing = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-ring`}>
        <div className={`${PREFIXCLS}-ring`} />
      </div>
    );
  };

  const renderDefault = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-default`}>
        <div className={`${PREFIXCLS}-default-dot`} />
        <div className={`${PREFIXCLS}-default-dot`} />
        <div className={`${PREFIXCLS}-default-dot`} />
        <div className={`${PREFIXCLS}-default-dot`} />
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className={`${PREFIXCLS}-spinner-loading`}>
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
        <div className={`${PREFIXCLS}-loading-item`} />
      </div>
    );
  };

  const renderIndicator = (value?: string) => {
    switch (value) {
      case 'bounce':
        return renderBounce();
      case 'wave':
        return renderWave();
      case 'cube':
        return renderCube();
      case 'pulse':
        return rederPulse();
      case 'flow':
        return renderFlow();
      case 'circle':
        return renderCircle();
      case 'circle-fade':
        return renderCircleFade();
      case 'grid':
        return renderGrid();
      case 'fold':
        return renderFold();
      case 'ring':
        return renderRing();
      case 'loading':
        return renderLoading();
      case 'chase':
        return renderChase();
      case 'chase-bounce':
        return renderChaseBounce();
      case 'custom':
        return indicator;
      default:
        return renderDefault();
    }
  };

  const spinCls = classnames({
    [`${PREFIXCLS}-spin`]: true,
    [`${PREFIXCLS}-spin-small`]: size === 'small',
    [`${PREFIXCLS}-spin-large`]: size === 'large',
    [className]: !!className,
  });

  const spinContent = (
    <div style={style} className={spinCls}>
      {renderIndicator(type)}
      {tip ? <div className={`${PREFIXCLS}-spin-tip`}>{tip}</div> : null}
    </div>
  );

  return children ? (
    <div
      className={classnames({
        [`${PREFIXCLS}-spin-container`]: true,
        [`${PREFIXCLS}-spin-mask`]: isLoading,
      })}
    >
      {isLoading && <div className={`${PREFIXCLS}-spin-loading`}>{spinContent}</div>}
      <div className={`${PREFIXCLS}-spin-content`}>{children}</div>
    </div>
  ) : (
    spinContent
  );
};
export default Spin;
