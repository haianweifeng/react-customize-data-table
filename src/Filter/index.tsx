import React, { useState, useEffect, useMemo } from 'react';
import { usePopper } from 'react-popper';
import classnames from 'classnames';
import Checkbox from '../Checkbox';
import Radio from '../Radio';
import Icon from '../Icon';
import { ReactComponent as FilterIcon } from '@/assets/filter.svg';
import { ReactComponent as QueryIcon } from '@/assets/query.svg';
import { ReactComponent as EmptyIcon } from '@/assets/empty.svg';
import type { FilterMenusType } from '../interface';
import './index.less';

interface FilterProps {
  filters: FilterMenusType[];
  filterMultiple: boolean;
  filteredValue: string[];
  onReset: () => void;
  onChange: (filteredValue: string[]) => void;
  filterIcon?: (filtered: boolean) => React.ReactNode;
  filterSearch?: ((value: string, record: FilterMenusType) => boolean) | boolean;
}

const Filter = (props: FilterProps) => {
  const { filters, filterMultiple, filteredValue, onReset, onChange, filterIcon, filterSearch } =
    props;

  const [visible, setVisible] = useState<boolean>(false);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [checkedValue, setCheckedValue] = useState<string[]>(filteredValue);

  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const { styles: popperStyle, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-end',
  });

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
    setCheckedValue([]);
    setVisible(false);
  };

  const handleFilter = () => {
    onChange(checkedValue);
    setVisible(false);
  };

  const handleClick = () => {
    setVisible((prev) => !prev);
  };

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
        !referenceElement ||
        elementContains(referenceElement, target) ||
        !popperElement ||
        elementContains(popperElement, target)
      ) {
        return;
      }
      setVisible(false);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [referenceElement, popperElement]);

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
      <div className="filter-container" ref={setReferenceElement} onClick={handleClick}>
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
        ref={setPopperElement}
        className={classnames({
          'filter-popper': true,
          'filter-popper-show': visible,
          'filter-popper-hidden': !visible,
        })}
        style={popperStyle.popper}
        {...attributes.popper}
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
                placeholder="在筛选项中搜索"
                className="search-input"
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
              <span>No filters</span>
            </div>
          )}
          {filters.length > 0 && !filterOptions.length && !!filterSearch && (
            <div className="filter-empty">
              <span>Not Found</span>
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
            筛选
          </div>
          <div
            className={classnames({
              'filter-btn': true,
              'filter-btn-disabled': !checkedValue.length,
            })}
            onClick={handleReset}
          >
            重置
          </div>
        </div>
      </div>
    </>
  );
};
export default Filter;
