import React from 'react';
import type { ColumnsType, SortInfoType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
    sorter: {
      weight: 1,
      compare: (a: DataType, b: DataType) => a.name.localeCompare(b.name),
    },
  },
  {
    title: 'Age',
    dataIndex: 'age',
    defaultSortOrder: 'desc',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    width: '40%',
    sorter: {
      weight: 2,
      compare: (a: DataType, b: DataType) => a.address.length - b.address.length,
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
  const handleSort = (sortInfo: SortInfoType) => {
    console.log(sortInfo);
  };
  return <Table columns={columns} dataSource={data} bordered onSort={handleSort} />;
};
export default App;
