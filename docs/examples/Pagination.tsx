import type { ColumnsType } from '@/interface';
import React, { useState } from 'react';
import Table from 'react-data-table';

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
    filters: [
      { label: 'Edward King 2', value: '2' },
      { label: 'Jim', value: 'Jim' },
    ],
    filterMethod: (value: React.Key, record: DataType) => record.name.includes(value as string),
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32 + i,
    address: `London, Park Lane no. ${i}`,
  });
}

const App = () => {
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const handleChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  };

  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      height={300}
      pagination={{
        align: 'right',
        current,
        pageSize,
        layout: ['sizes', 'prev', 'pager', 'next', 'jumper', renderInfo],
        onChange: handleChange,
      }}
    />
  );
};

export default App;
