import type { ColumnsType, SorterResult } from '@/interface';
import React, { useState } from 'react';
import Table from 'react-data-table';

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
  const [filteredInfo, setFilteredInfo] = useState<Record<React.Key, React.Key[]>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>(
    {} as SorterResult<DataType>,
  );

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: [
        { label: 'Joe', value: 'Joe' },
        { label: 'Jim', value: 'Jim' },
      ],
      filteredValue: filteredInfo.name || null,
      filterMethod: (value: React.Key, record) => record.name.includes(value as string),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.field === 'name' ? sortedInfo.order : null,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo.field === 'age' ? sortedInfo.order : null,
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
      filterMethod: (value: React.Key, record: DataType) =>
        record.address.includes(value as string),
      sorter: (a, b) => a.address.length - b.address.length,
      sortOrder: sortedInfo.field === 'address' ? sortedInfo.order : null,
    },
  ];

  const handleSort = (sort: SorterResult<DataType>) => {
    setSortedInfo(sort);
  };

  const handleFilter = (filter: Record<React.Key, React.Key[]>) => {
    setFilteredInfo(filter);
  };

  return <Table columns={columns} dataSource={data} onSort={handleSort} onFilter={handleFilter} />;
};
export default App;
