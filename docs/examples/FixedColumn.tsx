import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  date: string;
  name: string;
  province: string;
  city: string;
  address: string;
  zip: number;
}

const style = {
  color: '#1890ff',
  textDecoration: 'none',
  cursor: 'pointer',
  outline: 'none',
};

const columns: ColumnsType<DataType> = [
  {
    title: '日期',
    width: 150,
    dataIndex: 'date',
    key: 'date',
    fixed: 'left',
  },
  {
    title: '姓名',
    width: 120,
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '省份',
    key: 'province',
    dataIndex: 'province',
    width: 120,
  },
  {
    title: '市区',
    key: 'city',
    dataIndex: 'city',
    width: 120,
  },
  {
    title: '地址',
    key: 'address',
    dataIndex: 'address',
    width: 300,
  },
  {
    title: '邮编',
    key: 'zip',
    dataIndex: 'zip',
    width: 120,
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
    render: () => {
      return (
        <>
          <a style={style} key="view">
            查看
          </a>
          <a style={{ ...style, paddingLeft: '20px' }} key="edit">
            编辑
          </a>
        </>
      );
    },
  },
];

const data: DataType[] = [
  {
    date: '2016-05-02',
    name: '王小虎',
    province: '上海',
    city: '普陀区',
    address: '上海市普陀区金沙江路 1518 弄',
    zip: 200333,
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    province: '上海',
    city: '普陀区',
    address: '上海市普陀区金沙江路 1517 弄',
    zip: 200333,
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    province: '上海',
    city: '普陀区',
    address: '上海市普陀区金沙江路 1519 弄',
    zip: 200333,
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    province: '上海',
    city: '普陀区',
    address: '上海市普陀区金沙江路 1516 弄',
    zip: 200333,
  },
];

const App = () => {
  return <Table rowKey="date" columns={columns} dataSource={data} />;
};
export default App;
