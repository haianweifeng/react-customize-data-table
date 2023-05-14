import { ReactComponent as EmptyIcon } from '@/assets/empty.svg';
import type { ColumnsType } from '@/interface';
import React from 'react';
import Table, { Icon } from 'react-customize-data-table';

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
