import React from 'react';
import classnames from 'classnames';
import type { CellProps } from '../interface';
import type { TableProps } from '../Table';
import Radio from '../Radio';
import Checkbox from '../Checkbox';
import Td from '../Td';

interface TrProps<T> extends TableProps<T> {
  rowData: T;
  rowIndex: number;
  checked: boolean;
  expanded: boolean;
  onSelect: (
    isRadio: boolean,
    record: T,
    rowIndex: number,
    selected: boolean,
    event: Event,
  ) => void;
  onExpand: (expanded: boolean, record: T, rowIndex: number) => void;
}
function Tr<T>(props: TrProps<T>) {
  const {
    rowData,
    rowIndex,
    columns,
    checked,
    rowSelection,
    expandable,
    expanded,
    onExpand,
    onSelect,
    striped,
    rowClassName,
  } = props;

  const handleChange = (isRadio: boolean, selected: boolean, event: Event) => {
    onSelect(isRadio, rowData, rowIndex, selected, event);
  };

  const handleExpandClick = () => {
    onExpand(!expanded, rowData, rowIndex);
  };

  const getSelectionType = () => {
    if (rowSelection) {
      return rowSelection.type || 'checkbox';
    }
    return '';
  };

  const getColumns = () => {
    let insertIndex = 0;
    const formatColumns = columns.map((column, index: number) => {
      const { render, dataIndex, onCell, align, className, fixed, title } = column;
      if (expandable?.insertBeforeColumnName === title) insertIndex = index;
      const cell: CellProps = {
        isSelectionExpandColumn: false,
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
      if (typeof render === 'function') {
        cell.content = render(rowData[dataIndex as keyof T] as string, rowData, rowIndex);
      }
      cell.content = rowData[dataIndex as keyof T] as string;
      return cell;
    });

    const type = getSelectionType();

    if (type) {
      const checkboxProps =
        typeof rowSelection?.getCheckboxProps === 'function'
          ? rowSelection.getCheckboxProps(rowData)
          : {};
      const isRadio = type === 'radio';
      const defaultContent = isRadio ? (
        <Radio
          {...checkboxProps}
          checked={!!checked}
          onChange={(selected: boolean, event: Event) => {
            handleChange(isRadio, selected, event);
          }}
        />
      ) : (
        <Checkbox
          {...checkboxProps}
          checked={!!checked}
          onChange={(selected: boolean, event: Event) => {
            handleChange(isRadio, selected, event);
          }}
        />
      );

      // todo fixed
      formatColumns.unshift({
        isSelectionExpandColumn: true,
        // fixed: rowSelection?.fixed,
        colSpan: 1,
        rowSpan: 1,
        content:
          typeof rowSelection?.renderCell === 'function'
            ? rowSelection.renderCell(!!checked, rowData, rowIndex, defaultContent)
            : defaultContent,
      });
    }

    let ableExpand = !!expandable;

    if (expandable?.rowExpandable && expandable?.rowExpandable(rowData) === false) {
      ableExpand = false;
    }

    if (ableExpand) {
      const expandIcon = (
        <span
          className={classnames({
            'expand-icon': true,
            'expand-icon-divider': expanded,
          })}
          onClick={handleExpandClick}
        />
      );

      // todo fixed
      formatColumns.splice(insertIndex, 0, {
        isSelectionExpandColumn: true,
        colSpan: 1,
        rowSpan: 1,
        content:
          typeof expandable?.expandIcon === 'function'
            ? expandable.expandIcon(rowData, expanded)
            : expandIcon,
      });
    }

    return formatColumns;
  };

  const renderTds = () => {
    const tds = [];
    const formatColumns = getColumns();
    for (let i = 0; i < formatColumns.length; i++) {
      const column = formatColumns[i];
      if (!column.colSpan || !column.rowSpan) continue;
      tds.push(<Td key={i} {...column} />);
    }

    return tds;
  };

  const renderExpandRow = () => {
    if (!expandable || !expandable.expandedRowRender || !expanded) return;
    const formatColumns = getColumns();
    const cls =
      expandable?.expandedRowClassName && expandable.expandedRowClassName(rowData, rowIndex);
    return (
      <tr key="1" className={cls}>
        <td colSpan={formatColumns.length}>
          {expandable.expandedRowRender(rowData, rowIndex, expanded)}
        </td>
      </tr>
    );
  };

  const clsInfo: any = {
    'row-even': striped && rowIndex % 2 === 1,
    'row-odd': striped && rowIndex % 2 !== 1,
    'row-selected': checked,
  };

  if (rowClassName && rowClassName(rowData, rowIndex)) {
    clsInfo[rowClassName(rowData, rowIndex)] = !!rowClassName(rowData, rowIndex);
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
