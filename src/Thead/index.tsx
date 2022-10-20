import React, { useMemo } from 'react';
import {
  ColumnsWithType,
  ColumnsGroupWithType,
  ExpandableType,
  RowSelectionType,
} from '../interface';
import Checkbox from '../Checkbox';

interface TheadProps<T> {
  checked: boolean | 'indeterminate';
  expandable?: ExpandableType<T>;
  rowSelection?: RowSelectionType<T>;
  columns: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[];
}

function Thead<T>(props: TheadProps<T>) {
  const { checked, columns, expandable, rowSelection } = props;

  const isColumnGroup = (col: ColumnsWithType<T> | ColumnsGroupWithType<T>) => {
    if (typeof (col as ColumnsGroupWithType<T>).children !== 'undefined') {
      return true;
    }
    return false;
  };

  const getFormatColumns = (
    cols: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[],
    target?: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & { colSpan: number },
  ) => {
    return cols.map((col) => {
      if (isColumnGroup(col)) {
        const obj = { ...col, colSpan: 0 };
        (obj as any).children = getFormatColumns((col as any).children, obj);
        if (target) {
          target.colSpan += obj.colSpan;
        }
        return obj;
      } else {
        if (target) {
          target.colSpan += 1;
        }
        return { colSpan: 1, ...col };
      }
    });
  };

  const computeTrs = (cols: any, level = 0, trs: React.ReactNode[][]) => {
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      if (!Array.isArray(trs[level])) {
        trs[level] = [];
      }
      if (col?.children && col.children.length) {
        computeTrs(col.children, level + 1, trs);
      }
    }
  };

  const renderExpand = (key: string) => {
    if (expandable?.columnTitle) {
      return <th key={key}>{expandable.columnTitle}</th>;
    }
    return <th key={key} />;
  };

  const renderSelection = (key: string) => {
    if (rowSelection?.columnTitle) {
      return <th key={key}>{rowSelection.columnTitle}</th>;
    }
    if (rowSelection?.type === 'radio') {
      return <th key={key} />;
    }
    return (
      <th key={key} className="selection-expand-column">
        <Checkbox
          checked={checked}
          onChange={(selected: boolean, event: Event) => {
            // handleSelect(isRadio, rowData, selected, event);
          }}
        />
      </th>
    );
  };

  const renderTh = (
    col: ColumnsWithType<T> | ColumnsGroupWithType<T>,
    trs: React.ReactNode[][],
    level: number,
    index: string,
  ) => {
    const totalLevel = trs.length;
    switch (col.type) {
      case 'checkbox':
      case 'radio':
        return trs[level].push(renderSelection(index));
      case 'expanded':
        return trs[level].push(renderExpand(index));
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
            // todo column.headerColSpan  头部列数
            <th colSpan={1} rowSpan={totalLevel - level} key={index}>
              <div>
                <span>{col.title}</span>
              </div>
            </th>,
          );
        }
      }
    }
  };

  const headerTrs = useMemo(() => {
    const trs: React.ReactNode[][] = [];
    computeTrs(columns, 0, trs);
    const formatColumns = getFormatColumns(columns);
    formatColumns.forEach((col, i: number) => renderTh(col, trs, 0, `${i}`));
    return trs;
  }, [columns, renderTh]);

  return (
    <thead>
      {headerTrs.map((tr, i) => {
        return <tr key={i}>{tr}</tr>;
      })}
    </thead>
  );
}
export default Thead;
