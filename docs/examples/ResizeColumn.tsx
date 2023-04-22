import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  id: number;
  date: string;
  age: number;
  address: string;
}

const App = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: 'Date',
      dataIndex: 'date',
      resizable: true,
      width: 180,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      resizable: true,
      maxWidth: '100',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
  ];

  const data = [
    {
      id: 1,
      name: 'John Brown',
      age: 18,
      address: 'New York No. 1 Lake Park.凑字数凑字数凑字数凑字数',
      date: '2016-10-03',
    },
    {
      id: 2,
      name: 'Jim Green',
      age: 24,
      address: 'London No. 1 Lake Park',
      date: '2016-10-01',
    },
    {
      id: 3,
      name: 'Joe Black',
      age: 30,
      address: 'Sydney No. 1 Lake Park',
      date: '2016-10-02',
    },
    {
      id: 4,
      name: 'Jon Snow',
      age: 26,
      address: 'Ottawa No. 2 Lake Park',
      date: '2016-10-04',
    },
  ];

  const handleColumnResize = (
    newWidth: number,
    oldWidth: number,
    column: ColumnsType<DataType>,
    event: Event,
  ) => {
    console.log(`newWidth: ${newWidth}`);
    console.log(`oldWidth: ${oldWidth}`);
    console.log(column);
    console.log(event);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      onColumnResize={handleColumnResize}
    />
  );
};
export default App;
