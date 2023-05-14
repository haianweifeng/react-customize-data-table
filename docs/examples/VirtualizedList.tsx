import type { ColumnsType } from '@/interface';
import { faker } from '@faker-js/faker';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  id: number;
  title: string;
  paragraphs: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Title',
    dataIndex: 'title',
    render: (text: any, record: DataType) => {
      return (
        <div>
          <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{`${record.title}_${record.id}`}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{record.paragraphs}</div>
        </div>
      );
    },
  },
];

const data: DataType[] = [];

const createData = (id: number) => {
  return {
    id,
    title: faker.lorem.words(),
    paragraphs: faker.lorem.sentences(),
  };
};

for (let i = 0; i < 50; i++) {
  data.push(createData(i + 1));
}

const App = () => {
  return (
    <Table
      virtualized
      dataSource={data}
      columns={columns}
      rowKey="id"
      height={500}
      renderMaxRows={10}
      showHeader={false}
    />
  );
};
export default App;
