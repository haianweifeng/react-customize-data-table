### 可选择行

###### 设置 rowSelection 会自动在第一列添加选择框,默认 rowSelection.type 为 checkbox

Demo:

```tsx
import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Cash Assets',
    className: 'column-money',
    dataIndex: 'money',
    align: 'right',
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
  },
  {
    key: '2',
    name: 'Jim Green',
    money: '￥1,256,000.00',
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
];

const rowSelection = {
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(`selected: ${selected}`);
    console.log('selectedRows:', selectedRows);
    console.log('changeRows:', changeRows);
  },
  onChange: (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows, nativeEvent) => {
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
  getCheckboxProps: (record) => ({
    disabled: record.name === 'Joe Black', // Column configuration not to be checked
    name: record.name,
  }),
};

export default () => (
  <Table rowSelection={rowSelection} dataSource={data} columns={columns} bordered rowKey="key" />
);
```
