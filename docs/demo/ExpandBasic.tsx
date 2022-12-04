import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
  description: string;
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Cash Assets',
    className: 'column-money',
    dataIndex: 'money',
    align: 'right',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    money: '￥300,000.00',
    address: 'New York No. 1 Lake Park',
    description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
  },
  {
    key: '2',
    name: 'Jim Green',
    money: '￥1,256,000.00',
    address: 'London No. 1 Lake Park',
    description: 'My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.',
  },
  {
    key: '3',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
    description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.',
  },
];

const App = () => {
  const rowSelection = {
    onChange: (selectedRowKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
      disabled: record.name === 'Joe1 Black', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <Table
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      bordered={false}
      rowKey="key"
      rowClassName={(record: DataType) => {
        if (record.name === 'John Brown') {
          return 'custom-row';
        }
      }}
      expandable={{
        expandedRowRender: (record: DataType) => <p style={{ margin: 0 }}>{record.description}</p>,
        rowExpandable: (record: DataType) => record.name !== 'Jim Green',
        // expandedRowClassName: (record, index) => {
        //   // todo 待验证样式
        //   return 'expand-row';
        // },
        onExpand: (expanded: boolean, record: DataType) => {
          console.log(`expanded: ${expanded}`, 'record: ', record);
        },
      }}
    />
  );
};

export default App;
