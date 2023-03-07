import React from 'react';
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
    filterMethod: (value: string, record: DataType) => record.building.indexOf(value) === 0,
    sorter: (a: DataType, b: DataType) => a.age - b.age,
    children: [
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: 150,
        resizable: true,
        // sorter: (a: DataType, b: DataType) => a.age - b.age,
      },
      {
        title: 'Address',
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
            children: [
              {
                title: 'Building',
                // title: 'Building Door No.',
                dataIndex: 'building',
                key: 'building',
                width: 100,
                resizable: true,
                // headerColSpan: 2,
              },
              {
                title: 'Door No.',
                dataIndex: 'number',
                key: 'number',
                width: 100,
                fixed: 'left',
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
    children: [
      {
        title: 'Company Address',
        dataIndex: 'companyAddress',
        key: 'companyAddress',
        width: 200,
        resizable: true,
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
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: 'John Brown',
    age: i + 1,
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
  const handleColumnResize = (
    newWidth: number,
    oldWidth: number,
    column: ColumnsType<DataType>,
    event: Event,
  ) => {
    console.log(`newWidth: ${newWidth}`);
    console.log(`oldWidth: ${oldWidth}`);
    console.log(column);
    console.log(event);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      bordered
      rowKey="key"
      pagination={{
        defaultCurrent: 1,
        pageSize: 10,
      }}
      onColumnResize={handleColumnResize}
      // rowSelection={{}}
      // expandable={{
      // insertBeforeColumnName: 'Gender',
      // expandedRowRender: (record) => {
      // return record.expandContent;
      // },
      // }}
    />
  );
};
export default App;
