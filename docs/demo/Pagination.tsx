import React, { useState } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
  // description: string;
  children?: DataType[];
  description: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      { label: 'Edward King 2', value: '2' },
      { label: 'Jim', value: 'Jim' },
    ],
    filterMethod: (value: string, record: DataType) => record.name.includes(value),
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const data: DataType[] = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32 + i,
    address: `London, Park Lane no. ${i}`,
    description: 'test description',
    // children: [
    //   {
    //     key: `${i}_1`,
    //     name: 'Jim Green jr.',
    //     age: 25 + i,
    //     address: 'London No. 3 Lake Park',
    //   },
    // ],
  });
}

const App = () => {
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  // const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const handleChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  };

  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  const rowSelection = {
    onSelectAll: (selected: boolean, selectedRows: DataType[], changeRows: DataType[]) => {
      console.log(`selected: ${selected}`);
      console.log('selectedRows:', selectedRows);
      console.log('changeRows:', changeRows);
    },
    onChange: (selectedRowKeys: (string | number)[], selectedRows: DataType[]) => {
      console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows: ', selectedRows);
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
  };

  return (
    <Table
      bordered
      columns={columns}
      dataSource={data}
      // rowSelection={rowSelection}
      height={300}
      // renderMaxRows={3}
      pagination={{
        align: 'right',
        current,
        pageSize,
        layout: ['sizes', 'prev', 'pager', 'next', 'jumper', renderInfo],
        onChange: handleChange,
      }}
      expandable={{
        defaultExpandAllRows: true,
        expandedRowRender: (record: DataType) => <p style={{ margin: 0 }}>{record.description}</p>,
        onExpand: (expanded: boolean, record: DataType) => {
          console.log(`expanded: ${expanded}`, 'record: ', record);
        },
      }}
      // treeProps={
      //   {
      //     // expandedRowKeys,
      //     // onExpand: (expanded: boolean, record: DataType) => {
      //     //   setExpandedRowKeys((prev) => {
      //     //     return expanded ? [...prev, record.key] : prev.filter((p) => p !== record.key);
      //     //   });
      //     // },
      //     // defaultExpandAllRows: true,
      //     // expandedRowRender: (record: DataType) => <p style={{ margin: 0 }}>{record.description}</p>,
      //     // onExpand: (expanded: boolean, record: DataType) => {
      //     //   console.log(`expanded: ${expanded}`, 'record: ', record);
      //     // },
      //   }
      // }
    />
  );
};

export default App;
