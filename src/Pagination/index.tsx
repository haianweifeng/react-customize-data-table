import React, { useState, useMemo, useEffect, useRef, isValidElement, useContext } from 'react';
import classnames from 'classnames';
import Pager from './Pager';
import Icon from '../Icon';
import { ReactComponent as DownIcon } from '@/assets/down.svg';
import { ReactComponent as LeftArrow } from '@/assets/arrow-left.svg';
import { ReactComponent as RightArrow } from '@/assets/arrow-right.svg';
import { ReactComponent as LeftDoubleArrow } from '@/assets/left-double-arrow.svg';
import { ReactComponent as RightDoubleArrow } from '@/assets/right-double-arrow.svg';
import LocaleContext from '../LocalProvider/context';
import './index.less';
import { PREFIXCLS } from '../utils/constant';

export interface PaginationProps {
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
  layout: string[]; // sizes, prev, pager, next, jumper, function({ current, total, pageSize }): 匿名函数，用来信息展示
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next',
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

  const localeContext = useContext(LocaleContext);
  const locale = localeContext.pagination;

  const selectRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

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
      left = Math.max(1, left);
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

  const handleChange = (page: number) => {
    if (disabled) return;
    if (!('current' in props)) {
      setCurrent(page);
    }
    if (typeof onChange === 'function') {
      onChange(page, pageSize);
    }
  };

  const handleSelect = (sizes: number) => {
    if (!('pageSize' in props)) {
      setPageSize(sizes);
    }
    if (!('current' in props)) {
      setCurrent(1);
    }
    if (typeof onChange === 'function') {
      onChange(1, sizes);
    }
  };

  const handleJumper = (event: any) => {
    let page = parseInt(event.target.value, 10);

    if (!Number.isFinite(page)) return;

    page = Math.max(1, page);
    page = Math.min(totalPages, page);

    inputRef.current.value = '';

    if (!('current' in props)) {
      setCurrent(page);
    }

    if (typeof onChange === 'function') {
      onChange(page, pageSize);
    }
  };

  const handleKeyDown = (event: any) => {
    if (disabled) return;
    if (event.keyCode === 13) {
      handleJumper(event);
    }
  };

  const handleBlur = (event: any) => {
    if (disabled) return;
    handleJumper(event);
  };

  const handleClick = () => {
    if (disabled) return;
    setIsFocus((prev) => !prev);
  };

  useEffect(() => {
    if ('current' in props) {
      setCurrent(props.current || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.current]);

  useEffect(() => {
    if ('pageSize' in props) {
      setPageSize(props.pageSize || 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const renderJumpPrevNext = (type: string, page: number) => {
    return (
      <div
        key={type}
        className={classnames({
          [`${PREFIXCLS}-pagination-item`]: true,
          [`${PREFIXCLS}-pagination-item-more`]: true,
          [`${PREFIXCLS}-pagination-item-more-disabled`]: disabled,
        })}
        onClick={() => handleChange(page)}
      >
        <Icon
          component={type === 'jump-next' ? RightDoubleArrow : LeftDoubleArrow}
          className={`${PREFIXCLS}-pagination-double-arrow-icon`}
        />
      </div>
    );
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
          p === 'jump-next'
            ? current + (pageBufferSize * 2 + 1)
            : current - (pageBufferSize * 2 + 1);
        page = Math.max(1, page);
        page = Math.min(totalPages, page);
        return renderJumpPrevNext(p, page);
      }
    });
  };

  const renderPageSizes = () => {
    return (
      <div
        key="sizes"
        ref={selectRef}
        className={`${PREFIXCLS}-pagination-pagesize`}
        onClick={handleClick}
      >
        <div
          className={classnames({
            [`${PREFIXCLS}-pagination-select-inner`]: true,
            [`${PREFIXCLS}-pagination-select-focus`]: isFocus,
            [`${PREFIXCLS}-pagination-select-disabled`]: disabled,
          })}
        >
          <span
            className={`${PREFIXCLS}-pagination-select-result`}
          >{`${pageSize}${locale.items_per_page}`}</span>
          <Icon component={DownIcon} className={`${PREFIXCLS}-pagination-down-icon`} />
        </div>
        <div
          className={classnames({
            [`${PREFIXCLS}-pagination-pagesize-list`]: true,
            [`${PREFIXCLS}-pagination-pagesize-list-show`]: isFocus,
          })}
        >
          {pageSizeOptions.map((p) => {
            return (
              <div
                className={classnames({
                  [`${PREFIXCLS}-pagination-select-option`]: true,
                  [`${PREFIXCLS}-pagination-select-option-active`]: pageSize === p,
                })}
                key={p}
                onClick={() => handleSelect(p)}
              >
                {`${p}${locale.items_per_page}`}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPrevNext = (type: string) => {
    const page = type === 'next' ? current + 1 : current - 1;
    const isDisabled = page < 1 || page > totalPages || disabled;

    const originalElement = (
      <Icon
        component={type === 'next' ? RightArrow : LeftArrow}
        className={`${PREFIXCLS}-pagination-arrow-icon`}
      />
    );

    const defaultNode = (
      <div
        key={type}
        className={classnames({
          [`${PREFIXCLS}-pagination-item`]: true,
          [`${PREFIXCLS}-pageination-item-disabled`]: isDisabled,
        })}
        onClick={() => {
          if (isDisabled) return;
          handleChange(page);
        }}
      >
        {originalElement}
      </div>
    );

    if (typeof itemRender === 'function') {
      const content = itemRender(page, type as 'next' | 'prev', originalElement);
      return isValidElement(content) ? (
        <div
          key={type}
          className={classnames({
            [`${PREFIXCLS}-pagination-custom-item`]: true,
            [`${PREFIXCLS}-pagination-custom-item-disabled`]: isDisabled,
          })}
          onClick={() => {
            if (isDisabled) return;
            handleChange(page);
          }}
        >
          {content}
        </div>
      ) : (
        defaultNode
      );
    } else {
      return defaultNode;
    }
  };

  const renderJumper = () => {
    return (
      <div
        key="jumper"
        className={classnames({
          [`${PREFIXCLS}-pagination-jumper`]: true,
          [`${PREFIXCLS}-pagination-jumper-disabled`]: disabled,
        })}
      >
        {locale.jump_to}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        {locale.page}
      </div>
    );
  };

  const cls = classnames({
    [`${PREFIXCLS}-pagination-container`]: true,
    [`${PREFIXCLS}-pagination-small`]: size === 'small',
    [`${PREFIXCLS}-pagination-center`]: align === 'center',
    [`${PREFIXCLS}-pagination-right`]: align === 'right',
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
                <div className={`${PREFIXCLS}-pagination-info`} key="infos">
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
