import { useMemo, useState, useCallback } from 'react';
import { ColumnGroupsType, ColumnType, ColumnsType } from '../interface1';
import { ColumnsGroupWithType, ColumnsWithType } from '../interface';
import { SELECTION_EXPAND_COLUMN_WIDTH } from '../utils/constant';

function useColumns<T>(originColumns: ColumnsType<T> | ColumnGroupsType<T>) {
  const [columns, setColumns] = useState<ColumnsType<T> | ColumnGroupsType<T>>(originColumns);

  // const formatColumns = useCallback(() => {
  //   originColumns.map((column) => {
  //
  //   });
  // }, []);
  //
  // const formatColumns = useMemo(() => {
  //   // todo insertBeforeColumnName 如果是放到最后一列
  //   let insertIndex = 0;
  //   const cols = columns.map((column, index: number) => {
  //     const { title } = column;
  //     if (expandable?.insertBeforeColumnName === title) insertIndex = index;
  //     const cell: ColumnsWithType<T> | ColumnsGroupWithType<T> = {
  //       type: '',
  //       ...column,
  //     };
  //
  //     return cell;
  //   });
  //
  //   if (rowSelection) {
  //     cols.unshift({
  //       type: rowSelection.type || 'checkbox',
  //       dataIndex: 'checkbox',
  //       title: rowSelection?.columnTitle || '',
  //       width: rowSelection?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
  //     });
  //
  //     if (expandable?.insertBeforeColumnName) {
  //       insertIndex += 1;
  //     }
  //   }
  //
  //   if (expandable && expandable?.expandedRowRender) {
  //     cols.splice(insertIndex, 0, {
  //       type: 'expanded',
  //       dataIndex: 'expanded',
  //       title: expandable?.columnTitle || '',
  //       width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
  //     });
  //   }
  //
  //   return cols;
  // }, [columns, expandable, rowSelection]);
}
export default useColumns;
