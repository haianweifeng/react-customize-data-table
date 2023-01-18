import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table, Icon } from 'react-data-table';
import { ReactComponent as EmptyIcon } from '../../src/assets/empty.svg';

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
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [];

const App = () => {
  const emptyContent = (
    <div>
      <div>
        <Icon component={EmptyIcon} style={{ fontSize: '42px' }} />
      </div>
      <div>暂无数据</div>
    </div>
  );

  return <Table columns={columns} dataSource={data} empty={emptyContent} />;
};

export default App;
