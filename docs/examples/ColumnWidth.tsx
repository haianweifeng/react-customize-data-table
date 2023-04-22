import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  id: string;
  name: string;
  amount1: string;
  amount2: string;
  amount3: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 180,
    resizable: true,
    onCell: (record: DataType, rowIndex: number) => {
      if (rowIndex === 0) {
        return { colSpan: 2 };
      }
      return {};
    },
  },
  {
    title: '姓名',
    dataIndex: 'name',
    resizable: true,
    onCell: (record: DataType, rowIndex: number) => {
      if (rowIndex === 0) {
        return { colSpan: 0 };
      }
      return {};
    },
  },
  {
    title: '数值1',
    dataIndex: 'amount1',
    resizable: true,
    width: '120px',
  },
  {
    title: '数值2',
    dataIndex: 'amount2',
    resizable: true,
  },
  {
    title: '数值3',
    dataIndex: 'amount3',
    resizable: true,
    maxWidth: 80,
  },
];

const data: DataType[] = [
  {
    id: '12987122',
    name: '王小虎',
    amount1: '234',
    amount2: '3.2',
    amount3: 10,
  },
  {
    id: '12987123',
    name: '王小虎',
    amount1: '165',
    amount2: '4.43',
    amount3: 12,
  },
  {
    id: '12987124',
    name: '王小虎',
    amount1: '324',
    amount2: '1.9',
    amount3: 9,
  },
  {
    id: '12987125',
    name: '王小虎',
    amount1: '621',
    amount2: '2.2',
    amount3: 17,
  },
  {
    id: '12987126',
    name: '王小虎',
    amount1: '539',
    amount2: '4.1',
    amount3: 15,
  },
];

const App = () => {
  return <Table columns={columns} dataSource={data} rowKey="id" bordered />;
};
export default App;
