import React, { useRef, useState, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { getRowKey } from '../utils/util';
import type { TableProps } from '../Table';
import type { CellProps, ColumnsWithType, TreeLevelType } from '../interface';
import Tr from '../Tr';
import Radio from '../Radio';
import Checkbox from '../Checkbox';

interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsWithType<T>[];
  scrollLeft: number;
  offsetRight: number;
  startRowIndex: number;
  treeLevelMap: TreeLevelType;
  treeExpandKeys: (number | string)[];
  selectedKeys: (number | string)[];
  halfSelectedKeys: (number | string)[];
  onSelect: (
    selectedKeys: (number | string)[],
    halfSelectedKeys: (number | string)[],
    record: T,
    selected: boolean,
    event: Event,
  ) => void;
  onTreeExpand: (treeExpanded: boolean, record: T, recordKey: number | string) => void;
  onBodyRender: (cells: HTMLElement[]) => void;
  onUpdateRowHeight: (height: number, rowIndex: number) => void;
}

// todo 处理列的fixed
// todo 处理包含选择框列的fixed
function Tbody<T extends { children?: T[] }>(props: TbodyProps<T>) {
  const {
    dataSource = [],
    columns,
    startRowIndex,
    rowKey = 'key',
    treeLevelMap,
    treeExpandKeys,
    selectedKeys,
    halfSelectedKeys,
    rowSelection,
    expandable,
    treeProps,
    onSelect,
    onTreeExpand,
    onBodyRender,
  } = props;

  const tbodyRef = useRef<any>(null);

  const getAllExpandKeys = (data: T[]) => {
    const keys: (string | number)[] = [];
    data.forEach((d) => {
      const key = getRowKey(rowKey, d);
      if (key === undefined) return;
      keys.push(key);
    });
    return keys;
  };

  const [isMount, setIsMount] = useState<boolean>(false);

  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(() => {
    if (
      expandable?.defaultExpandAllRows &&
      !(expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys)
    ) {
      return getAllExpandKeys(dataSource);
    }
    return expandable?.expandedRowKeys || expandable?.defaultExpandedRowKeys || [];
  });

  const handleSelect = (
    isRadio: boolean,
    checked: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => {
    const key = getRowKey(rowKey, record);

    if (key === undefined) {
      if (typeof rowSelection?.onSelect === 'function') {
        rowSelection.onSelect(record, selected, [record], event);
      }

      if (typeof rowSelection?.onChange === 'function') {
        rowSelection?.onChange([key as any], [record]);
      }
      return;
    }

    if (!checked) {
      onSelect(isRadio ? [key] : [...selectedKeys, key], halfSelectedKeys, record, selected, event);
    } else {
      const keys = selectedKeys.filter((selectKey) => selectKey !== key);
      const halfKeys = halfSelectedKeys.filter((halfKey) => halfKey !== key);
      onSelect(keys, halfKeys, record, selected, event);
    }
  };

  const handleExpand = (expanded: boolean, record: T, recordKey?: number | string) => {
    if (!expandable?.expandedRowKeys && recordKey !== undefined) {
      setExpandedRowKeys((prev) => {
        const isExist = prev.indexOf(recordKey) >= 0;
        return isExist ? prev.filter((p) => p !== recordKey) : [...prev, recordKey];
      });
    }
    if (expandable?.onExpand) {
      expandable.onExpand(expanded, record);
    }
  };

  const handleTreeExpand = (treeExpanded: boolean, record: T, recordKey?: number | string) => {
    if (recordKey !== undefined) {
      onTreeExpand(treeExpanded, record, recordKey);
    }
  };

  useEffect(() => {
    setIsMount(true);
  }, []);

  // 待测试 1.bug 分页切换页码时候宽度不对 已修复
  // 待测试 2.筛选后 宽度不对  已修复
  // mount 不需要 setTimeout
  useEffect(() => {
    if (tbodyRef.current) {
      const tr = tbodyRef.current.querySelector('tr');
      if (!tr) return;
      const tds = tr.querySelectorAll('td');
      // setTimeout for 不同例子之间切换时候头部和body 之间没有对齐  todo 如果表格宽度太宽但是容器太小时候后列宽怎么处理 group.md
      if (isMount) {
        onBodyRender(tds);
      } else {
        setTimeout(() => {
          onBodyRender(tds);
        });
      }
    }
  }, [onBodyRender, isMount]);

  useEffect(() => {
    if (expandable?.expandedRowKeys) {
      setExpandedRowKeys(expandable.expandedRowKeys);
    }
  }, [expandable]);

  const isTree = useMemo(() => {
    const data = dataSource.filter((d) => d?.children && d.children.length);
    return data.length > 0;
  }, [dataSource]);

  const renderSelectionColumn = (
    type: string,
    rowData: T,
    checked: boolean | 'indeterminate',
    rowIndex: number,
    fixed?: 'left' | 'right',
  ) => {
    const checkboxProps =
      typeof rowSelection?.getCheckboxProps === 'function'
        ? rowSelection.getCheckboxProps(rowData)
        : {};
    const isRadio = type === 'radio';
    const defaultContent = isRadio ? (
      <Radio
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, checked == true, rowData, rowIndex, selected, event);
        }}
      />
    ) : (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, checked == true, rowData, rowIndex, selected, event);
        }}
      />
    );
    // todo fixed
    return {
      type,
      fixed,
      // fixed: rowSelection?.fixed,
      colSpan: 1,
      rowSpan: 1,
      content:
        typeof rowSelection?.renderCell === 'function'
          ? rowSelection.renderCell(!!checked, rowData, rowIndex, defaultContent)
          : defaultContent,
    };
  };

  const renderExpandColumn = (
    rowData: T,
    expanded: boolean,
    recordKey?: number | string,
    fixed?: 'left' | 'right',
  ) => {
    let ableExpand = true;

    if (expandable?.rowExpandable && !expandable?.rowExpandable(rowData)) {
      ableExpand = false;
    }
    const expandIcon = (
      <span
        className={classnames({
          'expand-icon': true,
          'expand-icon-divider': expanded,
        })}
        onClick={() => {
          handleExpand(!expanded, rowData, recordKey);
        }}
      />
    );

    const content =
      typeof expandable?.expandIcon === 'function'
        ? expandable.expandIcon(rowData, expanded)
        : expandIcon;

    return {
      type: 'expanded',
      fixed,
      colSpan: 1,
      rowSpan: 1,
      content: ableExpand ? content : '',
    };
  };

  // todo fixed
  const getColumns = (
    rowData: T,
    rowIndex: number,
    checked: boolean | 'indeterminate',
    expanded: boolean,
    recordKey?: number | string,
  ) => {
    const treeLevel = treeLevelMap[recordKey as string] || 0;
    const treeExpanded = recordKey !== undefined && treeExpandKeys.indexOf(recordKey) >= 0;
    const treeIndent = treeProps?.indentSize || 15;
    const hasChildren = rowData?.children && rowData.children.length > 0;

    const startIndex = columns.findIndex((c) => !c.type);

    return columns.map((column, index: number) => {
      const { render, dataIndex, onCell, align, className, fixed, title, type } = column;

      switch (type) {
        case 'checkbox':
        case 'radio':
          return renderSelectionColumn(type, rowData, checked, rowIndex, fixed);
        case 'expanded':
          return renderExpandColumn(rowData, expanded, recordKey, fixed);
        default: {
          const cell: CellProps = {
            type,
            align,
            className,
            fixed,
            colSpan: 1,
            rowSpan: 1,
            content: '',
          };

          if (typeof onCell === 'function') {
            const cellProps = onCell(rowData, rowIndex);
            cell.colSpan = cellProps?.colSpan === 0 ? 0 : cellProps?.colSpan || 1;
            cell.rowSpan = cellProps?.rowSpan === 0 ? 0 : cellProps?.rowSpan || 1;
          }

          let content;
          if (typeof render === 'function') {
            content = render(rowData[dataIndex as keyof T] as string, rowData, rowIndex);
          } else {
            content = rowData[dataIndex as keyof T] as string;
          }

          const isTreeColumn =
            ((treeProps?.treeColumnsName && treeProps.treeColumnsName === title) ||
              (startIndex === index && !treeProps?.treeColumnsName)) &&
            isTree;

          if (hasChildren && isTreeColumn) {
            const defaultTreeIcon = (
              <span
                onClick={() => {
                  handleTreeExpand(!treeExpanded, rowData, recordKey);
                }}
                className={classnames({
                  'expand-icon': true,
                  'icon-tree': true,
                  'expand-icon-divider': treeExpanded,
                })}
              />
            );
            const treeIcon =
              typeof treeProps?.expandIcon === 'function'
                ? treeProps.expandIcon(rowData, treeExpanded)
                : defaultTreeIcon;

            cell.content = (
              <span style={{ marginLeft: treeLevel * treeIndent }}>
                {treeIcon}
                {content}
              </span>
            );
          } else if (isTreeColumn) {
            cell.content = (
              <span
                style={{
                  marginLeft: treeLevel * treeIndent,
                  paddingLeft: treeLevel > 0 || (isTree && treeLevel === 0) ? 25 : 0,
                }}
              >
                {content}
              </span>
            );
          } else {
            cell.content = content;
          }
          return cell;
        }
      }
    });
  };

  const renderTr = (rowData: T, i: number) => {
    const key = getRowKey(rowKey, rowData);
    let checked: boolean | 'indeterminate' = false;
    const hasChildren = rowData?.children && rowData.children.length;

    if (key !== undefined) {
      if (rowSelection?.type === 'radio' || !hasChildren) {
        checked = selectedKeys.indexOf(key) >= 0;
      } else {
        checked =
          selectedKeys.indexOf(key) >= 0
            ? true
            : halfSelectedKeys.indexOf(key) >= 0
            ? 'indeterminate'
            : false;
      }
    }

    const expanded = key !== undefined && expandedRowKeys.indexOf(key) >= 0;

    const cols = getColumns(rowData, i, checked, expanded, key);

    return (
      <Tr
        key={key}
        cols={cols}
        rowData={rowData}
        rowIndex={i}
        checked={checked}
        expanded={expanded}
        {...props}
      />
    );
  };

  return (
    <tbody ref={tbodyRef}>{dataSource.map((d, i: number) => renderTr(d, i + startRowIndex))}</tbody>
  );
}
export default Tbody;
