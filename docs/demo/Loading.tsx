import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table, Spin } from 'react-data-table';

interface DataType {
  key: number;
  name: string;
  age: number;
  address: string;
  description: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    filters: [
      {
        label: 'London',
        value: 'London',
      },
      {
        label: 'New York',
        value: 'New York',
      },
    ],
    filterMethod: (value: string, record: DataType) =>
      record.address.indexOf(value as string) === 0,
  },
];

const data: DataType[] = [];
for (let i = 1; i <= 18; i++) {
  data.push({
    key: i,
    name: 'John Brown',
    age: Number(`${i}2`),
    address: `New York No. ${i} Lake Park`,
    description: `My name is John Brown, I am ${i}2 years old, living in New York No. ${i} Lake Park.`,
  });
}

const App = () => {
  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  return (
    <Table
      bordered
      loading={<Spin type="grid" tip="Loading..." />}
      columns={columns}
      dataSource={data}
      pagination={{
        align: 'right',
        layout: ['sizes', 'prev', 'pager', 'next', 'jumper', renderInfo],
      }}
      rowSelection={{}}
    />
  );
};
export default App;
