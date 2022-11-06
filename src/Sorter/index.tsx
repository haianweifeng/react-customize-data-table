import React from 'react';
import ArrowUp from '@/assets/arrow-up.svg';
import ArrowActiveUp from '@/assets/arrow-up-active.svg';
import ArrowDown from '@/assets/arrow-down.svg';
import ArrowActiveDown from '@/assets/arrow-down-active.svg';
import styles from './index.less';

interface SorterProps {
  activeAsc: boolean;
  activeDesc: boolean;
  onChange: (order: 'asc' | 'desc') => void;
  renderSorter: (params: {
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
      <img
        key="asc"
        src={activeAsc ? ArrowActiveUp : ArrowUp}
        alt="sorter-asc"
        className={styles.arrow}
        onClick={handleAsc}
      />
      <img
        key="desc"
        src={activeDesc ? ArrowActiveDown : ArrowDown}
        alt="sorter-desc"
        className={styles.arrow}
        onClick={handleDesc}
      />
    </>
  );

  return (
    <div className={styles.sorterContainer}>
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
