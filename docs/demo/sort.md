### 排序

###### 对某一列数据进行排序，通过指定列的 sorter 函数即可启动排序按钮。sorter: function(rowA, rowB) { ... }， rowA、rowB 为比较的两个行数据。

###### 使用 defaultSortOrder 属性，设置列的默认排序顺序。

Demo:

```tsx
import React, { useState } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
    sorter: {
      weight: 1,
      compare: (a, b) => a.name.localeCompare(b.name),
    },
  },
  {
    title: 'Age',
    dataIndex: 'age',
    defaultSortOrder: 'desc',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    width: '40%',
    sorter: {
      weight: 2,
      compare: (a, b) => a.address.length - b.address.length,
    },
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
  },
];

const App = () => {
  const handleSortCancel = (cancelName, order) => {
    console.log(`取消排序字段: ${cancelName}`);
    console.log(order);
  };
  return <Table columns={columns} dataSource={data} bordered onSortCancel={handleSortCancel} />;
};
export default App;
```
