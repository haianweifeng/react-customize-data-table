import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    type: 'checkbox',
  },
  {
    title: 'Cash Assets',
    className: 'column-money',
    dataIndex: 'money',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    money: '￥300,000.00',
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    money: '￥1,256,000.00',
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
];

const App = () => {
  return <Table dataSource={data} columns={columns} bordered />;
};

export default App;
