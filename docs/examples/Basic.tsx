import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

const style = {
  color: '#1890ff',
  textDecoration: 'none',
  cursor: 'pointer',
  outline: 'none',
};

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a style={style}>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <div>
        <a style={style}>Invite {record.name}</a>
        <a style={{ ...style, paddingLeft: '16px' }}>Delete</a>
      </div>
    ),
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
];

const App = () => {
  return <Table columns={columns} dataSource={data} />;
};
export default App;
