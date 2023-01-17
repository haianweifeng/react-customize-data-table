import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table, Tooltip } from 'react-data-table';

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

  const columns: ColumnsType<DataType>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
      width: 150,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 80,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address 1',
      ellipsis: { tooltip: true },
      resizable: true,
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
      filterMethod: (value: string, record: DataType) => record.address.startsWith(value),
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Long Column Long Column',
      dataIndex: 'address',
      key: 'address 3',
      resizable: true,
      // ellipsis: true,
      ellipsis: { tooltip: true, tooltipTheme: 'light' },
    },
    {
      title: 'Long Column',
      dataIndex: 'address',
      key: 'address 4',
      // ellipsis: true,
      ellipsis: { tooltip: true, tooltipTheme: 'light' },
    },
  ];

  return <Table columns={columns} dataSource={data} bordered />;
};
export default App;
