import type { ColumnsType } from '@/interface';
import React, { useState } from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Cash Assets',
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
  },
  {
    key: '2',
    name: 'Jim Green',
    money: '￥1,256,000.00',
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
];

const App = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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
      console.log('onSelect');
      console.log(record);
      console.log(selected);
      console.log(selectedRows);
      console.log(nativeEvent);
    },
  };

  return <Table rowSelection={rowSelection} dataSource={data} columns={columns} bordered />;
};

export default App;
