### 自定义排序图标

###### 设置 Table 的 renderSorter 属性来自定义图标

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
  const commonStyle = {
    height: '12px',
    transform: 'rotate(-90deg) scale(0.8, 1.2)',
    cursor: 'pointer',
  };
  const handleRenderSorter = ({ activeAsc, activeDesc, triggerAsc, triggerDesc }) => {
    return (
      <>
        <div
          style={{
            ...commonStyle,
            color: activeAsc ? '#197afa' : '#dbdbdb',
          }}
          onClick={triggerAsc}
        >
          {'>'}
        </div>
        <div
          style={{
            ...commonStyle,
            color: activeDesc ? '#197afa' : '#dbdbdb',
          }}
          onClick={triggerDesc}
        >
          {'<'}
        </div>
      </>
    );
  };

  return <Table columns={columns} dataSource={data} bordered renderSorter={handleRenderSorter} />;
};
export default App;
```
