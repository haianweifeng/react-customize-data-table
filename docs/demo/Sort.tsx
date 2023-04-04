import React, { useState } from 'react';
import type { ColumnsType, FilterInfoType } from 'react-data-table';
import { Table } from 'react-data-table';
import type { SortState } from '../../src/interface';

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
  const [sortedInfo, setSortedInfo] = useState<SortState<DataType>>({} as SortState<DataType>);

  const handleSorter = (sortState) => {
    // setSortedInfo(sortState);
    setSortedInfo((prev) => {
      return { ...prev, [sortState.field]: sortState };
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo['name'] ? sortedInfo['name'].order : null,
      // sortOrder: sortedInfo.field === 'name' ? sortedInfo.order : null,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo['age'] ? sortedInfo['age'].order : null,
      // sortOrder: sortedInfo.field === 'age' ? sortedInfo.order : null,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      sorter: (a, b) => a.address.length - b.address.length,
      sortOrder: sortedInfo['address'] ? sortedInfo['address'].order : null,
      // sortOrder: sortedInfo.field === 'address' ? sortedInfo.order : null,
    },
  ];
  return <Table columns={columns} dataSource={data} bordered onSort={handleSorter} />;
};
export default App;
