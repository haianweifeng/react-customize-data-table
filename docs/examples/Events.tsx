import type { ColumnGroupType, ColumnsType, ColumnType } from '@/interface';
import React from 'react';
import Table from 'react-customize-data-table';

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
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    filters: [
      { label: 'London', value: 'London' },
      { label: 'New York', value: 'New York' },
    ],
    filterMethod: (value: React.Key, record: DataType) => record.address.includes(value as string),
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
  return (
    <Table
      dataSource={data}
      columns={columns}
      onRowEvents={(record: DataType, rowIndex: number) => {
        return {
          onClick: () => {
            console.log(`click row ${rowIndex}:`, record);
          },
          onDoubleClick: () => {
            console.log('double click row');
          },
        };
      }}
      onCellEvents={(record: DataType, rowIndex: number) => {
        return {
          onClick: () => {
            console.log(`${rowIndex} cell click:`, record);
          },
          onDoubleClick: () => {
            console.log('double cell click');
          },
        };
      }}
      onHeaderRowEvents={(rowIndex: number) => {
        return {
          onClick: () => {
            console.log(`header row click: ${rowIndex}`);
          },
        };
      }}
      onHeaderCellEvents={(
        column: ColumnType<DataType> | ColumnGroupType<DataType>,
        rowIndex: number,
      ) => {
        return {
          onClick: () => {
            console.log(`header ${rowIndex} cell click:`, column);
          },
        };
      }}
    />
  );
};
export default App;
