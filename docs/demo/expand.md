### 可展开

Demo:

```tsx
import React, { useState, useEffect } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
  description: string;
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
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      console.log(record);
      console.log(selected);
      console.log(selectedRows);
      console.log(nativeEvent);
    },
    getCheckboxProps: (record) => ({
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
      rowKey="key"
      rowClassName={(record) => {
        if (record.name === 'John Brown') {
          return 'custom-row';
        }
      }}
      expandable={{
        defaultExpandAllRows: true,
        expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
        rowExpandable: (record) => record.name !== 'Not Expandable',
        expandedRowClassName: (record, index) => {
          return 'expand-row';
        },
      }}
    />
  );
};

export default App;
```
