import React, { useRef, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
// import type { CellProps } from '../interface';
import type {
  CellProps,
  Expandable,
  PrivateColumnsType,
  RowSelection,
  TreeExpandable,
} from '../interface1';
import type { TableProps } from '../Table';
import Td from '../Td';
import { getParent } from '../utils/util';

// interface TrProps<T> extends TableProps<T> {
//   isTree: boolean;
//   rowData: T;
//   rowIndex: number;
//   recordKey: React.Key;
//   expanded: boolean;
//   columns: PrivateColumnsType<T>;
//   checked: 'indeterminate' | boolean;
//   selectionType: 'radio' | 'checkbox' | undefined;
//   onUpdateRowHeight: (height: number, rowIndex: number) => void;
// }

interface TrProps<T> {
  rowData: T;
  isTree: boolean;
  rowIndex: number;
  striped: boolean;
  expanded: boolean;
  bordered: boolean;
  recordKey: React.Key;
  treeLevel: number;
  treeIndent: number;
  treeExpanded: boolean;
  expandable?: Expandable<T>;
  rowSelection?: RowSelection<T>;
  treeProps?: TreeExpandable<T>;
  columns: PrivateColumnsType<T>;
  checked: 'indeterminate' | boolean;
  handleExpand: (expanded: boolean, record: T, recordKey: number | string) => void;
  handleTreeExpand: (treeExpanded: boolean, record: T, recordKey: number | string) => void;
  handleSelect: (
    isRadio: boolean,
    isChecked: boolean,
    record: T,
    recordKey: React.Key,
    selected: boolean,
    event: Event,
  ) => void;
  onUpdateRowHeight: (height: number, rowIndex: number) => void;
  onRow?: (record: T, index: number) => any;
  rowClassName?: (record: T, index: number) => string;
}

function Tr<T extends { key?: number | string; children?: T[] }>(props: TrProps<T>) {
  const {
    isTree,
    rowData,
    rowIndex,
    checked,
    expanded,
    expandable,
    recordKey,
    striped,
    bordered,
    rowClassName,
    onRow,
    onUpdateRowHeight,
    columns,
    rowSelection,
    treeProps,
    handleSelect,
    handleExpand,
    treeExpanded,
    treeLevel,
    treeIndent,
    handleTreeExpand,
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
  }, [rowIndex, columns, expanded, rowHeight, onUpdateRowHeight]);

  // const renderTds = () => {
  //   const tds = [];
  //   for (let i = 0; i < cols.length; i++) {
  //     const column = cols[i];
  //     if (!column.colSpan || !column.rowSpan) continue;
  //     const ignoreRightBorder = !!(
  //       bordered &&
  //       (i === cols.length - 1 || column.colSpan === cols.length)
  //     );
  //     tds.push(
  //       <Td
  //         key={i}
  //         {...column}
  //         isTree={isTree}
  //         checked={checked}
  //         expanded={expanded}
  //         rowIndex={rowIndex}
  //         rowSelection={rowSelection}
  //         expandable={expandable}
  //         selectionType={selectionType}
  //         scrollLeft={scrollLeft}
  //         offsetRight={offsetRight}
  //         ignoreRightBorder={ignoreRightBorder}
  //       />,
  //     );
  //   }
  //
  //   return tds;
  // };

  // todo 待验证如果是固定列滚动这一行的展示效果
  const renderExpandRow = () => {
    const expandColumn = columns.find((column) => {
      if ('type' in column && column.type && column.type === 'expand') {
        return column;
      }
    });
    if (
      !expandColumn ||
      (expandable?.rowExpandable && !expandable?.rowExpandable(rowData)) ||
      !expanded
    )
      return;

    const cls =
      expandable?.expandedRowClassName && expandable.expandedRowClassName(rowData, rowIndex);
    // const existFixed = cols.some((c) => c.fixed === 'left' || c.fixed === 'right');
    // const styles = existFixed ? { transform: `translate(${scrollLeft}px, 0)` } : {};
    return (
      <tr key={`${rowIndex}_expand`} className={cls} ref={expandTrRef}>
        <td
          colSpan={columns.length}
          className={classnames({ 'cell-ignore-right-border': bordered })}
        >
          {expandable?.expandedRowRender &&
            expandable?.expandedRowRender(rowData, rowIndex, expanded)}
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

  const renderCells = () => {
    const cells = [];
    let isExist = false;
    let isFirstDefaultColumn = false;
    for (let i = 0; i < columns.length; i++) {
      let colSpan = 1;
      let rowSpan = 1;
      const column = columns[i];
      if (
        ('type' in column &&
          column.type &&
          !['expand', 'radio', 'checkbox'].includes(column.type)) ||
        (!('type' in column) && !isExist)
      ) {
        isExist = true;
        isFirstDefaultColumn = true;
      }
      if (typeof column?.onCell === 'function') {
        const cellProps = column.onCell(rowData, rowIndex);
        colSpan = cellProps?.colSpan ?? 1;
        rowSpan = cellProps?.rowSpan ?? 1;
      }
      if (!colSpan || !rowSpan) continue;
      const ignoreRightBorder =
        bordered && (i === columns.length - 1 || colSpan === columns.length);
      cells.push(
        <Td
          key={i}
          isTree={isTree}
          checked={checked}
          expanded={expanded}
          rowIndex={rowIndex}
          column={column}
          rowSpan={rowSpan}
          colSpan={colSpan}
          rowData={rowData}
          treeProps={treeProps}
          recordKey={recordKey}
          treeLevel={treeLevel}
          treeIndent={treeIndent}
          treeExpanded={treeExpanded}
          expandable={expandable}
          rowSelection={rowSelection}
          handleSelect={handleSelect}
          handleExpand={handleExpand}
          handleTreeExpand={handleTreeExpand}
          ignoreRightBorder={ignoreRightBorder}
          isFirstDefaultColumn={isFirstDefaultColumn}
        />,
      );
      isFirstDefaultColumn = false;
    }

    return cells;
  };

  return (
    <>
      <tr key={rowIndex} className={cls} ref={trRef} {...rowProps} onClick={handleRowClick}>
        {/*{renderTds()}*/}
        {renderCells()}
      </tr>
      {renderExpandRow()}
    </>
  );
}
export default Tr;
