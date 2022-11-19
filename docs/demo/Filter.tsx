import React, { useState } from 'react';
import type { ColumnsType, FilterInfoType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

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
  const [filteredInfo, setFilteredInfo] = useState<FilterInfoType>({});

  const handleFilter = (filters: FilterInfoType) => {
    console.log(filters);
    setFilteredInfo(filters);
  };

  const columns: ColumnsType<DataType>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: [
        { label: 'Joe', value: 'Joe' },
        { label: 'Jim', value: 'Jim' },
      ],
      filteredValue: filteredInfo.name || null,
      filterMethod: (value: string, record: DataType) => record.name.includes(value),
      sorter: (a: DataType, b: DataType) => a.name.length - b.name.length,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a: DataType, b: DataType) => a.age - b.age,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      filters: [
        { label: 'London', value: 'London' },
        { label: 'New York', value: 'New York' },
      ],
      filteredValue: filteredInfo.address || null,
      filterMethod: (value: string, record: DataType) => record.address.includes(value),
      sorter: (a: DataType, b: DataType) => a.address.length - b.address.length,
    },
  ];
  return <Table columns={columns} dataSource={data} bordered onFilter={handleFilter} />;
};
export default App;
