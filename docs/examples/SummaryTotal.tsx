import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  id: string;
  name: string;
  amount1: number;
  amount2: number;
  amount3: number;
  amount4: number;
  amount5: number;
}

const style = {
  color: '#1890ff',
  textDecoration: 'none',
  cursor: 'pointer',
  outline: 'none',
};

const columns: ColumnsType<DataType> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    fixed: 'left',
    width: 120,
  },
  {
    title: 'Name',
    width: 120,
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: 'Amount1',
    key: 'amount1',
    dataIndex: 'amount1',
    width: 120,
  },
  {
    title: 'Amount2',
    key: 'amount2',
    dataIndex: 'amount2',
    width: 120,
  },
  {
    title: 'Amount3',
    key: 'amount3',
    dataIndex: 'amount3',
    width: 120,
  },
  {
    title: 'Amount4',
    key: 'amount4',
    dataIndex: 'amount4',
    width: 120,
  },
  {
    title: 'Amount5',
    key: 'amount5',
    dataIndex: 'amount5',
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
    id: '100001',
    name: 'John Brown',
    amount1: 123,
    amount2: 1.2,
    amount3: 10,
    amount4: 45,
    amount5: 211,
  },
  {
    id: '100002',
    name: 'Jim Green',
    amount1: 234,
    amount2: 2.3,
    amount3: 11,
    amount4: 4,
    amount5: 76,
  },
  {
    id: '100003',
    name: 'Joe Black',
    amount1: 345,
    amount2: 3.4,
    amount3: 12,
    amount4: 90,
    amount5: 500,
  },
  {
    id: '100004',
    name: 'Jon Snow',
    amount1: 456,
    amount2: 4.5,
    amount3: 13,
    amount4: 55,
    amount5: 11,
  },
  {
    id: '100005',
    name: 'Jobs',
    amount1: 678,
    amount2: 5.6,
    amount3: 14,
    amount4: 88,
    amount5: 44,
  },
];

const App = () => {
  return (
    <Table
      rowKey="id"
      bordered
      columns={columns}
      dataSource={data}
      height={200}
      summary={[
        [
          { render: () => <span>总价</span> },
          { render: () => <span>N/A</span> },
          { render: () => <span>{data.reduce((prev, curr) => prev + curr.amount1, 0)}</span> },
          { render: () => <span>{data.reduce((prev, curr) => prev + curr.amount2, 0)}</span> },
          { render: () => <span>{data.reduce((prev, curr) => prev + curr.amount3, 0)}</span> },
          { render: () => <span>{data.reduce((prev, curr) => prev + curr.amount4, 0)}</span> },
          { render: () => <span>{data.reduce((prev, curr) => prev + curr.amount5, 0)}</span> },
          { render: () => <span>N/A</span> },
        ],
      ]}
    />
  );
};
export default App;
