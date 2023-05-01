import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  borrow: number;
  repayment: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Borrow',
    dataIndex: 'borrow',
  },
  {
    title: 'Repayment',
    dataIndex: 'repayment',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    borrow: 10,
    repayment: 33,
  },
  {
    key: '2',
    name: 'Jim Green',
    borrow: 100,
    repayment: 0,
  },
  {
    key: '3',
    name: 'Joe Black',
    borrow: 10,
    repayment: 10,
  },
  {
    key: '4',
    name: 'Jim Red',
    borrow: 75,
    repayment: 45,
  },
];

const App = () => {
  return (
    <Table
      bordered
      dataSource={data}
      columns={columns}
      summary={[
        [
          { render: () => <span>Total</span> },
          { render: () => <span style={{ color: '#ff4d4f' }}>195</span> },
          { render: () => <span>88</span> },
        ],
        [
          { render: () => <span>Balance</span> },
          { render: () => <span style={{ color: '#ff4d4f' }}>107</span>, colSpan: 2 },
        ],
      ]}
    />
  );
};
export default App;
