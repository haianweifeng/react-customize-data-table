import React, { useMemo, useCallback } from 'react';
import classnames from 'classnames';
import type {
  ColumnsWithType,
  ColumnsGroupWithType,
  ExpandableType,
  RowSelectionType,
  SorterStateType,
  FilterStateType,
} from '../interface';
import Checkbox from '../Checkbox';
import Sorter from '../Sorter';
import Filter from '../Filter';

interface TheadProps<T> {
  sorterState: SorterStateType<T>[];
  filterState: FilterStateType<T>[];
  checked: boolean | 'indeterminate';
  expandable?: ExpandableType<T>;
  rowSelection?: RowSelectionType<T>;
  columns: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[];
  onSelectAll: (selected: boolean) => void;
  onSort: (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => void;
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  onFilterChange: (col: ColumnsWithType<T> & { colSpan: number }, filteredValue: string[]) => void;
}

function Thead<T>(props: TheadProps<T>) {
  const {
    checked,
    columns,
    sorterState,
    filterState,
    expandable,
    rowSelection,
    renderSorter,
    onSelectAll,
    onSort,
    onFilterChange,
  } = props;

  const isColumnGroup = useCallback((col: ColumnsWithType<T> | ColumnsGroupWithType<T>) => {
    if (typeof (col as ColumnsGroupWithType<T>).children !== 'undefined') {
      return true;
    }
    return false;
  }, []);

  const getFormatColumns = useCallback(
    (
      cols: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[],
      target?: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & { colSpan: number },
    ) => {
      const formatColumns: ((ColumnsWithType<T> | ColumnsGroupWithType<T>) & {
        colSpan: number;
      })[] = [];

      cols.map((col) => {
        if (isColumnGroup(col)) {
          const obj = { ...col, colSpan: 0 };
          (obj as any).children = getFormatColumns((col as any).children, obj);
          if (target) {
            target.colSpan += obj.colSpan;
          }
          formatColumns.push(obj);
        } else {
          if (target) {
            target.colSpan += 1;
          }
          if (col?.headerColSpan === 0) return;
          formatColumns.push({ colSpan: col?.headerColSpan || 1, ...col });
        }
      });

      return formatColumns;
    },
    [isColumnGroup],
  );

  const computeTrs = useCallback((cols: any, level = 0, trs: React.ReactNode[][]) => {
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      if (!Array.isArray(trs[level])) {
        trs[level] = [];
      }
      if (col?.children && col.children.length) {
        computeTrs(col.children, level + 1, trs);
      }
    }
  }, []);

  const handleChange = useCallback(
    (selected: boolean) => {
      onSelectAll(selected);
    },
    [onSelectAll],
  );

  const handleSortChange = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => {
      onSort(col, order);
    },
    [onSort],
  );

  const renderSelection = useCallback(
    (key: string, rowSpan: number) => {
      if (rowSelection?.columnTitle) {
        return (
          <th key={key} rowSpan={rowSpan} className="selection-expand-column">
            {rowSelection.columnTitle}
          </th>
        );
      }
      if (rowSelection?.type === 'radio') {
        return <th key={key} rowSpan={rowSpan} />;
      }
      return (
        <th key={key} rowSpan={rowSpan} className="selection-expand-column">
          <Checkbox checked={checked} onChange={handleChange} />
        </th>
      );
    },
    [checked, rowSelection, handleChange],
  );

  const renderExpand = useCallback(
    (key: string, rowSpan: number) => {
      if (expandable?.columnTitle) {
        return (
          <th key={key} rowSpan={rowSpan}>
            {expandable.columnTitle}
          </th>
        );
      }
      return <th key={key} rowSpan={rowSpan} />;
    },
    [expandable],
  );

  const renderSorterContent = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number }) => {
      const item = sorterState.find((s) => s.dataIndex === col.dataIndex);
      return (
        <Sorter
          activeAsc={item?.order === 'asc'}
          activeDesc={item?.order === 'desc'}
          renderSorter={renderSorter}
          onChange={(order) => {
            handleSortChange(col, order);
          }}
        />
      );
    },
    [sorterState, renderSorter, handleSortChange],
  );

  const renderFilterContent = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number }) => {
      const curr = filterState.find((f) => f.dataIndex === col.dataIndex);
      return (
        <Filter
          filters={col.filters!}
          filterIcon={col.filterIcon}
          filterMultiple={col.filterMultiple !== false}
          filteredValue={curr?.filteredValue || []}
          filterSearch={col?.filterSearch}
          onReset={() => {
            onFilterChange(col, []);
          }}
          onChange={(checkedValue: string[]) => {
            onFilterChange(col, checkedValue);
          }}
        />
      );
    },
    [onFilterChange, filterState],
  );

  const renderTh = useCallback(
    (
      col: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & { colSpan: number },
      trs: React.ReactNode[][],
      level: number,
      index: string,
    ) => {
      const totalLevel = trs.length;
      const cls = classnames({
        'table-align-center': col.align === 'left',
        'table-align-right': col.align === 'right',
      });
      switch (col.type) {
        case 'checkbox':
        case 'radio':
          return trs[level].push(renderSelection(index, totalLevel));
        case 'expanded':
          return trs[level].push(renderExpand(index, totalLevel));
        default: {
          if (isColumnGroup(col)) {
            trs[level].push(
              <th key={index} colSpan={col.colSpan}>
                <div>
                  <span>{col.title}</span>
                </div>
              </th>,
            );
            (col as any).children.forEach((c: any, i: number) => {
              renderTh(c, trs, level + 1, `${index}_${i}`);
            });
          } else {
            trs[level].push(
              <th colSpan={col.colSpan} rowSpan={totalLevel - level} key={index} className={cls}>
                <div className="has-sorter-filter">
                  <span className="column-title">{col.title}</span>
                  <div className="sorter-filter">
                    {col.sorter
                      ? renderSorterContent(col as ColumnsWithType<T> & { colSpan: number })
                      : null}
                    {col.filters
                      ? renderFilterContent(col as ColumnsWithType<T> & { colSpan: number })
                      : null}
                  </div>
                </div>
              </th>,
            );
          }
        }
      }
    },
    [renderSelection, renderExpand, renderSorterContent, renderFilterContent, isColumnGroup],
  );

  const headerTrs = useMemo(() => {
    const trs: React.ReactNode[][] = [];
    computeTrs(columns, 0, trs);
    const formatColumns = getFormatColumns(columns);
    formatColumns.forEach((col, i: number) => renderTh(col, trs, 0, `${i}`));
    return trs;
  }, [columns, computeTrs, getFormatColumns, renderTh]);

  return (
    <thead>
      {headerTrs.map((tr, i) => {
        return <tr key={i}>{tr}</tr>;
      })}
    </thead>
  );
}
export default Thead;
