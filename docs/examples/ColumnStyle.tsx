import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

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
  },
  {
    title: 'Age',
    dataIndex: 'age',
    className: 'demo-table-info-column',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [
  {
    key: 1,
    name: 'John Brown',
    age: 18,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: 2,
    name: 'Jim Green',
    age: 24,
    address: 'London No. 1 Lake Park',
  },
  {
    key: 3,
    name: 'Joe Black',
    age: 30,
    address: 'Sydney No. 1 Lake Park',
  },
  {
    key: 4,
    name: 'Jon Snow',
    age: 26,
    address: 'Ottawa No. 2 Lake Park',
  },
];

const App = () => {
  return <Table dataSource={data} columns={columns} />;
};
export default App;
