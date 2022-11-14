import React, { useState, useMemo, useEffect, useRef, isValidElement } from 'react';
import classnames from 'classnames';
import Pager from './Pager';
import leftDoubleArrow from '@/assets/left-double-arrow.svg';
import rightDoubleArrow from '@/assets/right-double-arrow.svg';
import styles from './index.less';

interface PaginationProps {
  className?: string;
  style?: React.CSSProperties;
  align?: 'center' | 'left' | 'right';
  size?: 'default' | 'small';
  total: number;
  current?: number;
  defaultCurrent?: number;
  defaultPageSize?: number;
  pageSize?: number;
  disabled?: boolean;
  pageSizeOptions?: number[];
  layout: string[]; // sizes, prev, pager, next, jumper, ->, total total 改成函数  'simple': 简约页码(和links不要同时使用)
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    originalElement: React.ReactNode,
  ) => React.ReactNode;
  onChange?: (current: number, pageSize: number) => void;
}

const Pagination = (props: PaginationProps) => {
  const {
    defaultCurrent = 1,
    defaultPageSize = 10,
    total = 0,
    align = 'left',
    size = 'default',
    className = '',
    style = {},
    layout = ['prev', 'pager', 'next'],
    pageSizeOptions = [10, 20, 30, 50, 100],
    disabled = false,
    itemRender,
    onChange,
  } = props;

  const selectRef = useRef<any>(null);

  const [current, setCurrent] = useState<number>(() => {
    return props.current || defaultCurrent;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    return props.pageSize || defaultPageSize;
  });

  const [isFocus, setIsFocus] = useState<boolean>(false);

  const pageBufferSize = 2;

  const totalPages = useMemo(() => {
    const allPages = Math.ceil(total / pageSize);
    return allPages === 0 ? 1 : allPages;
  }, [total, pageSize]);

  const handleChange = (page: number) => {
    if (disabled) return;
    if (!('current' in props)) {
      setCurrent(page);
    }
    if (typeof onChange === 'function') {
      onChange(page, pageSize);
    }
  };

  const handleSelect = (size: number) => {
    setPageSize(size);
    if (!('pageSize' in props)) {
      setPageSize(size);
    }
    if (typeof onChange === 'function') {
      onChange(1, size);
    }
  };

  const handleKeyDown = (event: any) => {
    if (disabled) return;
    if (event.keyCode === 13) {
      let page = parseInt(event.target.value, 10);

      if (!Number.isFinite(page)) return;

      page = Math.max(1, page);
      page = Math.min(totalPages, page);

      if (!('current' in props)) {
        setCurrent(page);
      }

      if (typeof onChange === 'function') {
        onChange(page, pageSize);
      }
    }
  };

  const handleBlur = (event: any) => {
    if (disabled) return;
    let page = parseInt(event.target.value, 10);

    if (!Number.isFinite(page)) return;

    page = Math.max(1, page);
    page = Math.min(totalPages, page);

    if (!('current' in props)) {
      setCurrent(page);
    }

    if (typeof onChange === 'function') {
      onChange(page, pageSize);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    setIsFocus((prev) => !prev);
  };

  const pagerList = useMemo(() => {
    const pagers = [];

    let left = Math.max(1, current - pageBufferSize);
    let right = Math.min(totalPages, current + pageBufferSize);

    if (current <= 5) {
      left = 2;
      right = Math.min(totalPages, left + pageBufferSize * 2 + 1);
    }

    if (totalPages - current <= pageBufferSize * 2 && current > 3) {
      left = totalPages - pageBufferSize * 2 - 2;
    }

    if (left > 1) {
      pagers.push(1);
    }

    if (left > 3) {
      pagers.push('jump-prev');
    }

    for (let i = left; i <= right; i++) {
      pagers.push(i);
    }

    if (right === totalPages - 2) {
      // 此时right:48 所以需要存放49 这一项
      pagers.push(totalPages - 1);
    }

    if (totalPages - current > pageBufferSize * 2 && totalPages > 7) {
      pagers.push('jump-next');
    }

    if (right !== totalPages) {
      pagers.push(totalPages);
    }

    return pagers;
  }, [totalPages, current]);
  console.log(pagerList);

  useEffect(() => {
    if ('current' in props) {
      setCurrent(props.current || 1);
    }
  }, [props.current]);

  useEffect(() => {
    if ('pageSize' in props) {
      setPageSize(props.pageSize || 10);
    }
  }, [props.pageSize]);

  useEffect(() => {
    const elementContains = (elem: HTMLElement, target: any) => {
      let result = false;
      let parent = target.parentNode;
      while (parent) {
        if (parent === elem) {
          result = true;
          return result;
        }
        parent = parent.parentNode;
      }
      return result;
    };

    const handleDocumentClick = (event: Event) => {
      const { target } = event;
      if (!selectRef.current || elementContains(selectRef.current, target)) {
        return;
      }
      setIsFocus(false);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const renderPrevNext = (type: string) => {
    const page = type === 'next' ? current + 1 : current - 1;
    const isDisabled = page < 1 || page > totalPages || disabled;

    const leftArrowSvg = (
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="left"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
      </svg>
    );

    const rightArrowSvg = (
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="right"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
      </svg>
    );

    const defaultNode = type === 'next' ? rightArrowSvg : leftArrowSvg;

    return (
      <div
        key={type}
        className={classnames({
          [styles.paginationItem]: true,
          [styles.pageinationItemDisabled]: isDisabled,
          [styles.prevNextItem]: true,
        })}
        onClick={() => {
          if (isDisabled) return;
          handleChange(page);
        }}
      >
        {typeof itemRender === 'function'
          ? isValidElement(itemRender(page, type as 'next' | 'prev', defaultNode))
          : defaultNode}
      </div>
    );
  };

  const renderJumpPrevNext = (type: string, page: number) => {
    const defaultNode = (
      <img
        src={type === 'jump-next' ? rightDoubleArrow : leftDoubleArrow}
        alt={type}
        className={styles.doubleArrow}
      />
    );
    if (typeof itemRender === 'function') {
      const customNode = itemRender(page, type as 'jump-next' | 'jump-prev', defaultNode);
      return isValidElement(customNode) ? customNode : defaultNode;
    }
    return defaultNode;
  };

  const renderPager = () => {
    return pagerList.map((p) => {
      if (typeof p === 'number') {
        return (
          <Pager
            key={p}
            disabled={disabled}
            active={current === p}
            page={p}
            itemRender={itemRender}
            onClick={handleChange}
          />
        );
      }
      if (typeof p === 'string') {
        let page =
          p === 'jump-next' ? current + pageBufferSize * 2 + 1 : current - (pageBufferSize * 2 - 1);
        page = Math.max(1, page);
        page = Math.min(totalPages, page);
        return (
          <div
            key={p}
            className={classnames({
              [styles.paginationItem]: true,
              [styles.arrowItemDisabled]: disabled,
              [styles.arrowItem]: true,
            })}
            onClick={() => handleChange(page)}
          >
            {renderJumpPrevNext(p, page)}
          </div>
        );
      }
    });
  };

  const renderPageSizes = () => {
    return (
      <div key="sizes" ref={selectRef} className={styles.selectSection} onClick={handleClick}>
        <div
          className={classnames({
            [styles.selector]: true,
            [styles.selectorFocus]: isFocus,
            [styles.disabledSelector]: disabled,
          })}
        >
          <span className={styles.selectItem}>{`${pageSize}条/页`}</span>
          <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="3434"
            width="2em"
            height="2em"
          >
            <path
              d="M533.333333 605.866667L341.333333 413.866667l29.866667-29.866667 162.133333 162.133333L695.466667 384l29.866666 29.866667-192 192z"
              fill="#cdcdcd"
              p-id="3435"
            ></path>
          </svg>
        </div>
        <div
          className={classnames({ [styles.selectList]: true, [styles.showSelectList]: isFocus })}
        >
          {pageSizeOptions.map((p) => {
            return (
              <div
                className={classnames({
                  [styles.optionItem]: true,
                  [styles.optionActiveItem]: pageSize === p,
                })}
                key={p}
                onClick={() => handleSelect(p)}
              >
                {`${p}条/页`}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderJumper = () => {
    return (
      <div
        key="jumper"
        className={classnames({
          [styles.jumperSection]: true,
          [styles.disabledJumperSection]: disabled,
        })}
      >
        跳至
        <input type="text" disabled={disabled} onKeyDown={handleKeyDown} onBlur={handleBlur} />页
      </div>
    );
  };

  const cls = classnames({
    [styles.container]: true,
    [styles.small]: size === 'small',
    [styles.center]: align === 'center',
    [styles.right]: align === 'right',
    [className]: !!className,
  });

  return (
    <div className={cls} style={style}>
      {layout.map((layoutType) => {
        switch (layoutType) {
          case 'pager':
            return renderPager();
          case 'sizes':
            return renderPageSizes();
          case 'prev':
          case 'next':
            return renderPrevNext(layoutType);
          case 'jumper':
            return renderJumper();
          default:
            if (typeof layoutType === 'function') {
              return (
                <div className={styles.info} key="infos">
                  {(layoutType as any)({ current, total, pageSize })}
                </div>
              );
            }
            return null;
        }
      })}
    </div>
  );
};
export default Pagination;
