import type { ColumnsType } from '@/interface';
import React, { useState } from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  key: React.ReactNode;
  name: string;
  age: number;
  address: string;
  children?: DataType[];
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const data: DataType[] = [
  {
    key: 1,
    name: 'John Brown sr.',
    age: 60,
    address: 'New York No. 1 Lake Park',
    children: [
      {
        key: 11,
        name: 'John Brown',
        age: 42,
        address: 'New York No. 2 Lake Park',
      },
      {
        key: 12,
        name: 'John Brown jr.',
        age: 30,
        address: 'New York No. 3 Lake Park',
        children: [
          {
            key: 121,
            name: 'Jimmy Brown',
            age: 16,
            address: 'New York No. 3 Lake Park',
          },
        ],
      },
      {
        key: 13,
        name: 'Jim Green sr.',
        age: 72,
        address: 'London No. 1 Lake Park',
        children: [
          {
            key: 131,
            name: 'Jim Green',
            age: 42,
            address: 'London No. 2 Lake Park',
            children: [
              {
                key: 1311,
                name: 'Jim Green jr.',
                age: 25,
                address: 'London No. 3 Lake Park',
              },
              {
                key: 1312,
                name: 'Jimmy Green sr.',
                age: 18,
                address: 'London No. 4 Lake Park',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 2,
    name: 'Joe Black 2',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
];

const App = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log(`selectedKeys: ${selectedKeys}`, 'selectedRows: ', selectedRows);
      setSelectedRowKeys(selectedKeys);
    },
    onSelect: (
      record: DataType,
      selected: boolean,
      selectedRows: DataType[],
      nativeEvent: Event,
    ) => {
      console.log(
        'record: ',
        record,
        `selected: ${selected}`,
        'selectedRows: ',
        selectedRows,
        'nativeEvent:',
        nativeEvent,
      );
    },
    onSelectAll: (selected: boolean, selectedRows: DataType[], changeRows: DataType[]) => {
      console.log(
        `selected: ${selected}`,
        'selectedRows: ',
        selectedRows,
        'changeRows: ',
        changeRows,
      );
    },
  };

  return <Table rowSelection={rowSelection} dataSource={data} columns={columns} />;
};

export default App;
