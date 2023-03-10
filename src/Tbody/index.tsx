import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import classnames from 'classnames';
import Tr from '../Tr';
import Radio from '../Radio';
import Checkbox from '../Checkbox';
import { getRowKey } from '../utils/util';
import type { TableProps } from '../Table';
import type {
  PrivateColumnsType,
  CellProps,
  PrivateColumnType,
  Expandable,
  RowSelection,
  TreeExpandable,
} from '../interface1';

interface TbodyProps<T> {
  // isTree: boolean;
  empty: React.ReactNode;
  startRowIndex: number;
  dataSource: T[];
  columns: PrivateColumnsType<T>;
  keyLevelMap: Map<React.Key, number>;
  selectionType: 'radio' | 'checkbox' | undefined;
  selectedKeys: React.Key[];
  halfSelectedKeys: React.Key[];
  expandedRowKeys: React.Key[];
  treeExpandKeys: React.Key[];
  // onSelect: (
  //   selectedKeys: React.Key[],
  //   halfSelectedKeys: React.Key[],
  //   record: T,
  //   selected: boolean,
  //   event: Event,
  // ) => void;
  // onTreeExpand: (treeExpanded: boolean, record: T, recordKey: number | string) => void;
  // onBodyRender: (cells: HTMLElement[]) => void;
  onUpdateRowHeight: (height: number, rowIndex: number) => void;
  getRecordKey: (record: T) => any;
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
  striped: boolean;
  bordered: boolean;
  expandable?: Expandable<T>;
  rowSelection?: RowSelection<T>;
  treeProps?: TreeExpandable<T>;
  onRow?: (record: T, index: number) => any;
  rowClassName?: (record: T, index: number) => string;
}

function Tbody<T extends { key?: number | string; children?: T[] }>(props: TbodyProps<T>) {
  const {
    empty,
    bordered,
    striped,
    // isTree,
    columns,
    dataSource = [],
    startRowIndex,
    keyLevelMap,
    selectedKeys,
    halfSelectedKeys,
    expandedRowKeys,
    treeExpandKeys,
    selectionType,
    treeProps,
    expandable,
    rowSelection,
    // onSelect,
    // onTreeExpand,
    // onBodyRender,
    getRecordKey,
    handleExpand,
    handleTreeExpand,
    handleSelect,
    onUpdateRowHeight,
    onRow,
    rowClassName,
  } = props;

  const tbodyRef = useRef<any>(null);

  // const getAllExpandKeys = (data: T[]) => {
  //   const keys: (string | number)[] = [];
  //   data.forEach((d) => {
  //     const key = getRowKey(rowKey, d);
  //     if (key === undefined) return;
  //     keys.push(key);
  //   });
  //   return keys;
  // };

  // const [isMount, setIsMount] = useState<boolean>(false);

  // const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(() => {
  //   if (
  //     expandable?.defaultExpandAllRows &&
  //     !(expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys)
  //   ) {
  //     return getAllExpandKeys(dataSource);
  //   }
  //   return expandable?.expandedRowKeys || expandable?.defaultExpandedRowKeys || [];
  // });

  // const handleSelect = (
  //   isRadio: boolean,
  //   checked: boolean,
  //   record: T,
  //   rowIndex: number,
  //   recordKey: React.Key,
  //   selected: boolean,
  //   event: Event,
  // ) => {
  //   if (!checked) {
  //     onSelect(
  //       isRadio ? [recordKey] : [...selectedKeys, recordKey],
  //       halfSelectedKeys,
  //       record,
  //       selected,
  //       event,
  //     );
  //   } else {
  //     const keys = selectedKeys.filter((key) => key !== recordKey);
  //     const halfKeys = halfSelectedKeys.filter((halfKey) => halfKey !== recordKey);
  //     onSelect(keys, halfKeys, record, selected, event);
  //   }
  //   // const key = getRowKey(rowKey, record);
  //   //
  //   // if (key === undefined) {
  //   //   if (typeof rowSelection?.onSelect === 'function') {
  //   //     rowSelection.onSelect(record, selected, [record], event);
  //   //   }
  //   //
  //   //   if (typeof rowSelection?.onChange === 'function') {
  //   //     rowSelection?.onChange([key as any], [record]);
  //   //   }
  //   //   return;
  //   // }
  //   //
  //   // if (!checked) {
  //   //   onSelect(isRadio ? [key] : [...selectedKeys, key], halfSelectedKeys, record, selected, event);
  //   // } else {
  //   //   const keys = selectedKeys.filter((selectKey) => selectKey !== key);
  //   //   const halfKeys = halfSelectedKeys.filter((halfKey) => halfKey !== key);
  //   //   onSelect(keys, halfKeys, record, selected, event);
  //   // }
  // };

  // const handleExpand = (expanded: boolean, record: T, recordKey?: number | string) => {
  //   if (!expandable?.expandedRowKeys && recordKey !== undefined) {
  //     setExpandedRowKeys((prev) => {
  //       const isExist = prev.indexOf(recordKey) >= 0;
  //       return isExist ? prev.filter((p) => p !== recordKey) : [...prev, recordKey];
  //     });
  //   }
  //   if (expandable?.onExpand) {
  //     expandable.onExpand(expanded, record);
  //   }
  // };
  //
  // const handleTreeExpand = (treeExpanded: boolean, record: T, recordKey?: number | string) => {
  //   if (recordKey !== undefined) {
  //     onTreeExpand(treeExpanded, record, recordKey);
  //   }
  // };

  // useEffect(() => {
  //   setIsMount(true);
  // }, []);

  // 待测试 1.bug 分页切换页码时候宽度不对 已修复
  // 待测试 2.筛选后 宽度不对  已修复
  // mount 不需要 setTimeout
  // useEffect(() => {
  //   if (tbodyRef.current) {
  //     const tr = tbodyRef.current.querySelector('tr');
  //     if (!tr) return;
  //     const tds = tr.querySelectorAll('td');
  //     // setTimeout for 不同例子之间切换时候头部和body 之间没有对齐  todo 如果表格宽度太宽但是容器太小时候后列宽怎么处理 group.md
  //     if (isMount) {
  //       onBodyRender(tds);
  //     } else {
  //       setTimeout(() => {
  //         onBodyRender(tds);
  //       });
  //     }
  //   }
  // }, [onBodyRender, isMount]);

  // useEffect(() => {
  //   if (expandable?.expandedRowKeys) {
  //     setExpandedRowKeys(expandable.expandedRowKeys);
  //   }
  // }, [expandable]);

  // const renderSelectionColumn = (
  //   rowData: T,
  //   checked: boolean | 'indeterminate',
  //   rowIndex: number,
  //   cellProps: CellProps,
  //   recordKey: React.Key,
  // ) => {
  //   const checkboxProps =
  //     typeof rowSelection?.getCheckboxProps === 'function'
  //       ? rowSelection.getCheckboxProps(rowData)
  //       : {};
  //   const isRadio = cellProps.type === 'radio';
  //   const defaultContent = isRadio ? (
  //     <Radio
  //       {...checkboxProps}
  //       checked={checked}
  //       onChange={(selected: boolean, event: Event) => {
  //         handleSelect(isRadio, checked == true, rowData, rowIndex, recordKey, selected, event);
  //         event.stopPropagation();
  //       }}
  //     />
  //   ) : (
  //     <Checkbox
  //       {...checkboxProps}
  //       checked={checked}
  //       onChange={(selected: boolean, event: Event) => {
  //         handleSelect(isRadio, checked == true, rowData, rowIndex, recordKey, selected, event);
  //         event.stopPropagation();
  //       }}
  //     />
  //   );
  //   // todo 待测试如果直接返回defaultContent 能不能触发内容handleSelect 函数
  //   return {
  //     ...cellProps,
  //     content:
  //       typeof rowSelection?.renderCell === 'function'
  //         ? rowSelection.renderCell(!!checked, rowData, rowIndex, defaultContent)
  //         : defaultContent,
  //   };
  // };

  // const renderExpandColumn = (
  //   rowData: T,
  //   expanded: boolean,
  //   cellProps: CellProps,
  //   recordKey?: number | string,
  // ) => {
  //   let ableExpand = true;
  //
  //   if (expandable?.rowExpandable && !expandable?.rowExpandable(rowData)) {
  //     ableExpand = false;
  //   }
  //   const expandIcon = (
  //     <span
  //       className={classnames({
  //         'expand-icon': true,
  //         'expand-icon-divider': expanded,
  //       })}
  //       onClick={(event) => {
  //         handleExpand(!expanded, rowData, recordKey);
  //         event.stopPropagation();
  //       }}
  //     />
  //   );
  //
  //   const content =
  //     typeof expandable?.expandIcon === 'function'
  //       ? expandable.expandIcon(rowData, expanded, expandable?.onExpand)
  //       : expandIcon;
  //
  //   return {
  //     ...cellProps,
  //     content: ableExpand ? content : '',
  //   };
  // };

  // const getCellsProps = (
  //   rowData: T,
  //   rowIndex: number,
  //   checked: boolean | 'indeterminate',
  //   expanded: boolean,
  //   recordKey: React.Key,
  // ) => {
  //   const treeLevel = keyLevelMap.get(recordKey) || 0;
  //   const treeExpanded = treeExpandKeys.indexOf(recordKey) >= 0;
  //   const treeIndent = treeProps?.indentSize || 15;
  //   const hasChildren = rowData?.children && rowData.children.length > 0;
  //
  //   const startIndex = columns.findIndex((c) => c.type === 'default');
  //
  //   return columns.map((column, index: number) => {
  //     const {
  //       render,
  //       dataIndex,
  //       onCell,
  //       align,
  //       className,
  //       fixed,
  //       title,
  //       type,
  //       _lastLeftFixed,
  //       _firstRightFixed,
  //       ellipsis,
  //       width,
  //     } = column;
  //
  //     // todo width: _width
  //     const cellProps = {
  //       type,
  //       fixed,
  //       _lastLeftFixed,
  //       _firstRightFixed,
  //       colSpan: 1,
  //       rowSpan: 1,
  //       content: '',
  //       ellipsis,
  //       width,
  //     };
  //
  //     switch (type) {
  //       case 'checkbox':
  //       case 'radio':
  //         return renderSelectionColumn(rowData, checked, rowIndex, cellProps, recordKey);
  //       case 'expand':
  //         return renderExpandColumn(rowData, expanded, cellProps, recordKey);
  //       default: {
  //         // const cell: CellProps = {
  //         //   type,
  //         //   align,
  //         //   className,
  //         //   fixed,
  //         //   colSpan: 1,
  //         //   rowSpan: 1,
  //         //   content: '',
  //         // };
  //
  //         const cell: CellProps = { ...cellProps, align, className };
  //
  //         if (typeof onCell === 'function') {
  //           const cellProps = onCell(rowData, rowIndex);
  //           cell.colSpan = cellProps?.colSpan === 0 ? 0 : cellProps?.colSpan || 1;
  //           cell.rowSpan = cellProps?.rowSpan === 0 ? 0 : cellProps?.rowSpan || 1;
  //         }
  //
  //         let content: any;
  //         if (typeof render === 'function') {
  //           // todo bug 如果没有这个字段怎么办
  //           content = render(rowData[dataIndex as keyof T] as string, rowData, rowIndex);
  //         } else {
  //           content = rowData[dataIndex as keyof T] as string;
  //         }
  //
  //         const isTreeColumn =
  //           ((treeProps?.treeColumnsName && treeProps.treeColumnsName === title) ||
  //             (startIndex === index && !treeProps?.treeColumnsName)) &&
  //           isTree;
  //
  //         if (hasChildren && isTreeColumn) {
  //           const defaultTreeIcon = (
  //             <span
  //               onClick={() => {
  //                 handleTreeExpand(!treeExpanded, rowData, recordKey);
  //               }}
  //               className={classnames({
  //                 'expand-icon': true,
  //                 'icon-tree': true,
  //                 'expand-icon-divider': treeExpanded,
  //               })}
  //             />
  //           );
  //           const treeIcon =
  //             typeof treeProps?.expandIcon === 'function'
  //               ? treeProps.expandIcon(rowData, treeExpanded, treeProps?.onExpand)
  //               : defaultTreeIcon;
  //
  //           cell.content = () => {
  //             return (
  //               <span style={{ marginLeft: treeLevel * treeIndent }}>
  //                 {treeIcon}
  //                 {content}
  //               </span>
  //             );
  //           };
  //
  //           // cell.content = (
  //           //   <span style={{ marginLeft: treeLevel * treeIndent }}>
  //           //     {treeIcon}
  //           //     {content}
  //           //   </span>
  //           // );
  //         } else if (isTreeColumn) {
  //           cell.content = () => {
  //             return (
  //               <span
  //                 style={{
  //                   marginLeft: treeLevel * treeIndent,
  //                   paddingLeft: treeLevel > 0 || (isTree && treeLevel === 0) ? 25 : 0,
  //                 }}
  //               >
  //                 {content}
  //               </span>
  //             );
  //           };
  //           // cell.content = (
  //           //   <span
  //           //     style={{
  //           //       marginLeft: treeLevel * treeIndent,
  //           //       paddingLeft: treeLevel > 0 || (isTree && treeLevel === 0) ? 25 : 0,
  //           //     }}
  //           //   >
  //           //     {content}
  //           //   </span>
  //           // );
  //         } else {
  //           cell.content = () => content;
  //         }
  //         return cell;
  //       }
  //     }
  //   });
  // };

  const isTree = useMemo(() => {
    const data = dataSource.filter((d) => d?.children && d.children.length);
    return data.length > 0;
  }, [dataSource]);

  const flatRecords = useCallback(
    (data: T[]) => {
      const records: T[] = [];
      data.map((d) => {
        records.push(d);
        const recordKey = getRecordKey(d);
        if (d.children && d.children.length && treeExpandKeys.indexOf(recordKey) >= 0) {
          records.push(...flatRecords(d.children));
        }
      });
      return records;
    },
    [treeExpandKeys, getRecordKey],
  );

  const renderTr = (rowData: T, rowIndex: number) => {
    const recordKey = getRecordKey(rowData);
    let checked: boolean | 'indeterminate' = false;
    const hasChildren = rowData?.children && rowData.children.length;

    if (selectionType === 'radio' || !hasChildren) {
      checked = selectedKeys.indexOf(recordKey) >= 0;
    } else {
      checked =
        selectedKeys.indexOf(recordKey) >= 0
          ? true
          : halfSelectedKeys.indexOf(recordKey) >= 0
          ? 'indeterminate'
          : false;
    }

    const expanded = expandedRowKeys.indexOf(recordKey) >= 0;

    const treeLevel = keyLevelMap.get(recordKey) || 0;
    const treeExpanded = treeExpandKeys.indexOf(recordKey) >= 0;
    const treeIndent = treeProps?.indentSize || 15;

    // const cellsProps = getCellsProps(rowData, rowIndex, checked, expanded, recordKey);

    return (
      <Tr
        key={recordKey}
        rowData={rowData}
        isTree={isTree}
        rowIndex={rowIndex}
        striped={striped}
        expanded={expanded}
        bordered={bordered}
        recordKey={recordKey}
        treeLevel={treeLevel}
        treeIndent={treeIndent}
        treeExpanded={treeExpanded}
        expandable={expandable}
        rowSelection={rowSelection}
        treeProps={treeProps}
        columns={columns}
        checked={checked}
        handleExpand={handleExpand}
        handleTreeExpand={handleTreeExpand}
        handleSelect={handleSelect}
        onUpdateRowHeight={onUpdateRowHeight}
        onRow={onRow}
        rowClassName={rowClassName}
      />
    );
  };

  return (
    <tbody ref={tbodyRef}>
      {!dataSource.length ? (
        <tr key="empty-placeholder" className="row-placeholder">
          <td
            colSpan={columns.length}
            className={classnames({ 'cell-ignore-right-border': bordered })}
          >
            {empty}
          </td>
        </tr>
      ) : null}
      {flatRecords(dataSource).map((d, i: number) => renderTr(d, i + startRowIndex))}
    </tbody>
  );
}
export default Tbody;
