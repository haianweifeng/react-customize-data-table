import React from 'react';
import type { ColumnsType, FilterMenusType } from 'react-data-table';
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
    filters: [
      {
        label: 'Joe',
        value: 'Joe',
      },
      {
        label: 'Category 1',
        value: 'Category 1',
      },
      {
        label: 'Category 2',
        value: 'Category 2',
      },
    ],
    filterSearch: true,
    filterMethod: (value: string, record: DataType) => record.name.includes(value),
    // defaultFilteredValue: ['Joe'],
    // filterIcon: (filtered) => <span style={{ color: filtered ? '#1890ff' : '' }}>^</span>,
    width: '30%',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    // filterMultiple: false,
    // defaultFilteredValue: ['London'],
    sorter: (a: DataType, b: DataType) => a.address.length - b.address.length,
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
    filterMethod: (value: string, record: DataType) => record.address.startsWith(value),
    // filterSearch: true,
    filterSearch: (value: string, record: FilterMenusType) => {
      return record.label.toString().toLowerCase().includes(value.trim().toLowerCase());
    },
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
  return <Table columns={columns} dataSource={data} bordered />;
};
export default App;
