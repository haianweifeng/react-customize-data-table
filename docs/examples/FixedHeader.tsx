import type { ColumnsType } from '@/interface';
import React, { useState } from 'react';
import Table from 'react-customize-data-table';

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
    width: 150,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: 150,
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}

const App = () => {
  const [pageSize, setPageSize] = useState<number>(50);

  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  const handleChange = (page: number, size: number) => {
    setPageSize(size);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      height={300}
      pagination={{
        align: 'right',
        pageSize,
        layout: ['sizes', 'prev', 'pager', 'next', 'jumper', renderInfo],
        onChange: handleChange,
      }}
    />
  );
};
export default App;
