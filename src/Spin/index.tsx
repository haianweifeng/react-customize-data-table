import React from 'react';
import classnames from 'classnames';
import './index.less';

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
      <div className="spinner-bounce">
        <div className="double-bounce" />
        <div className="double-bounce" />
      </div>
    );
  };

  const renderChase = () => {
    return (
      <div className="spinner-chase">
        <div className="chase-dot" />
        <div className="chase-dot" />
        <div className="chase-dot" />
        <div className="chase-dot" />
        <div className="chase-dot" />
        <div className="chase-dot" />
      </div>
    );
  };

  const renderWave = () => {
    return (
      <div className="spinner-wave">
        <div className="wave-item" />
        <div className="wave-item" />
        <div className="wave-item" />
        <div className="wave-item" />
        <div className="wave-item" />
      </div>
    );
  };

  const renderCube = () => {
    return (
      <div className="spinner-cube">
        <div className="cube-item" />
        <div className="cube-item" />
      </div>
    );
  };

  const rederPulse = () => {
    return <div className="spinner-pulse" />;
  };

  const renderChaseBounce = () => {
    return (
      <div className="spinner-chase-bounce">
        <div className="chase-bounce" />
        <div className="chase-bounce" />
      </div>
    );
  };

  const renderCircle = () => {
    return (
      <div className="spinner-circle">
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
        <div className="circle-dot" />
      </div>
    );
  };

  const renderFlow = () => {
    return (
      <div className="spinner-flow">
        <div className="flow-dot" />
        <div className="flow-dot" />
        <div className="flow-dot" />
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <div className="spinner-grid">
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
        <div className="grid-cube" />
      </div>
    );
  };

  const renderCircleFade = () => {
    return (
      <div className="spinner-circle-fade">
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
        <div className="circle-fade-dot" />
      </div>
    );
  };

  const renderFold = () => {
    return (
      <div className="spinner-fold">
        <div className="fold-cube" />
        <div className="fold-cube" />
        <div className="fold-cube" />
        <div className="fold-cube" />
      </div>
    );
  };

  const renderRing = () => {
    return (
      <div className="spinner-ring">
        <div className="ring" />
      </div>
    );
  };

  const renderDefault = () => {
    return (
      <div className="spinner-default">
        <div className="default-dot" />
        <div className="default-dot" />
        <div className="default-dot" />
        <div className="default-dot" />
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="spinner-loading">
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
        <div className="loading-item" />
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
    spin: true,
    'spin-small': size === 'small',
    'spin-large': size === 'large',
    [className]: !!className,
  });

  const spinContent = (
    <div style={style} className={spinCls}>
      {renderIndicator(type)}
      {tip ? <div className="spin-tip">{tip}</div> : null}
    </div>
  );

  return children ? (
    <div
      className={classnames({
        'spin-container': true,
        'spin-mask': isLoading,
      })}
    >
      {isLoading && <div className="spin-loading">{spinContent}</div>}
      <div className="spin-content">{children}</div>
    </div>
  ) : (
    spinContent
  );
};
export default Spin;
