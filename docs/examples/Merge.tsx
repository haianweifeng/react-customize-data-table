import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  age: number;
  tel: string;
  phone: number;
  address: string;
}

const sharedOnCell = (_: DataType, index: number) => {
  if (index === 4) {
    return { colSpan: 0 };
  }
  return {};
};

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
    width: 120,
    render: (text: string) => <a style={style}>{text}</a>,
    onCell: (_, index: number) => ({
      colSpan: (index as number) < 4 ? 1 : 5,
    }),
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: 70,
    onCell: sharedOnCell,
  },
  {
    title: 'Home phone',
    colSpan: 2,
    dataIndex: 'tel',
    onCell: (_, index: number) => {
      if (index === 2) {
        return { rowSpan: 2 };
      }
      if (index === 3) {
        return { rowSpan: 0 };
      }
      if (index === 4) {
        return { colSpan: 0 };
      }

      return {};
    },
  },
  {
    title: 'Phone',
    colSpan: 0,
    dataIndex: 'phone',
    onCell: sharedOnCell,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    onCell: sharedOnCell,
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    tel: '0571-22098909',
    phone: 18889898989,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    tel: '0571-22098333',
    phone: 18889898888,
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    tel: '0575-22098909',
    phone: 18900010002,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 18,
    tel: '0575-22098909',
    phone: 18900010002,
    address: 'London No. 2 Lake Park',
  },
  {
    key: '5',
    name: 'Jake White',
    age: 18,
    tel: '0575-22098909',
    phone: 18900010002,
    address: 'Dublin No. 2 Lake Park',
  },
];

const App = () => <Table columns={columns} dataSource={data} bordered />;

export default App;
