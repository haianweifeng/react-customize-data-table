import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import type { CellProps } from '../interface';
import type { TableProps } from '../Table';
import Td from '../Td';

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
    onUpdateRowHeight,
  } = props;

  const trRef = useRef<HTMLTableRowElement>(null);
  const expandTrRef = useRef<HTMLTableRowElement>(null);
  const lastRowHeight = useRef<number>(0);
  const lastExpandHeight = useRef<number>(0);
  const lastIndex = useRef<number>();
  const lastCols = useRef<CellProps[]>();
  // console.log(`lastCols: ${lastCols.current}`);

  // todo
  // 1.待验证如果是动态改变数据长度 是否能触发 现在是监听了rowIndex 如果数据长度改变相当于rowIndex 改变了
  // 2. 待验证如果列改变是否能触发
  // useEffect(() => {
  //   if (!trRef.current) return;
  //   const { height } = trRef.current.getBoundingClientRect();
  //   let expandHeight = 0;
  //   if (expanded && expandTrRef.current) {
  //     expandHeight = expandTrRef.current.clientHeight;
  //   }
  //   onUpdateRowHeight(trRef.current, height + expandHeight, rowIndex);
  // }, [cols, expanded, onUpdateRowHeight, rowIndex]);

  useEffect(() => {
    if (!trRef.current) return;
    const colChange = lastCols.current && !isEqual(lastCols.current, cols);
    let { height } = trRef.current.getBoundingClientRect();
    if (Number.isNaN(height)) height = lastRowHeight.current || 0;
    let expandHeight = 0;
    if (expandTrRef.current) {
      expandHeight = expandTrRef.current.clientHeight;
    }
    if (
      height === lastRowHeight.current &&
      expandHeight === lastExpandHeight.current &&
      !colChange &&
      lastIndex.current === rowIndex
    )
      return;
    lastRowHeight.current = height;
    lastIndex.current = rowIndex;
    lastExpandHeight.current = expandHeight;
    lastCols.current = cols;
    // onUpdateRowHeight(height + expandHeight, rowIndex);
    // setRowHeight(height + this.expandHeight, this.props.index, expand)
  }, [rowIndex, cols, onUpdateRowHeight]);

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

  return (
    <>
      <tr key="0" className={cls} ref={trRef}>
        {renderTds()}
      </tr>
      {renderExpandRow()}
    </>
  );
}
export default Tr;
