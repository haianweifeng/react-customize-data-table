import React from 'react';
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
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    fixed: 'left',
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    fixed: 'left',
  },
  {
    title: 'Column 1',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 2',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 3',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 4',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 5',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 6',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 7',
    dataIndex: 'address',
    width: 180,
  },
  { title: 'Column 8', dataIndex: 'address' },
  {
    title: 'Action',
    fixed: 'right',
    width: 100,
    render: () => <a>action</a>,
  },
];

const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

const App = () => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      // width={1500}
      width={1740}
      height={300}
      bordered
    />
  );
};
export default App;
