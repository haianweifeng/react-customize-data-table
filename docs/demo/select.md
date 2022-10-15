### 选择行受控

###### 设置 rowSelection.selectedRowKeys 属性表示选择行会受控

Demo:

```tsx
import React, { useState } from 'react';
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

const App = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelectedRowKeys(selectedRowKeys);
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
    <Table rowSelection={rowSelection} dataSource={data} columns={columns} bordered rowKey="key" />
  );
};

export default App;
```
