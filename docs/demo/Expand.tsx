import React, { useState } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
  description: string;
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Cash Assets',
    className: 'column-money',
    dataIndex: 'money',
    align: 'right',
  },
  {
    type: 'expand',
    render: (value: any, record: DataType, rowIndex: number) => {
      return `${record.description}---hhahah`;
    },
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    money: '￥300,000.00',
    address: 'New York No. 1 Lake Park',
    description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
  },
  {
    key: '2',
    name: 'Jim Green',
    money: '￥1,256,000.00',
    address: 'London No. 1 Lake Park',
    description: 'My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.',
  },
  {
    key: '3',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
    description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.',
  },
];

const App = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(['3']);

  const rowSelection = {
    selections: true,
    onChange: (selectedRowKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows: ', selectedRows);
    },
    onSelect: (
      record: DataType,
      selected: boolean,
      selectedRows: DataType[],
      nativeEvent: Event,
    ) => {
      console.log(
        'record: ',
        record,
        `selected: ${selected}`,
        'selectedRows: ',
        selectedRows,
        'nativeEvent:',
        nativeEvent,
      );
    },
    onSelectNone: () => {
      console.log('select none');
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Joe1 Black', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <Table
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      bordered
      // rowKey="key"
      rowClassName={(record: DataType) => {
        if (record.name === 'John Brown') {
          return 'custom-row';
        }
      }}
      expandable={{
        expandedRowKeys,
        // defaultExpandedRowKeys: expandedRowKeys,
        // defaultExpandAllRows: true,
        // expandedRowRender: (record: DataType) => <p style={{ margin: 0 }}>{record.description}</p>,
        rowExpandable: (record: DataType) => record.name !== 'Jim Green',
        expandedRowClassName: (record: DataType, index: number) => {
          // todo 待验证样式
          return 'expand-row';
        },
        // 如果是自定义expandIcon 要配合expandedRowKeys，onExpand 使用，在onExpand 中控制expandedRowKeys
        expandIcon: (
          record: DataType,
          expanded: boolean,
          onExpand: (expanded: boolean, record: DataType) => void,
        ) => {
          return (
            <span
              onClick={() => {
                onExpand(!expanded, record);
              }}
              style={{ cursor: 'pointer' }}
            >
              {expanded ? 'v' : '>'}
            </span>
          );
        },
        onExpand: (expanded: boolean, record: DataType) => {
          console.log(`expanded: ${expanded}`, 'record: ', record);
          setExpandedRowKeys((prev) => {
            return expanded ? [...prev, record.key] : prev.filter((p) => p !== record.key);
          });
        },
      }}
      onRow={(record: DataType, rowIndex: number) => {
        return {
          onClick: () => {
            console.log('click row');
            // console.log(record);
            // console.log(`rowIndex: ${rowIndex}`);
          },
          onDoubleClick: () => {
            console.log('double click');
          },
          // onMouseEnter: () => {
          //   console.log('mouse enter');
          // },
          // onMouseLeave: () => {
          //   console.log('mouse leave');
          // }
        };
      }}
    />
  );
};

export default App;
