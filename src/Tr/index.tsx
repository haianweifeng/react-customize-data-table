import React, { useMemo } from 'react';
import classnames from 'classnames';
import { omitRowsProps } from '../utils/util';
import type { CellProps } from '../interface';
import type { TableProps } from '../Table';
import Radio from '../Radio';
import Checkbox from '../Checkbox';
import Td from '../Td';

interface TrProps<T> extends TableProps<T> {
  cols: CellProps[];
  rowData: T;
  rowIndex: number;
  checked: 'indeterminate' | boolean;
  expanded: boolean;
  treeExpanded: boolean;
  isTree: boolean;
  onSelect: (isRadio: boolean, record: T, selected: boolean, event: Event) => void;
  onExpand: (expanded: boolean, record: T) => void;
  onTreeExpand: (expanded: boolean, record: T) => void;
}
function Tr<T extends { treeLevel: number; children?: T[] }>(props: TrProps<T>) {
  const {
    cols,
    rowData,
    rowIndex,
    columns,
    checked,
    rowSelection,
    expandable,
    expanded,
    treeExpanded,
    onExpand,
    onSelect,
    striped,
    rowClassName,
    treeProps,
    isTree,
    onTreeExpand,
  } = props;

  const record = omitRowsProps(rowData)[0];

  // const handleChange = (isRadio: boolean, selected: boolean, event: Event) => {
  //   onSelect(isRadio, rowData, selected, event);
  // };
  //
  // const handleExpandClick = () => {
  //   onExpand(!expanded, rowData);
  // };
  //
  // const handleTreeExpand = () => {
  //   onTreeExpand(!treeExpanded, rowData);
  // };
  //
  // const selectionType = useMemo(() => {
  //   if (rowSelection) {
  //     return rowSelection.type || 'checkbox';
  //   }
  //   return '';
  // }, [rowSelection]);

  // const renderSelectionColumn = (type: string) => {
  //   const checkboxProps =
  //     typeof rowSelection?.getCheckboxProps === 'function'
  //       ? rowSelection.getCheckboxProps(record)
  //       : {};
  //   const isRadio = type === 'radio';
  //   const defaultContent = isRadio ? (
  //     <Radio
  //       {...checkboxProps}
  //       checked={checked}
  //       onChange={(selected: boolean, event: Event) => {
  //         handleChange(isRadio, selected, event);
  //       }}
  //     />
  //   ) : (
  //     <Checkbox
  //       {...checkboxProps}
  //       checked={checked}
  //       onChange={(selected: boolean, event: Event) => {
  //         handleChange(isRadio, selected, event);
  //       }}
  //     />
  //   );
  //   // todo fixed
  //   const cellProps = {
  //     isSelectionExpandColumn: true,
  //     // fixed: rowSelection?.fixed,
  //     colSpan: 1,
  //     rowSpan: 1,
  //     content:
  //       typeof rowSelection?.renderCell === 'function'
  //         ? rowSelection.renderCell(!!checked, record, rowIndex, defaultContent)
  //         : defaultContent,
  //   };
  //
  //   return cellProps;
  // };
  // // todo fixed
  // const renderExpandColumn = () => {
  //   let ableExpand = true;
  //
  //   if (expandable?.rowExpandable && !expandable?.rowExpandable(record)) {
  //     ableExpand = false;
  //   }
  //   const expandIcon = (
  //     <span
  //       className={classnames({
  //         'expand-icon': true,
  //         'expand-icon-divider': expanded,
  //       })}
  //       onClick={handleExpandClick}
  //     />
  //   );
  //
  //   let content =
  //     typeof expandable?.expandIcon === 'function'
  //       ? expandable.expandIcon(record, expanded)
  //       : expandIcon;
  //
  //   return {
  //     isSelectionExpandColumn: true,
  //     colSpan: 1,
  //     rowSpan: 1,
  //     content: ableExpand ? content : '',
  //   };
  // };

  // const formatColumns = useMemo(() => {
  //   let insertIndex = 0;
  //   const treeLevel = rowData.treeLevel;
  //   const hasChildren = rowData?.children && rowData.children.length > 0;
  //   const treeIndent = treeProps?.indentSize || 15;
  //
  //   const cols = columns.map((column, index: number) => {
  //     const { render, dataIndex, onCell, align, className, fixed, title } = column;
  //     if (expandable?.insertBeforeColumnName === title) insertIndex = index;
  //     const cell: CellProps = {
  //       isSelectionExpandColumn: false,
  //       align,
  //       className,
  //       fixed,
  //       colSpan: 1,
  //       rowSpan: 1,
  //       content: '',
  //     };
  //     if (typeof onCell === 'function') {
  //       const cellProps = onCell(record, rowIndex);
  //       cell.colSpan = cellProps?.colSpan === 0 ? 0 : cellProps?.colSpan || 1;
  //       cell.rowSpan = cellProps?.rowSpan === 0 ? 0 : cellProps?.rowSpan || 1;
  //     }
  //
  //     let content;
  //     if (typeof render === 'function') {
  //       content = render(rowData[dataIndex as keyof T] as string, record, rowIndex);
  //     } else {
  //       content = rowData[dataIndex as keyof T] as string;
  //     }
  //
  //     const isTreeColumn =
  //       ((treeProps?.treeColumnsName && treeProps.treeColumnsName === title) ||
  //         (index === 0 && !treeProps?.treeColumnsName)) &&
  //       isTree;
  //
  //     if (hasChildren && isTreeColumn) {
  //       const defaultTreeIcon = (
  //         <span
  //           onClick={handleTreeExpand}
  //           className={classnames({
  //             'expand-icon': true,
  //             'icon-tree': true,
  //             'expand-icon-divider': treeExpanded,
  //           })}
  //         />
  //       );
  //       const treeIcon =
  //         typeof treeProps?.expandIcon === 'function'
  //           ? treeProps.expandIcon(record, treeExpanded)
  //           : defaultTreeIcon;
  //
  //       cell.content = (
  //         <span style={{ marginLeft: treeLevel * treeIndent }}>
  //           {treeIcon}
  //           {content}
  //         </span>
  //       );
  //     } else if (isTreeColumn) {
  //       cell.content = (
  //         <span
  //           style={{
  //             marginLeft: treeLevel * treeIndent,
  //             paddingLeft: treeLevel > 0 || (isTree && treeLevel === 0) ? 25 : 0,
  //           }}
  //         >
  //           {content}
  //         </span>
  //       );
  //     } else {
  //       cell.content = content;
  //     }
  //
  //     return cell;
  //   });
  //
  //   if (selectionType) {
  //     cols.unshift(renderSelectionColumn(selectionType));
  //
  //     if (expandable?.insertBeforeColumnName) {
  //       insertIndex += 1;
  //     }
  //   }
  //
  //   if (expandable && expandable?.expandedRowRender) {
  //     cols.splice(insertIndex, 0, renderExpandColumn());
  //   }
  //
  //   return cols;
  //
  // }, [rowData, treeProps, columns, expandable, treeExpanded, selectionType, renderSelectionColumn, renderExpandColumn]);

  const renderTds = () => {
    const tds = [];
    for (let i = 0; i < cols.length; i++) {
      const column = cols[i];
      if (!column.colSpan || !column.rowSpan) continue;
      tds.push(<Td key={i} {...column} />);
    }

    return tds;
  };

  const renderExpandRow = () => {
    if (
      !expandable ||
      !expandable?.expandedRowRender ||
      !expanded ||
      (expandable?.rowExpandable && !expandable?.rowExpandable(record))
    )
      return;
    const cls =
      expandable?.expandedRowClassName && expandable.expandedRowClassName(record, rowIndex);
    return (
      <tr key="1" className={cls}>
        <td colSpan={cols.length}>{expandable.expandedRowRender(record, rowIndex, expanded)}</td>
      </tr>
    );
  };

  const clsInfo: any = {
    'row-even': striped && rowIndex % 2 !== 0,
    'row-odd': striped && rowIndex % 2 === 0,
    'row-selected': checked,
  };

  if (rowClassName && rowClassName(record, rowIndex)) {
    clsInfo[rowClassName(record, rowIndex)] = !!rowClassName(record, rowIndex);
  }

  const cls = classnames(clsInfo);

  return (
    <>
      <tr key="0" className={cls}>
        {renderTds()}
      </tr>
      {renderExpandRow()}
    </>
  );
}
export default Tr;
