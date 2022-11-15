import React, { useState, useEffect, useMemo } from 'react';
import { usePopper } from 'react-popper';
import classnames from 'classnames';
import Checkbox from '../Checkbox';
import Radio from '../Radio';
import FilterIcon from '@/assets/filter.svg';
import FilterActiveIcon from '@/assets/filter-active.svg';
import QueryIcon from '@/assets/query.svg';
import EmptyIcon from '@/assets/empty.svg';
import type { FilterMenusType } from '../interface';
import styles from './index.less';

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
      <div className={styles.filterContainer} ref={setReferenceElement} onClick={handleClick}>
        {typeof filterIcon === 'function' ? (
          filterIcon(!!filteredValue.length)
        ) : (
          <img
            src={filteredValue.length ? FilterActiveIcon : FilterIcon}
            alt="filter-icon"
            className={styles.filterIcon}
          />
        )}
      </div>
      <div
        ref={setPopperElement}
        className={classnames({
          [styles.popper]: true,
          [styles.popperShow]: visible,
          [styles.popperHidden]: !visible,
        })}
        style={popperStyle.popper}
        {...attributes.popper}
      >
        {!!filterSearch && filters.length ? (
          <div className={styles.filterSearch}>
            <div className={classnames({ [styles.inputWrap]: true, [styles.focused]: isFocus })}>
              <div className={styles.inputPrefix}>
                <img src={QueryIcon} alt="query" />
              </div>
              <input
                type="text"
                placeholder="在筛选项中搜索"
                className={styles.searchInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleSearch}
              />
            </div>
          </div>
        ) : null}
        <div className={styles.filterList}>
          {!filters.length && (
            <div className={styles.emptySection}>
              <img src={EmptyIcon} alt="empty" />
              <span>No filters</span>
            </div>
          )}
          {!filterOptions.length && !!filterSearch && (
            <div className={styles.emptySection}>
              <span>Not Found</span>
            </div>
          )}
          {filterOptions.map((f) => {
            return (
              <div className={styles.filterItem} key={f.value}>
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
        <div className={styles.filterFooter}>
          <div
            className={classnames({
              [styles.filterBtn]: true,
              [styles.disabled]: !checkedValue.length,
            })}
            onClick={handleFilter}
          >
            筛选
          </div>
          <div
            className={classnames({
              [styles.filterBtn]: true,
              [styles.disabled]: !checkedValue.length,
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
