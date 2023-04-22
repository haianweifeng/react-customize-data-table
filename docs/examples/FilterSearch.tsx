import type { ColumnsType, FilterMenus, SorterResult } from '@/interface';
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
    filterMethod: (value: React.Key, record: DataType) => record.name.startsWith(value as string),
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
    filterMethod: (value: React.Key, record: DataType) =>
      record.address.startsWith(value as string),
    filterSearch: (value: string, record: FilterMenus) => {
      return record.label.toString().toLowerCase().includes(value.trim().toLowerCase());
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
  const handleSort = ({ column, order, field }: SorterResult<DataType>) => {
    console.log('sort', column, order, field);
  };

  const handleFilter = (filterInfo: Record<React.Key, React.Key[]>) => {
    console.log('filter', filterInfo);
  };

  return <Table columns={columns} dataSource={data} onSort={handleSort} onFilter={handleFilter} />;
};
export default App;
