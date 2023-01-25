import React, { useRef, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import type { CellProps } from '../interface';
import type { TableProps } from '../Table';
import Td from '../Td';
import { getParent } from '../utils/util';

interface TrProps<T> extends TableProps<T> {
  scrollLeft: number;
  offsetRight: number;
  cols: CellProps[];
  rowData: T;
  rowIndex: number;
  checked: 'indeterminate' | boolean;
  expanded: boolean;
  onUpdateRowHeight: (height: number, rowIndex: number) => void;
}

function Tr<T>(props: TrProps<T>) {
  const {
    scrollLeft,
    offsetRight,
    cols,
    rowData,
    rowIndex,
    checked,
    expandable,
    expanded,
    striped,
    bordered,
    rowClassName,
    onRow,
    onUpdateRowHeight,
  } = props;

  const trRef = useRef<HTMLTableRowElement>(null);
  const expandTrRef = useRef<HTMLTableRowElement>(null);
  const [rowHeight, setRowHeight] = useState<number>(0);

  // todo
  // 1.待验证如果是动态改变数据长度 是否能触发 现在是监听了rowIndex 如果数据长度改变相当于rowIndex 改变了
  // 2. 待验证如果列改变是否能触发
  useEffect(() => {
    if (!trRef.current) return;
    let { height } = trRef.current.getBoundingClientRect();
    if (Number.isNaN(height)) height = 0;
    let expandHeight = 0;
    if (expandTrRef.current) {
      expandHeight = expandTrRef.current.clientHeight;
    }
    const newHeight = height + expandHeight;
    if (newHeight !== rowHeight) {
      // console.log(`lastRowHeight: ${rowHeight}`);
      // console.log(`rowIndex: ${rowIndex}`);
      setRowHeight(newHeight);
      onUpdateRowHeight(newHeight, rowIndex);
    }
  }, [rowIndex, cols, expanded, rowHeight, onUpdateRowHeight]);

  const renderTds = () => {
    const tds = [];
    for (let i = 0; i < cols.length; i++) {
      const column = cols[i];
      if (!column.colSpan || !column.rowSpan) continue;
      const ignoreRightBorder = !!(
        bordered &&
        (i === cols.length - 1 || column.colSpan === cols.length)
      );
      tds.push(
        <Td
          key={i}
          {...column}
          scrollLeft={scrollLeft}
          offsetRight={offsetRight}
          ignoreRightBorder={ignoreRightBorder}
        />,
      );
    }

    return tds;
  };

  const renderExpandRow = () => {
    if (
      !expandable ||
      !expandable?.expandedRowRender ||
      !expanded ||
      (expandable?.rowExpandable && !expandable?.rowExpandable(rowData))
    )
      return;

    const cls =
      expandable?.expandedRowClassName && expandable.expandedRowClassName(rowData, rowIndex);
    const existFixed = cols.some((c) => c.fixed === 'left' || c.fixed === 'right');
    const styles = existFixed ? { transform: `translate(${scrollLeft}px, 0)` } : {};
    return (
      <tr key="1" className={cls} ref={expandTrRef}>
        <td
          colSpan={cols.length}
          style={styles}
          className={classnames({ 'cell-ignore-right-border': bordered })}
        >
          {expandable.expandedRowRender(rowData, rowIndex, expanded)}
        </td>
      </tr>
    );
  };

  const clsInfo: any = {
    'row-even': striped && rowIndex % 2 !== 0,
    'row-odd': striped && rowIndex % 2 === 0,
    'row-selected': checked,
  };

  if (rowClassName && rowClassName(rowData, rowIndex)) {
    clsInfo[rowClassName(rowData, rowIndex)] = !!rowClassName(rowData, rowIndex);
  }

  const cls = classnames(clsInfo);

  const rowProps = useMemo(() => {
    if (typeof onRow === 'function') {
      return onRow(rowData, rowIndex);
    }
    return {};
  }, [rowData, rowIndex, onRow]);

  const handleRowClick = (event: any) => {
    const parent = getParent(event.target, '.selection-expand-column');
    if (parent) return;
    if (typeof rowProps?.onClick === 'function') {
      rowProps?.onClick(event);
    }
  };

  return (
    <>
      <tr key="0" className={cls} ref={trRef} {...rowProps} onClick={handleRowClick}>
        {renderTds()}
      </tr>
      {renderExpandRow()}
    </>
  );
}
export default Tr;
