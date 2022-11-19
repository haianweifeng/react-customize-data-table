import React, { useState } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: React.ReactNode;
  name: string;
  age: number;
  address: string;
  description: string;
  children?: DataType[];
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: '12%',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    width: '30%',
    key: 'address',
  },
];

const data: DataType[] = [
  {
    key: 1,
    name: 'John Brown sr.',
    age: 60,
    address: 'New York No. 1 Lake Park',
    description:
      'My name is John Brown sr., I am 60 years old, living in New York No. 1 Lake Park.',
    children: [
      {
        key: 11,
        name: 'John Brown',
        age: 42,
        address: 'New York No. 2 Lake Park',
        description:
          'My name is John Brown, I am 42 years old, living in New York No. 2 Lake Park.',
      },
      {
        key: 12,
        name: 'John Brown jr.',
        age: 30,
        address: 'New York No. 3 Lake Park',
        description:
          'My name is John Brown jr., I am 30 years old, living in New York No. 3 Lake Park.',
        children: [
          {
            key: 121,
            name: 'Jimmy Brown',
            age: 16,
            address: 'New York No. 3 Lake Park',
            description:
              'My name is Jimmy Brown, I am 16 years old, living in New York No. 3 Lake Park.',
          },
        ],
      },
      {
        key: 13,
        name: 'Jim Green sr.',
        age: 72,
        address: 'London No. 1 Lake Park',
        description:
          'My name is Jim Green sr., I am 72 years old, living in London No. 1 Lake Park.',
        children: [
          {
            key: 131,
            name: 'Jim Green',
            age: 42,
            address: 'London No. 2 Lake Park',
            description:
              'My name is Jim Green, I am 42 years old, living in London No. 2 Lake Park.',
            children: [
              {
                key: 1311,
                name: 'Jim Green jr.',
                age: 25,
                address: 'London No. 3 Lake Park',
                description:
                  'My name is Jim Green jr., I am 25 years old, living in London No. 3 Lake Park.',
              },
              {
                key: 1312,
                name: 'Jimmy Green sr.',
                age: 18,
                address: 'London No. 4 Lake Park',
                description:
                  'My name is Jimmy Green sr., I am 18 years old, living in London No. 4 Lake Park.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 2,
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.',
  },
];

const App = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedKeys}`, 'selectedRows: ', selectedRows);
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
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Jim Green jr.1', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <Table
      treeProps={{
        // treeColumnsName: 'Address',
        // defaultExpandAllRows: true,
        expandedRowKeys,
        onExpand: (expanded: boolean, record: DataType) => {
          setExpandedRowKeys((prev) => {
            return expanded ? [...prev, record.key] : prev.filter((p) => p !== record.key);
          });
        },
      }}
      expandable={{
        defaultExpandAllRows: true,
        expandedRowRender: (record: DataType) => {
          return <p style={{ margin: 0 }}>{record.description}</p>;
        },
      }}
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      bordered
      rowKey="key"
    />
  );
};

export default App;
