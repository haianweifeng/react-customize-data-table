import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import Checkbox from '../Checkbox';
import Radio from '../Radio';
import Icon from '../Icon';
import { ReactComponent as FilterIcon } from '@/assets/filter.svg';
import { ReactComponent as QueryIcon } from '@/assets/query.svg';
import { ReactComponent as EmptyIcon } from '@/assets/empty.svg';
import type { FilterMenusType, LocalType } from '../interface';
import './index.less';
import { generateUUID } from '../utils/util';

interface FilterProps {
  locale: LocalType;
  filters: FilterMenusType[];
  filterMultiple: boolean;
  filteredValue: string[];
  onReset: () => void;
  onChange: (filteredValue: string[]) => void;
  filterIcon?: (filtered: boolean) => React.ReactNode;
  filterSearch?: ((value: string, record: FilterMenusType) => boolean) | boolean;
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
  const [checkedValue, setCheckedValue] = useState<string[]>(filteredValue);

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

  const elementContains = useCallback((elem: HTMLElement, target: any) => {
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
  }, []);

  const handleDocumentClick = useCallback(
    (event: Event) => {
      const { target } = event;
      if (
        !filterContainerRef.current ||
        elementContains(filterContainerRef.current, target) ||
        !popperRef.current ||
        elementContains(popperRef.current, target)
      ) {
        return;
      }
      if (!isEqual(checkedValue, filteredValue)) {
        onChange(checkedValue);
      }
      setSearchValue('');
      setVisible(false);
      document.removeEventListener('click', handleDocumentClick);
      event.stopPropagation();
    },
    [checkedValue, filteredValue, onChange, elementContains],
  );

  const handleReset = () => {
    onReset();
    setSearchValue('');
    setCheckedValue([]);
    setVisible(false);
    document.removeEventListener('click', handleDocumentClick);
  };

  const handleFilter = () => {
    onChange(checkedValue);
    setSearchValue('');
    setVisible(false);
    document.removeEventListener('click', handleDocumentClick);
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
    const el = popperRef.current;
    if (el) {
      const position = getPosition();
      if (position) {
        Object.keys(position).map((prop) => {
          (el.style as any)[prop] = `${(position as any)[prop]}px`;
        });
      }
      popperPlaceholder.appendChild(el);
    }
  };

  const handleClick = () => {
    if (!visible) {
      createPopper();
    }
    setVisible((prev) => !prev);
  };

  useEffect(() => {
    const removePopper = () => {
      const popperPlaceholder = document.querySelector(`.${popperClass.current}`);
      popperPlaceholder && document.body.removeChild(popperPlaceholder);
    };

    return () => {
      removePopper();
      document.removeEventListener('click', handleDocumentClick);
    };
    // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visible) {
      document.addEventListener('click', handleDocumentClick);
    }
  }, [visible, handleDocumentClick]);

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

  return (
    <>
      <div className="filter-container" ref={filterContainerRef} onClick={handleClick}>
        {typeof filterIcon === 'function' ? (
          filterIcon(!!filteredValue.length)
        ) : (
          <Icon
            component={FilterIcon}
            className={classnames({
              'filter-icon': true,
              'filter-icon-active': filteredValue.length,
            })}
          />
        )}
      </div>
      <div
        ref={popperRef}
        className={classnames({
          'filter-popper': true,
          'filter-popper-show': visible,
          'filter-popper-hidden': !visible,
        })}
      >
        {!!filterSearch && filters.length ? (
          <div className="filter-search">
            <div
              className={classnames({
                'search-input-wrap': true,
                'search-input-wrap-focus': isFocus,
              })}
            >
              <div className="input-prefix">
                <Icon component={QueryIcon} />
              </div>
              <input
                type="text"
                placeholder={locale?.filterSearchPlaceholder}
                className="search-input"
                value={searchValue}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleSearch}
              />
            </div>
          </div>
        ) : null}
        <div className="filter-list">
          {!filters.length && (
            <div className="filter-empty">
              <Icon component={EmptyIcon} className="filter-empty-icon" />
              <span>{locale?.filterEmptyText}</span>
            </div>
          )}
          {filters.length > 0 && !filterOptions.length && !!filterSearch && (
            <div className="filter-empty">
              <span>{locale?.filterResult}</span>
            </div>
          )}
          {filterOptions.map((f) => {
            return (
              <div className="filter-item" key={f.value}>
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
        <div className="filter-footer">
          <div
            className={classnames({
              'filter-btn': true,
              'filter-btn-disabled': !checkedValue.length,
            })}
            onClick={handleFilter}
          >
            {locale?.filterConfirm}
          </div>
          <div
            className={classnames({
              'filter-btn': true,
              'filter-btn-disabled': !checkedValue.length,
            })}
            onClick={handleReset}
          >
            {locale?.filterReset}
          </div>
        </div>
      </div>
    </>
  );
};
export default Filter;
