import React, { useRef, useState, useEffect, useMemo } from 'react';
import { getRowKey } from '../utils/util';
import type { TableProps } from '../Table';
import type { CellProps, ColumnsWithType, SelectedInfo, TreeLevelType } from '../interface';
import Tr from '../Tr';
import classnames from 'classnames';
import Radio from '../Radio';
import Checkbox from '../Checkbox';

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

function Tbody<
  T extends {
    children?: T[];
    // rowKey: number | string;
    // parentKey?: number | string;
    // treeLevel: number;
  },
>(props: TbodyProps<T>) {
  const {
    dataSource = [],
    originDataSource,
    columns,
    // startRowIndex,
    rowKey,
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
  // const cacheSelectedRows = useRef<T[]>([]);

  // const getTreeChildrenKeys = (parent: T) => {
  //   const keys: (string | number)[] = [];
  //   const data = parent?.children;
  //   if (data && data.length && treeExpandKeys && treeExpandKeys.indexOf(parent.rowKey) >= 0) {
  //     data.forEach((item) => {
  //       keys.push(item.rowKey);
  //       const treeKeys = getTreeChildrenKeys(item);
  //       keys.push(...treeKeys);
  //     });
  //   }
  //   return keys;
  // };

  const getAllExpandKeys = (data: T[]) => {
    const keys: (string | number)[] = [];
    data.forEach((d, i) => {
      const key = getRowKey(rowKey, d, i);
      keys.push(key);
      // if (d?.children && d.children.length) {
      //   const treeChildrenData = getTreeChildrenKeys(d);
      //   if (treeChildrenData.length) {
      //     keys.push(...treeChildrenData);
      //   }
      // }
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
  // todo
  const getChildrenKeys = (data: T[] = [], parentIndex: number, all = true) => {
    const keys: (number | string)[] = [];
    data.map((c, i) => {
      const key = getRowKey(rowKey, c, parentIndex + i);
      keys.push(key);
      // keys.push(c.rowKey);
      if (c?.children && c.children.length && all) {
        keys.push(...getChildrenKeys(c.children, parentIndex + i + 1));
      }
    });
    return keys;
  };

  // const findParentByKey = (data: T[] = [], key: string | number) => {
  //   let item: undefined | T;
  //   for (let i = 0; i < data.length; i++) {
  //     const curr = data[i];
  //     if (curr.rowKey === key) {
  //       item = curr;
  //       break;
  //     }
  //     if (curr?.children && curr.children.length) {
  //       const res = findParentByKey(curr.children, key);
  //       if (res) {
  //         item = res;
  //         break;
  //       }
  //     }
  //   }
  //   return item;
  // };

  // const getSelectParent = (
  //   parentKey: string | number,
  //   selectKeys: (string | number)[],
  //   currSelectedKey: number | string,
  // ) => {
  //   const arr: T[] = [];
  //   // const parent = findParentByKey(dataSource, parentKey);
  //   const parent = findParentByKey(originDataSource, parentKey);
  //   if (!parent) return arr;
  //   const childKeys = getChildrenKeys(parent?.children, false);
  //   const exist = childKeys.filter((cKey) => selectKeys.indexOf(cKey) >= 0);
  //   if (exist.length + 1 === childKeys.length || (childKeys.length === 1 && !exist.length)) {
  //     arr.push(parent);
  //     if (parent?.parentKey) {
  //       arr.push(
  //         ...getSelectParent(parent.parentKey, [...selectKeys, currSelectedKey], parent.rowKey),
  //       );
  //     }
  //   }
  //   return arr;
  // };

  const findParentByKey = (
    data: T[] = [],
    currKey: string | number,
    level: number,
    startIndex: number = 0,
  ) => {
    // let item: undefined | T;
    const info: { parentIndex: number; parent: T; parentKey: number | string } = {} as {
      parentIndex: number;
      parent: T;
      parentKey: number | string;
    };
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const key = getRowKey(rowKey, curr, startIndex + i);
      if (key === currKey) {
        if (level > 0) {
          // item = curr;
          info.parent = curr;
          info.parentKey = key;
          info.parentIndex = startIndex + i;
        }
        break;
      }
      if (curr?.children && curr.children.length) {
        const res = findParentByKey(curr.children, key, level + 1, startIndex + i + 1);
        if (res.parent) {
          info.parent = curr;
          info.parentKey = key;
          info.parentIndex = startIndex + i;
          // item = res;
          break;
        }
      }
    }
    return info;
    // return item;
  };

  const getSelectParent = (selectKeys: (string | number)[], currSelectedKey: number | string) => {
    const parentInfos: SelectedInfo<T>[] = [];
    // const arr: { selectRow: T, selectRowKey: string | number }[] = [];
    // const parent = findParentByKey(dataSource, parentKey);
    // const parent = findParentByKey(originDataSource, currSelectedKey, 0);
    const { parent, parentIndex, parentKey } = findParentByKey(
      originDataSource,
      currSelectedKey,
      0,
    );
    if (!parent) return parentInfos;
    // if (!(parent && (parentIndex || parentIndex === 0) && (parentKey || parentKey === 0))) return arr;
    const childKeys = getChildrenKeys(parent?.children, parentIndex + 1, false);
    const exist = childKeys.filter((cKey) => selectKeys.indexOf(cKey) >= 0);
    if (exist.length + 1 === childKeys.length || (childKeys.length === 1 && !exist.length)) {
      // arr.push(parent);
      parentInfos.push({ record: parent, key: parentKey });
      // arr.push({ selectRow: parent, selectRowKey: parentKey });
      // if (parent?.parentKey) {
      //   arr.push(
      //     ...getSelectParent(parent.parentKey, [...selectKeys, currSelectedKey], parent.rowKey),
      //   );
      // }
      parentInfos.push(...getSelectParent([...selectKeys, currSelectedKey], parentKey));
    }
    return parentInfos;
  };

  const getSelectedItems = (
    data: T[] = [],
    startIndex: number = 0,
    currSelectedKey?: number | string,
  ) => {
    // const arr: { selectRow: T, selectRowKey: string | number }[] = [];
    const selectItems: SelectedInfo<T>[] = [];

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      // const key = d.rowKey;
      const key = getRowKey(rowKey, d, startIndex + i);
      if (currSelectedKey !== undefined) {
        if (currSelectedKey === key) {
          // arr.push(d);
          // arr.push({ selectRow: d, selectRowKey: key });
          selectItems.push({ record: d, key });
          const selectedChildrenItems = getSelectedItems(d?.children, startIndex + i + 1);
          if (selectedChildrenItems.length) {
            selectItems.push(...selectedChildrenItems);
          }
          selectItems.push(...getSelectParent(selectedKeys, currSelectedKey));
          // if (d?.parentKey) {
          //   arr.push(...getSelectParent(d.parentKey, selectedKeys, currSelectedKey));
          // }
        }
      } else {
        // arr.push(d);
        // arr.push({ selectRow: d, selectRowKey: key });
        selectItems.push({ record: d, key });
        const selectedChildrenItems = getSelectedItems(d?.children, startIndex + i + 1);
        if (selectedChildrenItems.length) {
          selectItems.push(...selectedChildrenItems);
        }
      }
    }

    return selectItems;
  };

  // todo 到这都需要优化  handleSelect 需要优化
  const handleSelect = (
    isRadio: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => {
    const key = getRowKey(rowKey, record, rowIndex);
    // const key = record.rowKey;
    const isExist = selectedKeys.indexOf(key) >= 0;

    let keys: (string | number)[] = [];
    let selectedRows: T[] = [];
    let selectedInfoMaps: SelectedInfo<T>[] = [];

    if (!isExist) {
      const selectedItems = getSelectedItems(dataSource, rowIndex, key);

      // const selectedItemKeys = selectedItems.map((s) => {
      //   return s.rowKey;
      // });
      const selectedItemKeys: (string | number)[] = [];
      const selectedItemRows: T[] = [];

      selectedInfoMaps = [...selectedInfos, ...selectedItems];

      selectedInfoMaps.map((s) => {
        selectedItemKeys.push(s.key);
        selectedItemRows.push(s.record);
      });

      // selectedItems.map((s) => {
      //   selectedItemKeys.push(s.selectRowKey);
      //   selectedItemRows.push(s.selectRow);
      //   // return s.selectRowKey;
      // });
      // selectedMaps.map((s) => {
      //   selectedItemRows.unshift(s.record);
      // });
      selectedRows = isRadio ? [record] : selectedItemRows;
      keys = isRadio ? [key] : selectedItemKeys;
      // selectedRows = isRadio ? [record] : [...cacheSelectedRows.current, ...selectedItemRows];
      // selectedRows = isRadio ? [record] : [...cacheSelectedRows.current, ...selectedItems];
      // keys = isRadio ? [key] : [...selectedKeys, ...selectedItemKeys];
    } else {
      const childrenKeys = getChildrenKeys(record?.children, rowIndex + 1);
      // keys = [record.rowKey, ...childrenKeys];
      keys = [key, ...childrenKeys];

      const parentInfo = findParentByKey(originDataSource, key, 0);

      let parentKey = parentInfo?.parentKey;
      while (parentKey) {
        keys.push(parentKey);
        const ancestorInfo = findParentByKey(originDataSource, parentKey, 0);
        parentKey = ancestorInfo?.parentKey;
      }

      // let parentKey = record?.parentKey;
      // while (parentKey) {
      //   keys.push(parentKey);
      //   const parent = findParentByKey(dataSource, parentKey);
      //   parentKey = parent?.parentKey;
      // }

      const selectedItemKeys: (string | number)[] = [];
      const selectedItemRows: T[] = [];

      selectedInfoMaps = selectedInfos.filter((s) => {
        return keys.indexOf(s.key) < 0;
      });
      selectedInfoMaps.map((s) => {
        selectedItemKeys.push(s.key);
        selectedItemRows.push(s.record);
      });

      selectedRows = selectedItemRows;
      keys = selectedItemKeys;

      // keys = selectedKeys.filter((p: string | number) => {
      //   return keys.indexOf(p) < 0;
      // });
      // todo 怎么过滤 lodash isEqual
      // selectedRows = cacheSelectedRows.current.filter((c: T) => {
      //   return keys.indexOf(c.rowKey) >= 0;
      // });
      // selectedRows = selectedMaps.filter((s) => {
      //   return keys.indexOf(s.key) >= 0;
      // }).map((s) => s.record);
    }

    // cacheSelectedRows.current = selectedRows;

    // if (selectedRows && selectedRows.length) {
    //   selectedRows = omitRowsProps(selectedRows);
    // }

    if (typeof rowSelection?.onSelect === 'function') {
      rowSelection.onSelect(record, selected, selectedRows, event);
      // rowSelection.onSelect(omitRowsProps(record)[0], selected, selectedRows, event);
    }

    if (typeof rowSelection?.onChange === 'function') {
      rowSelection?.onChange(keys, selectedRows);
    }

    // onSelect(keys);
    onSelect(keys, selectedInfoMaps);
  };

  const handleExpand = (expanded: boolean, record: T, recordKey: number | string) => {
    // const key = record.rowKey;
    // const key = getRowKey(rowKey, record, rowIndex);
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
    // const key = getRowKey(rowKey, record, rowIndex);
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
    // const record = omitRowsProps(rowData)[0];
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
          handleSelect(isRadio, rowData, rowIndex, selected, event);
        }}
      />
    ) : (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, rowData, rowIndex, selected, event);
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
    // const treeLevel = rowData.treeLevel;
    const treeLevel = treeLevelMap[recordKey];
    const treeExpanded = treeExpandKeys.indexOf(recordKey) >= 0;
    const treeIndent = treeProps?.indentSize || 15;
    const hasChildren = rowData?.children && rowData.children.length > 0;
    // const record = omitRowsProps(rowData)[0];
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

  const renderTr = (rowData: T, i: number) => {
    // const key = rowData.rowKey;
    const key = getRowKey(rowKey, rowData, i);
    let checked: boolean | 'indeterminate' = false;
    // const record = omitRowsProps(rowData)[0];

    const hasChildren = rowData?.children && rowData.children.length;

    if (rowSelection?.type === 'radio' || !hasChildren) {
      checked = selectedKeys.indexOf(key) >= 0;
    } else {
      const childrenKeys = getChildrenKeys(rowData?.children, i + 1);
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
