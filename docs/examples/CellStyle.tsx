import type { ColumnsType, ColumnType } from '@/interface';
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
  return (
    <Table
      dataSource={data}
      columns={columns}
      cellClassName={(column: ColumnType<DataType>, rowIndex: number, colIndex: number) => {
        if (column.dataIndex === 'name') {
          if (rowIndex === 3 && colIndex === 0) {
            return 'demo-table-info-cell-name';
          }
        } else {
          if (rowIndex === 1) {
            return colIndex === 1 ? 'demo-table-info-cell-age' : 'demo-table-info-cell-address';
          }
        }
        return '';
      }}
    />
  );
};
export default App;
