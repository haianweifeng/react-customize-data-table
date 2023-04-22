import type { ColumnsType } from '@/interface';
import React, { useState } from 'react';
import Table from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
  description: string;
}

const style = {
  color: '#1890ff',
  textDecoration: 'none',
  cursor: 'pointer',
  outline: 'none',
};

const columns: ColumnsType<DataType> = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 100 },
  { title: 'Address', dataIndex: 'address', key: 'address' },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    render: () => <a style={style}>Delete</a>,
  },
];

const data: DataType[] = [
  {
    key: 1,
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
  },
  {
    key: 2,
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    description: 'My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.',
  },
  {
    key: 3,
    name: 'Not Expandable',
    age: 29,
    address: 'Jiangsu No. 1 Lake Park',
    description: 'This not expandable',
  },
  {
    key: 4,
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.',
  },
];

const App = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
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
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      // cellClassName="custom-cell-class"
      // cellClassName={(column, rowIndex: number, colIndex: number) => {
      //   return 'custom-cell-func';
      // }}
      // rowClassName={(record: DataType) => {
      //   if (record.name === 'John Brown') {
      //     return 'custom-row';
      //   }
      // }}
      // cellStyle={(column, rowIndex: number, colIndex: number) => {
      //   return { backgroundColor: 'pink', color: 'blue' };
      // }}
      // cellStyle={{ color: 'red', backgroundColor: 'orange' }}
      // rowStyle={() => {
      //   return { backgroundColor: 'purple' };
      // }}
      expandable={{
        expandedRowKeys,
        // expandedRowKeys: undefined,
        // defaultExpandedRowKeys: expandedRowKeys,
        // defaultExpandAllRows: true,
        expandedRowRender: (record: DataType) => <p style={{ margin: 0 }}>{record.description}</p>,
        // 如果是自定义expandIcon 要配合expandedRowKeys，onExpand 使用，在onExpand 中控制expandedRowKeys
        // expandIcon: (
        //   record: DataType,
        //   expanded: boolean,
        //   onExpand: (expanded: boolean, record: DataType) => void,
        // ) => {
        //   return (
        //     <span
        //       onClick={() => {
        //         onExpand(!expanded, record);
        //       }}
        //       style={{ cursor: 'pointer' }}
        //     >
        //       {expanded ? 'v' : '>'}
        //     </span>
        //   );
        // },
        onExpand: (expanded: boolean, record: DataType) => {
          console.log(`expanded: ${expanded}`, 'record: ', record);
          setExpandedRowKeys((prev) => {
            return expanded ? [...prev, record.key] : prev.filter((p) => p !== record.key);
          });
        },
      }}
      // onRowEvents={(record: DataType, rowIndex: number) => {
      //   return {
      //     onClick: () => {
      //       console.log('click row');
      //       // console.log(record);
      //       // console.log(`rowIndex: ${rowIndex}`);
      //     },
      //     // onDoubleClick: () => {
      //     //   console.log('double click');
      //     // },
      //     // onMouseEnter: () => {
      //     //   console.log('mouse enter');
      //     // },
      //     // onMouseLeave: () => {
      //     //   console.log('mouse leave');
      //     // }
      //   };
      // }}
      // onCellEvents={(record: DataType, rowIndex: number) => {
      //   return {
      //     onClick: () => {
      //       console.log('cell click');
      //     },
      //     onDoubleClick: () => {
      //       console.log('double click');
      //     },
      //   };
      // }}
    />
  );
};

export default App;
