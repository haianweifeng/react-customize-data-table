import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';
import { faker } from '@faker-js/faker';

interface DataType {
  id: React.Key;
  title: string;
  paragraphs: string;
}

const columns: ColumnsType<DataType>[] = [
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

const createData = (id: React.Key) => {
  return {
    id,
    title: faker.lorem.words(),
    paragraphs: faker.lorem.sentences(),
  };
};

for (let i = 0; i < 5000; i++) {
  data.push(createData(i + 1));
}

const App = () => {
  return (
    <Table
      virtualized
      dataSource={data}
      columns={columns}
      bordered
      rowKey="id"
      height={500}
      renderMaxRows={10}
      showHeader={false}
    />
  );
};
export default App;
