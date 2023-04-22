import type { ColumnsType } from '@/interface';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  key: number;
  name: string;
  age: number;
  street: string;
  building: string;
  number: number;
  companyAddress: string;
  companyName: string;
  gender: string;
}

const columns: ColumnsType<DataType> = [
  // {
  //   type: 'expand',
  // },
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
    filterMethod: (value: React.Key, record: DataType) =>
      record.name.indexOf(value as string) === 0,
  },
  {
    title: 'Other',
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
    filterMethod: (value: React.Key, record: DataType) =>
      record.building.indexOf(value as string) === 0,
    children: [
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: 150,
        resizable: true,
        sorter: (a: DataType, b: DataType) => a.age - b.age,
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
                dataIndex: 'building',
                key: 'building',
                width: 100,
                resizable: true,
              },
              {
                title: 'Door No.',
                dataIndex: 'number',
                key: 'number',
                width: 100,
                resizable: true,
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
  });
}

const App = () => {
  // const [list, setList] = useState(data);
  // const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([2, 28]);

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
  //       });
  //     }
  //     setList((prev) => {
  //       return [...prev, ...data];
  //     });
  //   }, 3000);
  // }, []);

  const renderInfo = ({ total }: { current: number; total: number; pageSize: number }) => {
    return `Total ${total} items`;
  };

  return (
    <Table
      // virtualized
      columns={columns}
      dataSource={data}
      bordered
      height={400}
      // renderMaxRows={10}
      pagination={{
        size: 'small',
        align: 'right',
        layout: ['sizes', 'prev', 'pager', 'next', 'jumper', renderInfo],
      }}
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
      onHeaderRowEvents={() => {
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
      onHeaderCellEvents={() => {
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
      // expandable={{
      //   // expandedRowKeys,
      //   defaultExpandAllRows: true,
      //   expandedRowRender: (record: DataType) => {
      //     return 'expand content';
      //   },
      //   rowExpandable: (record: DataType) => {
      //     return record.key % 2 === 0;
      //   },
      //   onExpand: (expanded: boolean, record: DataType) => {
      //     console.log(`expanded: ${expanded}`, 'record: ', record);
      //     setExpandedRowKeys((prev) => {
      //       return expanded ? [...prev, record.key] : prev.filter((p) => p !== record.key);
      //     });
      //   },
      // }}
    />
  );
};
export default App;
