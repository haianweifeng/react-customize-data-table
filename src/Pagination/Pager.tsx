import React, { isValidElement } from 'react';
import classnames from 'classnames';
import { PREFIXCLS } from '../utils/constant';

interface PagerProps {
  page: number;
  active: boolean;
  disabled: boolean;
  onClick: (page: number) => void;
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next',
    originalElement: React.ReactNode,
  ) => React.ReactNode;
}

const Pager = (props: PagerProps) => {
  const { disabled, page, active, itemRender, onClick } = props;

  const cls = classnames({
    [`${PREFIXCLS}-pagination-item`]: true,
    [`${PREFIXCLS}-pagination-item-active`]: active,
    [`${PREFIXCLS}-pageination-item-disabled`]: disabled,
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
    const customNode = itemRender(page, 'page', page);
    return isValidElement(customNode) ? (
      <div
        className={classnames({
          [`${PREFIXCLS}-pagination-custom-item`]: true,
          [`${PREFIXCLS}-pageination-custom-item-active`]: active,
          [`${PREFIXCLS}-pagination-custom-item-disabled`]: disabled,
        })}
        onClick={handleClick}
      >
        {customNode}
      </div>
    ) : (
      defaultNode
    );
  } else {
    return defaultNode;
  }
};
export default Pager;
