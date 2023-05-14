import type { ColumnsType } from '@/interface';
import React, { useState } from 'react';
import Table, { Radio } from 'react-customize-data-table';

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
    className: 'column-money',
    dataIndex: 'money',
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
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

  const rowSelection = {
    type: selectionType,
    onSelectAll: (selected: boolean, selectedRows: DataType[], changeRows: DataType[]) => {
      console.log(`selected: ${selected}`);
      console.log('selectedRows:', selectedRows);
      console.log('changeRows:', changeRows);
    },
    onChange: (selectedRowKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log('onChange');
      console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows: ', selectedRows);
    },
    onSelect: (
      record: DataType,
      selected: boolean,
      selectedRows: DataType[],
      nativeEvent: Event,
    ) => {
      console.log('onSelect');
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
      disabled: record.name === 'Joe Black', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Radio checked={selectionType === 'checkbox'} onChange={() => setSelectionType('checkbox')}>
          Checkbox
        </Radio>
        <Radio checked={selectionType === 'radio'} onChange={() => setSelectionType('radio')}>
          Radio
        </Radio>
      </div>
      <Table rowSelection={rowSelection} dataSource={data} columns={columns} bordered />
    </>
  );
};

export default App;
