import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  key: React.Key;
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
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    key: 'age',
    fixed: 'left',
  },
  {
    title: 'Column 1',
    key: 'address1',
    dataIndex: 'address',
    width: 150,
  },
  {
    title: 'Column 2',
    key: 'address2',
    dataIndex: 'address',
    width: 150,
  },
  {
    title: 'Column 3',
    key: 'address3',
    dataIndex: 'address',
    width: 150,
  },
  {
    title: 'Column 4',
    key: 'address4',
    dataIndex: 'address',
    width: 150,
  },
  {
    title: 'Column 5',
    key: 'address5',
    dataIndex: 'address',
    width: 150,
  },
  {
    title: 'Column 6',
    key: 'address6',
    dataIndex: 'address',
    width: 150,
  },
  {
    title: 'Column 7',
    key: 'address7',
    dataIndex: 'address',
    width: 150,
  },
  { title: 'Column 8', key: 'address8', dataIndex: 'address' },
  {
    title: 'Action',
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
    render: () => {
      return (
        <a style={style} onClick={() => console.log('hahahahah---Action')}>
          Action
        </a>
      );
    },
  },
];

const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

const App = () => {
  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      width={1500}
      height={300}
      pagination={{
        align: 'right',
        layout: ['sizes', 'prev', 'pager', 'next', 'jumper', renderInfo],
      }}
    />
  );
};
export default App;
