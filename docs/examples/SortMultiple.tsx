import type { ColumnsType, SorterResult } from '@/interface';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  key: React.Key;
  name: string;
  chinese: number;
  math: number;
  english: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Chinese Score',
    dataIndex: 'chinese',
    sorter: {
      compare: (a: DataType, b: DataType) => a.chinese - b.chinese,
      weight: 3,
    },
  },
  {
    title: 'Math Score',
    dataIndex: 'math',
    sorter: {
      compare: (a: DataType, b: DataType) => a.math - b.math,
      weight: 2,
    },
  },
  {
    title: 'English Score',
    dataIndex: 'english',
    sorter: {
      compare: (a: DataType, b: DataType) => a.english - b.english,
      weight: 1,
    },
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    chinese: 98,
    math: 60,
    english: 70,
  },
  {
    key: '2',
    name: 'Jim Green',
    chinese: 98,
    math: 66,
    english: 89,
  },
  {
    key: '3',
    name: 'Joe Black',
    chinese: 98,
    math: 90,
    english: 70,
  },
  {
    key: '4',
    name: 'Jim Red',
    chinese: 88,
    math: 99,
    english: 89,
  },
];

const App = () => {
  const handleSort = ({ column, order, field }: SorterResult<DataType>) => {
    console.log('sort', column, order, field);
  };

  return <Table columns={columns} dataSource={data} onSort={handleSort} />;
};
export default App;
