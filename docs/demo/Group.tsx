import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  street: string;
  building: string;
  number: number;
  companyAddress: string;
  companyName: string;
  gender: string;
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    fixed: 'left',
    resizable: true,
    filters: [
      {
        label: 'Joe',
        value: 'Joe',
      },
      {
        label: 'John',
        value: 'John',
      },
    ],
    filterMethod: (value: string, record: DataType) => record.name.indexOf(value) === 0,
  },
  {
    title: 'Other',
    // fixed: 'left',
    filters: [
      {
        label: 'A',
        value: 'A',
      },
      {
        label: 'B',
        value: 'B',
      },
      {
        label: 'C',
        value: 'C',
      },
      {
        label: 'D',
        value: 'D',
      },
    ],
    filterSearch: true,
    filterMethod: (value: string, record: DataType) => record.building.indexOf(value) === 0,
    sorter: (a: DataType, b: DataType) => a.age - b.age,
    children: [
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: 150,
        resizable: true,
        // fixed: 'left',
        // sorter: (a: DataType, b: DataType) => a.age - b.age,
      },
      {
        title: 'Address',
        // fixed: 'left',
        children: [
          {
            title: 'Street',
            dataIndex: 'street',
            key: 'street',
            width: 150,
            resizable: true,
          },
          {
            title: 'Block',
            // fixed: 'left',
            children: [
              {
                title: 'Building',
                // title: 'Building Door No.',
                dataIndex: 'building',
                key: 'building',
                width: 100,
                resizable: true,
                // fixed: 'left',
                // headerColSpan: 2,
              },
              {
                title: 'Door No.',
                dataIndex: 'number',
                key: 'number',
                width: 100,
                // fixed: 'left',
                resizable: true,
                // headerColSpan: 0,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Company',
    // fixed: 'right',
    children: [
      {
        title: 'Company Address',
        dataIndex: 'companyAddress',
        key: 'companyAddress',
        width: 200,
        resizable: true,
        // fixed: 'right',
      },
      {
        title: 'Company Name',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 200,
        resizable: true,
      },
    ],
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    key: 'gender',
    width: 80,
    fixed: 'right',
  },
];

const buildings = ['A', 'B', 'C', 'D'];

const data: DataType[] = [];
for (let i = 0; i < 30; i++) {
  data.push({
    key: i,
    name: 'John Brown',
    age: i,
    street: 'Lake Park',
    building: buildings[i % 4],
    number: 2035,
    companyAddress: 'Lake Street 42',
    companyName: 'SoftLake Co',
    gender: 'M',
    // expandContent: 'expand row content',
  });
}

const App = () => {
  const [list, setList] = useState(data);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([2, 28]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log('触发');
  //     const data: DataType[] = [];
  //     for (let i = 30; i < 100; i++) {
  //       data.push({
  //         key: i,
  //         name: 'John Brown',
  //         age: i + 1,
  //         street: 'Lake Park',
  //         building: buildings[i % 4],
  //         number: 2035,
  //         companyAddress: 'Lake Street 42',
  //         companyName: 'SoftLake Co',
  //         gender: 'M',
  //         // expandContent: 'expand row content',
  //       });
  //     }
  //     setList((prev) => {
  //       return [...prev, ...data];
  //     });
  //   }, 3000);
  // }, []);

  const handleColumnResize = (
    newWidth: number,
    oldWidth: number,
    column: ColumnsType<DataType>,
    event: Event,
  ) => {
    // console.log(`newWidth: ${newWidth}`);
    // console.log(`oldWidth: ${oldWidth}`);
    // console.log(column);
    // console.log(event);
  };

  const handleScroll = (scrollLeft: number, scrollTop: number) => {
    // console.log(`scrollLeft: ${scrollLeft}`);
    // console.log(`scrollTop: ${scrollTop}`);
  };

  return (
    <Table
      virtualized
      columns={columns}
      dataSource={list}
      bordered
      rowKey="key"
      height={400}
      // pagination={{
      //   defaultCurrent: 1,
      //   pageSize: 10,
      // }}
      onColumnResize={handleColumnResize}
      headerRowClassName={(rowIndex: number) => {
        if (rowIndex % 2 === 0) {
          return 'even-row';
        }
        return 'odd-row';
      }}
      headerRowStyle={(rowIndex: number) => {
        if (rowIndex % 2 === 0) {
          return { backgroundColor: 'red', color: 'red' };
        }
        return { backgroundColor: 'orange', color: 'orange' };
      }}
      onHeaderRowEvents={(rowIndex: number) => {
        return {
          onClick: () => {
            // console.log(`rowIndex: ${rowIndex}`);
            // console.log('header row click');
          },
          // onMouseEnter: () => {
          //   console.log('row mouse enter');
          // },
          // onMouseLeave: () => {
          //   console.log('row mouse leave');
          // }
          // onDoubleClick: () => {
          //   console.log('row double click')
          // }
        };
      }}
      onHeaderCellEvents={(column, rowIndex) => {
        return {
          onClick: () => {
            // console.log(column);
            // console.log(`rowIndex: ${rowIndex}`);
            // console.log('cell click');
          },
          // onMouseEnter: () => {
          //   console.log('cell mouse enter');
          // },
          // onMouseLeave: () => {
          //   console.log('cell mouse leave');
          // }
          // onDoubleClick: () => {
          //   console.log(' cell double click')
          // }
        };
      }}
      // rowSelection={{}}
      expandable={{
        // expandedRowKeys,
        // defaultExpandAllRows: true,
        expandedRowRender: (record: DataType) => {
          return 'expand content';
          // return record.expandContent;
        },
        rowExpandable: (record: DataType) => {
          return record.key % 2 === 0;
        },
        onExpand: (expanded: boolean, record: DataType) => {
          // console.log(`expanded: ${expanded}`, 'record: ', record);
          // setExpandedRowKeys((prev) => {
          //   return expanded ? [...prev, record.key] : prev.filter((p) => p !== record.key);
          // });
        },
      }}
      onScroll={handleScroll}
    />
  );
};
export default App;
