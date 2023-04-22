import { ReactComponent as EmptyIcon } from '@/assets/empty.svg';
import { ReactComponent as FilterIcon } from '@/assets/filter.svg';
import { ReactComponent as QueryIcon } from '@/assets/query.svg';
import classnames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Checkbox from '../Checkbox';
import Icon from '../Icon';
import type { FilterMenus } from '../interface';
import Radio from '../Radio';
import { PREFIXCLS } from '../utils/constant';
import { generateUUID } from '../utils/util';
import './index.less';

interface FilterProps {
  locale: Record<string, string>;
  filters: FilterMenus[];
  filterMultiple: boolean;
  filteredValue: React.Key[];
  onReset: () => void;
  onChange: (filteredValue: React.Key[]) => void;
  filterIcon?: (filtered: boolean) => React.ReactNode;
  filterSearch?: ((value: string, record: FilterMenus) => boolean) | boolean;
}

const Filter = (props: FilterProps) => {
  const {
    locale,
    filters,
    filterMultiple,
    filteredValue,
    onReset,
    onChange,
    filterIcon,
    filterSearch,
  } = props;

  const filterContainerRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const popperClass = useRef<string>();

  const [visible, setVisible] = useState<boolean>(false);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [checkedValue, setCheckedValue] = useState<React.Key[]>(filteredValue);

  const handleFocus = () => {
    setIsFocus(true);
  };

  const handleBlur = () => {
    setIsFocus(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchValue(value);
  };

  const handleChange = (value: string, checked: boolean, isMultiple = true) => {
    if (checked) {
      setCheckedValue((prev) => (isMultiple ? [...prev, value] : [value]));
    } else {
      setCheckedValue((prev) => {
        return prev.filter((p) => p !== value);
      });
    }
  };

  const handleReset = () => {
    onReset();
    setSearchValue('');
    setCheckedValue([]);
    setVisible(false);
  };

  const handleFilter = () => {
    onChange(checkedValue);
    setSearchValue('');
    setVisible(false);
  };

  const getPosition = () => {
    const el = filterContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

    return {
      left: scrollLeft + rect.left + rect.width / 2,
      top: scrollTop + rect.top + rect.height,
    };
  };

  const filterOptions = useMemo(() => {
    return filters.filter((f) => {
      const value = searchValue.trim();
      if (typeof filterSearch === 'function') {
        return filterSearch(value, f);
      }
      if (typeof filterSearch === 'boolean') {
        return f.label?.toString().toLowerCase().includes(value.toLowerCase());
      }
      return true;
    });
  }, [searchValue, filters, filterSearch]);

  const createPopper = () => {
    let popperPlaceholder =
      popperClass.current && document.querySelector(`.${popperClass.current}`);
    if (!popperPlaceholder) {
      const div = document.createElement('div');
      popperClass.current = `popper-placeholder-${generateUUID()}`;
      div.classList.add(popperClass.current);
      div.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%;');
      document.body.appendChild(div);
      popperPlaceholder = div;
    }
    const position = getPosition();
    const styles: React.CSSProperties = {};
    if (position) {
      Object.keys(position).map((prop) => {
        (styles as any)[prop] = `${(position as any)[prop]}px`;
      });
    }
    const el = (
      <div
        ref={popperRef}
        // className={classnames({
        //   [`${PREFIXCLS}-filter-popper`]: true,
        //   [`${PREFIXCLS}-filter-popper-show`]: visible,
        //   [`${PREFIXCLS}-filter-popper-hidden`]: !visible,
        // })}
        className={`${PREFIXCLS}-filter-popper`}
        style={styles}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
        }}
      >
        {!!filterSearch && filters.length ? (
          <div className={`${PREFIXCLS}-filter-search`}>
            <div
              className={classnames({
                [`${PREFIXCLS}-search-wrap`]: true,
                [`${PREFIXCLS}-search-wrap-focus`]: isFocus,
              })}
            >
              <div className={`${PREFIXCLS}-filter-input-prefix`}>
                <Icon component={QueryIcon} />
              </div>
              <input
                type="text"
                placeholder={locale?.filterSearchPlaceholder}
                className={`${PREFIXCLS}-filter-search-input`}
                value={searchValue}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleSearch}
              />
            </div>
          </div>
        ) : null}
        <div className={`${PREFIXCLS}-filter-list`}>
          {!filters.length && (
            <div className={`${PREFIXCLS}-filter-empty`}>
              <Icon component={EmptyIcon} className={`${PREFIXCLS}-filter-empty-icon`} />
              <span>{locale?.filterEmptyText}</span>
            </div>
          )}
          {filters.length > 0 && !filterOptions.length && !!filterSearch && (
            <div className={`${PREFIXCLS}-filter-empty`}>
              <span>{locale?.filterResult}</span>
            </div>
          )}
          {filterOptions.map((f) => {
            return (
              <div className={`${PREFIXCLS}-filter-item`} key={f.value}>
                {filterMultiple ? (
                  <Checkbox
                    checked={checkedValue.indexOf(f.value) >= 0}
                    onChange={(checked: boolean) => {
                      handleChange(f.value, checked);
                    }}
                  >
                    {f.label}
                  </Checkbox>
                ) : (
                  <Radio
                    checked={checkedValue.indexOf(f.value) >= 0}
                    onChange={(checked: boolean) => {
                      handleChange(f.value, checked, false);
                    }}
                  >
                    {f.label}
                  </Radio>
                )}
              </div>
            );
          })}
        </div>
        <div className={`${PREFIXCLS}-filter-footer`}>
          <div
            className={classnames({
              [`${PREFIXCLS}-filter-btn`]: true,
              [`${PREFIXCLS}-filter-btn-disabled`]: !checkedValue.length,
            })}
            onClick={handleFilter}
          >
            {locale?.filterConfirm}
          </div>
          <div
            className={classnames({
              [`${PREFIXCLS}-filter-btn`]: true,
              [`${PREFIXCLS}-filter-btn-disabled`]: !checkedValue.length,
            })}
            onClick={handleReset}
          >
            {locale?.filterReset}
          </div>
        </div>
      </div>
    );
    return createPortal(el, popperPlaceholder);
  };

  const handleClick = (event: React.MouseEvent) => {
    setVisible((prev) => !prev);
    event.stopPropagation();
  };

  useEffect(() => {
    const removePopper = () => {
      const popperPlaceholder = document.querySelector(`.${popperClass.current}`);
      popperPlaceholder && document.body.removeChild(popperPlaceholder);
    };

    return () => {
      removePopper();
    };
  }, []);

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
      if (
        !filterContainerRef.current ||
        elementContains(filterContainerRef.current, target) ||
        !popperRef.current ||
        elementContains(popperRef.current, target)
      ) {
        return;
      }
      onChange(checkedValue);
      setSearchValue('');
      setVisible(false);
      event.stopPropagation();
    };
    if (visible) {
      document.addEventListener('click', handleDocumentClick);
    } else {
      document.removeEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [visible, onChange, checkedValue]);

  return (
    <>
      <div
        className={`${PREFIXCLS}-filter-container`}
        ref={filterContainerRef}
        onClick={handleClick}
      >
        {typeof filterIcon === 'function' ? (
          filterIcon(!!filteredValue.length)
        ) : (
          <Icon
            component={FilterIcon}
            className={classnames({
              [`${PREFIXCLS}-filter-icon`]: true,
              [`${PREFIXCLS}-filter-icon-active`]: filteredValue.length,
            })}
          />
        )}
      </div>
      {visible ? createPopper() : null}
    </>
  );
};
export default Filter;
