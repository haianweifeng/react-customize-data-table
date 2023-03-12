import React, { useCallback, useMemo } from 'react';
import classnames from 'classnames';
import Tr from '../Tr';
import type {
  ColumnType,
  Expandable,
  RowSelection,
  TreeExpandable,
  PrivateColumnsType,
} from '../interface1';

interface TbodyProps<T> {
  empty: React.ReactNode;
  dataSource: T[];
  striped: boolean;
  bordered: boolean;
  startRowIndex: number;
  columns: PrivateColumnsType<T>;
  keyLevelMap: Map<React.Key, number>;
  selectedKeys: React.Key[];
  halfSelectedKeys: React.Key[];
  expandedRowKeys: React.Key[];
  treeExpandKeys: React.Key[];
  expandable?: Expandable<T>;
  rowSelection?: RowSelection<T>;
  treeProps?: TreeExpandable<T>;
  getRecordKey: (record: T) => any;
  selectionType: 'radio' | 'checkbox' | undefined;
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
  rowClassName?: (record: T, index: number) => string;
  rowStyle?: (record: T, index: number) => React.CSSProperties | React.CSSProperties;
  cellClassName?: (column: ColumnType<T>, rowIndex: number, colIndex: number) => string | string;
  cellStyle?: (
    column: ColumnType<T>,
    rowIndex: number,
    colIndex: number,
  ) => React.CSSProperties | React.CSSProperties;
  onRowEvents?: (record: T, rowIndex: number) => object;
  onCellEvents?: (record: T, rowIndex: number) => object;
  onUpdateRowHeight: (height: number, rowIndex: number) => void;
}

function Tbody<T extends { key?: number | string; children?: T[] }>(props: TbodyProps<T>) {
  const {
    empty,
    columns,
    bordered,
    dataSource,
    getRecordKey,
    treeExpandKeys,
    selectionType,
    selectedKeys,
    halfSelectedKeys,
    expandedRowKeys,
    treeProps,
    keyLevelMap,
    startRowIndex,
    ...restProps
  } = props;
  // todo 是不是需要放到Tbody 中判断 如果是虚拟列表发生了截取呢
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

    return (
      <Tr
        key={recordKey}
        rowData={rowData}
        isTree={isTree}
        rowIndex={rowIndex}
        expanded={expanded}
        bordered={bordered}
        recordKey={recordKey}
        treeLevel={treeLevel}
        treeIndent={treeIndent}
        treeExpanded={treeExpanded}
        treeProps={treeProps}
        columns={columns}
        checked={checked}
        {...restProps}
      />
    );
  };

  return (
    <tbody>
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
