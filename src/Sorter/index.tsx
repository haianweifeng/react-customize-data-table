import React from 'react';
import classnames from 'classnames';
import Icon from '../Icon';
import { ReactComponent as UpIcon } from '@/assets/arrow-up.svg';
import { ReactComponent as DownIcon } from '@/assets/arrow-down.svg';
import './index.less';
import { PREFIXCLS } from '../utils/constant';

interface SorterProps {
  activeAsc: boolean;
  activeDesc: boolean;
  onChange: (order: 'asc' | 'desc', event: any) => void;
  renderSorter?: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: (event: React.MouseEvent) => void;
    triggerDesc: (event: React.MouseEvent) => void;
  }) => React.ReactNode;
}

const Sorter = (props: SorterProps) => {
  const { activeAsc, activeDesc, renderSorter, onChange } = props;

  const handleAsc = (event: React.MouseEvent) => {
    onChange('asc', event);
  };

  const handleDesc = (event: React.MouseEvent) => {
    onChange('desc', event);
  };

  const defaultContent = (
    <>
      <Icon
        component={UpIcon}
        onClick={handleAsc}
        className={classnames({
          [`${PREFIXCLS}-sort-icon`]: true,
          [`${PREFIXCLS}-sort-active-icon`]: activeAsc,
        })}
      />
      <Icon
        component={DownIcon}
        onClick={handleDesc}
        className={classnames({
          [`${PREFIXCLS}-sort-icon`]: true,
          [`${PREFIXCLS}-sort-active-icon`]: activeDesc,
        })}
      />
    </>
  );

  return (
    <div className={`${PREFIXCLS}-sorter-container`}>
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
