import React, { isValidElement } from 'react';
import classnames from 'classnames';
import styles from './index.less';

interface PagerProps {
  page: number;
  active: boolean;
  disabled: boolean;
  onClick: (page: number) => void;
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    originalElement: React.ReactNode,
  ) => React.ReactNode;
}

const Pager = (props: PagerProps) => {
  const { disabled, page, active, itemRender, onClick } = props;

  const cls = classnames({
    [styles.paginationItem]: true,
    [styles.paginationItemActive]: active,
    [styles.pageinationItemDisabled]: disabled,
  });

  const handleClick = () => {
    if (disabled) return;
    onClick(page);
  };

  const defaultNode = (
    <div className={cls} onClick={handleClick}>
      {page}
    </div>
  );

  if (typeof itemRender === 'function') {
    const customNode = itemRender(page, 'page', defaultNode);
    return isValidElement(customNode) ? customNode : defaultNode;
  } else {
    return defaultNode;
  }
};
export default Pager;
