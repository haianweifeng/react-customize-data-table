import React, { useState } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: React.ReactNode;
  name: string;
  age: number;
  address: string;
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
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 3,
    name: 'Joe Black',
    age: 42,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 4,
    name: 'Joe Black',
    age: 52,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 5,
    name: 'Joe Black',
    age: 62,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 7,
    name: 'Joe Black',
    age: 72,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 8,
    name: 'Joe Black',
    age: 82,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 9,
    name: 'Joe Black',
    age: 92,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 10,
    name: 'Joe Black',
    age: 102,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 21,
    name: 'Joe Black',
    age: 112,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 22,
    name: 'Joe Black',
    age: 122,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 23,
    name: 'Joe Black',
    age: 232,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 24,
    name: 'Joe Black',
    age: 242,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 25,
    name: 'Joe Black',
    age: 252,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 26,
    name: 'Joe Black',
    age: 262,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 27,
    name: 'Joe Black',
    age: 272,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 28,
    name: 'Joe Black',
    age: 282,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 29,
    name: 'Joe Black',
    age: 292,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 30,
    name: 'Joe Black',
    age: 302,
    address: 'Sidney No. 1 Lake Park',
  },
];

const App = () => {
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    // selectedRowKeys,
    onChange: (selectedKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log(`selectedKeys: ${selectedKeys}`, 'selectedRows: ', selectedRows);
      // setSelectedRowKeys(selectedRowKeys);
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
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Jim Green jr.', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <Table
      treeProps={{
        // treeColumnsName: 'Address',
        // defaultExpandAllRows: true,
        expandedRowKeys,
        expandIcon: (
          rowData: DataType,
          treeExpanded: boolean,
          onExpand?: (expanded: boolean, record: DataType) => void,
        ) => {
          return (
            <span
              onClick={() => {
                setExpandedRowKeys((prev) => {
                  if (treeExpanded) {
                    return prev.filter((p) => p !== rowData.key);
                  } else {
                    return [...prev, rowData.key];
                  }
                });
                onExpand && onExpand(treeExpanded, rowData);
              }}
            >
              **
            </span>
          );
          // return '**';
          // return <span>**</span>
        },
        onExpand: (expanded: boolean, record: DataType) => {
          console.log(`expanded: ${expanded}`, 'record: ', record);
        },
      }}
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      bordered
      rowKey="key"
      height={300}
    />
  );
};

export default App;
