import React, { useState, useEffect } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table, Checkbox } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
  description: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    fixed: 'left',
    // render: (_, record) => {
    //   return <span>{record.name}</span>
    // }
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    fixed: 'left',
  },
  {
    title: 'Column 1',
    key: 'address1',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 2',
    key: 'address2',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 3',
    key: 'address3',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 4',
    key: 'address4',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 5',
    key: 'address5',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 6',
    key: 'address6',
    dataIndex: 'address',
    width: 180,
  },
  {
    title: 'Column 7',
    key: 'address7',
    dataIndex: 'address',
    width: 180,
    // fixed: 'right',
    // render: (_, record) => {
    //   return record.address
    // }
  },
  { title: 'Column 8', key: 'address8', dataIndex: 'address' },
  {
    title: 'Action',
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
    // render: (_, record) => {
    //   // return <span>{`${record.address.slice(0, 3)}-hh`}</span>
    //   // return 'hhaahh';
    // }
    // render: () => {
    //   return <a onClick={() => {
    //     console.log('hhaahah-00')
    //   }
    //   }>action</a>
    // },
    render: () => {
      return <a onClick={() => {}}>Action</a>;
    },
  },
];
// todo 需要加个key 如果data.dataIndex 不存在的话可能会返回空
const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
    description: 'test description',
  });
}

const App = () => {
  // const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [list, setList] = useState(data);
  // useEffect(() => {
  //   const arr: any = [];
  //   for (let i = 30; i < 100; i++) {
  //     arr.push({
  //       key: i,
  //       name: `Edrward ${i}`,
  //       age: 32,
  //       address: `London Park no. ${i}`,
  //       description: 'test description',
  //     });
  //   }
  //   setTimeout(() => {
  //     setList((prev) => {
  //       return [...prev, ...arr];
  //     });
  //   }, 6000);
  // }, []);
  return (
    <Table
      // virtualized
      columns={columns}
      dataSource={list}
      // width={1500}
      width={1740}
      // height='30%'
      // style={{ height: 400 }}
      // height={300}
      height={400}
      bordered
      // rowSelection={{
      //   // selectedRowKeys,
      //   renderCell: (checked: boolean, rowData: DataType, rowIndex: number, defaultContent: any) => {
      //     return (
      //       <Checkbox
      //         checked={checked}
      //         // onChange={(selected: boolean, event: Event) => {
      //         //   setSelectedRowKeys((prev) => {
      //         //     return selected ? [...prev, rowData.key] : prev.filter((p) => p !== rowData.key)
      //         //   });
      //         //   // handleSelect(isRadio, checked == true, rowData, rowIndex, selected, event);
      //         // }}
      //       />
      //     )
      //   }
      // }}
      // expandable={{
      //   // expandedRowKeys,
      //   insertBeforeColumnName: 'Name',
      //   expandIcon: (rowData: DataType, expanded: boolean, onExpand?: (expanded: boolean, record: DataType) => void) => {
      //     // return <span onClick={() => {
      //     //   setExpandedRowKeys((prev) => {
      //     //     if (expanded) {
      //     //       return prev.filter((p) => p !== rowData.key);
      //     //     } else {
      //     //       return [...prev, rowData.key];
      //     //     }
      //     //   });
      //     //   onExpand && onExpand(expanded, rowData);
      //     // }}>**</span>
      //     // return '**';
      //     return <span>**</span>
      //   },
      //   expandedRowRender: (record: DataType) => <p style={{ margin: 0 }}>{record.description}</p>,
      //   onExpand: (expanded: boolean, record: DataType) => {
      //     console.log(`expanded: ${expanded}`, 'record: ', record);
      //   },
      // }}
    />
  );
};
export default App;
