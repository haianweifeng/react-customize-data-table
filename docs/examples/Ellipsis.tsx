import type { ColumnsType } from '@/interface';
import React from 'react';
import Table, { Tooltip } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park, New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 2 Lake Park, London No. 2 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park, Sidney No. 1 Lake Park',
  },
];

const App = () => {
  const handleRenderTooltip = (trigger: React.ReactNode, tip: React.ReactNode) => {
    return (
      <Tooltip tip={tip} placement="bottom" theme="light">
        {trigger}
      </Tooltip>
    );
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      resizable: true,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 60,
      resizable: true,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address 1',
      ellipsis: { tooltip: true },
      resizable: true,
      width: 157,
    },
    {
      title: 'Long Column Long Column Long Column',
      dataIndex: 'address',
      key: 'address 2',
      resizable: true,
      ellipsis: { tooltip: true, renderTooltip: handleRenderTooltip },
      sorter: (a: DataType, b: DataType) => a.address.length - b.address.length,
      filters: [
        {
          label: 'London',
          value: 'London',
        },
        {
          label: 'New York',
          value: 'New York',
        },
      ],
      filterMethod: (value: React.Key, record: DataType) =>
        record.address.startsWith(value as string),
      width: 157,
    },
    {
      title: 'Long Column',
      dataIndex: 'address',
      key: 'address 4',
      resizable: true,
      ellipsis: true,
      width: 157,
    },
  ];

  return <Table columns={columns} dataSource={data} bordered />;
};
export default App;
