import React from 'react';
import classnames from 'classnames';
import Icon from '../Icon';
import { ReactComponent as UpIcon } from '@/assets/arrow-up.svg';
import { ReactComponent as DownIcon } from '@/assets/arrow-down.svg';
import './index.less';

interface SorterProps {
  activeAsc: boolean;
  activeDesc: boolean;
  onChange: (order: 'asc' | 'desc') => void;
  renderSorter?: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
}

const Sorter = (props: SorterProps) => {
  const { activeAsc, activeDesc, renderSorter, onChange } = props;

  const handleAsc = () => {
    onChange('asc');
  };

  const handleDesc = () => {
    onChange('desc');
  };

  const defaultContent = (
    <>
      <Icon
        component={UpIcon}
        onClick={handleAsc}
        className={classnames({ 'sort-icon': true, 'sort-active-icon': activeAsc })}
      />
      <Icon
        component={DownIcon}
        onClick={handleDesc}
        className={classnames({ 'sort-icon': true, 'sort-active-icon': activeDesc })}
      />
    </>
  );

  return (
    <div className="sorter-container">
      {typeof renderSorter === 'function'
        ? renderSorter({
            activeAsc,
            activeDesc,
            triggerAsc: handleAsc,
            triggerDesc: handleDesc,
          })
        : defaultContent}
    </div>
  );
};
export default Sorter;
