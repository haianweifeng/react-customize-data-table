import React, { useRef, useState, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { getRowKey, findParentByKey } from '../utils/util';
import type { TableProps } from '../Table';
import type { CellProps, ColumnsWithType, SelectedInfo, TreeLevelType } from '../interface';
import Tr from '../Tr';
import Radio from '../Radio';
import Checkbox from '../Checkbox';
// todo bug 如果设置了默认值是选了子项的话 取消勾选第一项这时候数据错误
interface TbodyProps<T> extends TableProps<T> {
  columns: ColumnsWithType<T>[];
  originDataSource: T[];
  startRowIndex: number;
  treeLevelMap: TreeLevelType;
  treeExpandKeys: (number | string)[];
  selectedKeys: (number | string)[];
  selectedInfos: SelectedInfo<T>[];
  onSelect: (selectedKeys: (number | string)[], selectedInfos: SelectedInfo<T>[]) => void;
  onTreeExpand: (treeExpanded: boolean, record: T, recordKey: number | string) => void;
  onBodyRender: (cells: HTMLElement[]) => void;
}

function Tbody<T extends { children?: T[] }>(props: TbodyProps<T>) {
  const {
    dataSource = [],
    originDataSource,
    columns,
    // startRowIndex,
    rowKey = 'key',
    treeLevelMap,
    treeExpandKeys,
    selectedKeys,
    selectedInfos,
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
      const key = getRowKey(rowKey, d) as string;
      keys.push(key);
    });
    return keys;
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(() => {
    if (
      expandable?.defaultExpandAllRows &&
      !(expandable?.defaultExpandedRowKeys || expandable?.expandedRowKeys)
    ) {
      return getAllExpandKeys(dataSource);
    }
    return expandable?.expandedRowKeys || expandable?.defaultExpandedRowKeys || [];
  });

  const getChildrenKeys = (data: T[] = [], all = true) => {
    const keys: (number | string)[] = [];
    data.map((c, i) => {
      const key = getRowKey(rowKey, c) as string;
      keys.push(key);
      if (c?.children && c.children.length && all) {
        keys.push(...getChildrenKeys(c.children));
      }
    });
    return keys;
  };

  // const findParentByKey = (
  //   data: T[] = [],
  //   currKey: string | number,
  //   level: number
  // ) => {
  //   const info: { parent: T; parentKey: number | string } = {} as { parent: T; parentKey: number | string; };
  //   for (let i = 0; i < data.length; i++) {
  //     const curr = data[i];
  //     const key = getRowKey(rowKey, curr) as string;
  //     if (key === currKey) {
  //       if (level > 0) {
  //         info.parent = curr;
  //         info.parentKey = key;
  //       }
  //       break;
  //     }
  //     if (curr?.children && curr.children.length) {
  //       const res = findParentByKey(curr.children, currKey, level + 1);
  //       if (res.parent) {
  //         info.parent = curr;
  //         info.parentKey = key;
  //         break;
  //       }
  //     }
  //   }
  //   return info;
  // };

  const getSelectParent = (selectKeys: (string | number)[], currSelectedKey: number | string) => {
    const parentInfos: SelectedInfo<T>[] = [];

    // const { parent, parentKey } = findParentByKey(
    //   originDataSource,
    //   currSelectedKey,
    //   0,
    // );
    const parent = findParentByKey(originDataSource, currSelectedKey, rowKey);
    if (!parent) return parentInfos;
    const parentKey = getRowKey(rowKey, parent) as string;

    const childKeys = getChildrenKeys(parent?.children, false);
    const exist = childKeys.filter((cKey) => selectKeys.indexOf(cKey) >= 0);
    if (exist.length + 1 === childKeys.length || (childKeys.length === 1 && !exist.length)) {
      // parentInfos.push({ record: parent, key: parentKey });
      parentInfos.push({ [parentKey]: parent });
      parentInfos.push(...getSelectParent([...selectKeys, currSelectedKey], parentKey));
    }
    return parentInfos;
  };

  const getSelectedItems = (data: T[] = [], currSelectedKey?: number | string) => {
    const selectItems: SelectedInfo<T>[] = [];

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const key = getRowKey(rowKey, d) as string;
      if (currSelectedKey !== undefined) {
        if (currSelectedKey === key) {
          // selectItems.push({ record: d, key });
          selectItems.push({ [key]: d });
          const selectedChildrenItems = getSelectedItems(d?.children);
          if (selectedChildrenItems.length) {
            selectItems.push(...selectedChildrenItems);
          }
          selectItems.push(...getSelectParent(selectedKeys, currSelectedKey));
        }
      } else {
        // selectItems.push({ record: d, key });
        selectItems.push({ [key]: d });
        const selectedChildrenItems = getSelectedItems(d?.children);
        if (selectedChildrenItems.length) {
          selectItems.push(...selectedChildrenItems);
        }
      }
    }

    return selectItems;
  };

  const handleSelect = (
    isRadio: boolean,
    checked: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => {
    const key = getRowKey(rowKey, record) as string;

    let keys: (string | number)[] = [];
    let selectedRows: T[] = [];
    let selectedInfoMaps: SelectedInfo<T>[] = [];

    if (!checked) {
      if (isRadio) {
        keys = [key];
        selectedRows = [record];
      } else {
        const selectedItems = getSelectedItems(dataSource, key);
        console.log(selectedItems);
        selectedInfoMaps = [...selectedInfos, ...selectedItems];
        selectedInfoMaps.map((s) => {
          const currKey = Object.keys(s)[0];
          // keys.push(s.key);
          keys.push(currKey);
          selectedRows.push(s[currKey]);
          // selectedRows.push(s.record);
        });
      }
    } else {
      const childrenKeys = getChildrenKeys(record?.children);
      keys = [key, ...childrenKeys];

      let parent = findParentByKey(originDataSource, key, rowKey);

      // const parentInfo = findParentByKey(originDataSource, key, 0);

      // let parentKey = parentInfo?.parentKey;
      while (parent) {
        const parentKey = getRowKey(rowKey, parent) as string;
        keys.push(parentKey);
        parent = findParentByKey(originDataSource, parentKey, rowKey);
      }
      // if (parent) {
      //   let parentKey = getRowKey(rowKey, parent) as string;
      //   while (parentKey) {
      //     keys.push(parentKey);
      //     const ancestorInfo = findParentByKey(originDataSource, parentKey, rowKey);
      //     parentKey = ancestorInfo?.parentKey;
      //   }
      // }

      const selectedItemKeys: (string | number)[] = [];
      const selectedItemRows: T[] = [];

      selectedInfoMaps = selectedInfos.filter((s) => {
        return keys.indexOf(Object.keys(s)[0]) < 0;
      });
      selectedInfoMaps.map((s) => {
        const currKey = Object.keys(s)[0];
        keys.push(currKey);
        selectedRows.push(s[currKey]);
        // selectedItemKeys.push(s.key);
        // selectedItemRows.push(s.record);
      });

      selectedRows = selectedItemRows;
      keys = selectedItemKeys;
    }
    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRows, event);
    }

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(keys, selectedRows);
    }

    onSelect(keys, selectedInfoMaps);
  };

  const handleExpand = (expanded: boolean, record: T, recordKey: number | string) => {
    if (!expandable?.expandedRowKeys) {
      setExpandedRowKeys((prev) => {
        const isExist = prev.indexOf(recordKey) >= 0;
        return isExist ? prev.filter((p) => p !== recordKey) : [...prev, recordKey];
      });
    }
    if (expandable?.onExpand) {
      expandable.onExpand(expanded, record);
    }
  };

  const handleTreeExpand = (treeExpanded: boolean, record: T, recordKey: number | string) => {
    onTreeExpand(treeExpanded, record, recordKey);
  };

  useEffect(() => {
    if (tbodyRef.current) {
      const tr = tbodyRef.current.querySelector('tr');
      if (!tr) return;
      const tds = tr.querySelectorAll('td');
      onBodyRender(tds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          handleSelect(isRadio, !!checked, rowData, rowIndex, selected, event);
        }}
      />
    ) : (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, !!checked, rowData, rowIndex, selected, event);
        }}
      />
    );
    // todo fixed
    return {
      type,
      // fixed: rowSelection?.fixed,
      colSpan: 1,
      rowSpan: 1,
      content:
        typeof rowSelection?.renderCell === 'function'
          ? rowSelection.renderCell(!!checked, rowData, rowIndex, defaultContent)
          : defaultContent,
    };
  };

  const renderExpandColumn = (rowData: T, recordKey: number | string, expanded: boolean) => {
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
      colSpan: 1,
      rowSpan: 1,
      content: ableExpand ? content : '',
    };
  };

  const getColumns = (
    rowData: T,
    recordKey: number | string,
    rowIndex: number,
    checked: boolean | 'indeterminate',
    expanded: boolean,
  ) => {
    const treeLevel = treeLevelMap[recordKey];
    const treeExpanded = treeExpandKeys.indexOf(recordKey) >= 0;
    const treeIndent = treeProps?.indentSize || 15;
    const hasChildren = rowData?.children && rowData.children.length > 0;

    const startIndex = columns.findIndex((c) => !c.type);

    return columns.map((column, index: number) => {
      const { render, dataIndex, onCell, align, className, fixed, title, type } = column;

      switch (type) {
        case 'checkbox':
        case 'radio':
          return renderSelectionColumn(type, rowData, checked, rowIndex);
        case 'expanded':
          return renderExpandColumn(rowData, recordKey, expanded);
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
  // todo 判断是否选中的方法中如果只选中了最底层的 就会出现上层没有勾选
  const renderTr = (rowData: T, i: number) => {
    const key = getRowKey(rowKey, rowData) as string;
    let checked: boolean | 'indeterminate' = false;
    const hasChildren = rowData?.children && rowData.children.length;

    if (rowSelection?.type === 'radio' || !hasChildren) {
      checked = selectedKeys.indexOf(key) >= 0;
    } else {
      const childrenKeys = getChildrenKeys(rowData?.children, false);
      const allChildrenSelected = childrenKeys.every((cKey) => {
        return selectedKeys.indexOf(cKey) >= 0;
      });
      const childrenSelected = childrenKeys.some((cKey) => {
        return selectedKeys.indexOf(cKey) >= 0;
      });
      if (childrenKeys.length) {
        checked = allChildrenSelected ? true : childrenSelected ? 'indeterminate' : false;
      }
    }

    const expanded = expandedRowKeys.indexOf(key) >= 0;

    const cols = getColumns(rowData, key, i, checked, expanded);

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

  return <tbody ref={tbodyRef}>{dataSource.map((d, i: number) => renderTr(d, i))}</tbody>;
}
export default Tbody;
