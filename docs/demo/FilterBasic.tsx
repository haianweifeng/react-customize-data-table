import React, { useState } from 'react';
import type { ColumnsType, FilterMenusType } from 'react-data-table';
import { Table, LocalProvider } from 'react-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      {
        label: 'Joe',
        value: 'Joe',
      },
      {
        label: 'Category 1',
        value: 'Category 1',
      },
      {
        label: 'Category 2',
        value: 'Category 2',
      },
    ],
    filterSearch: true,
    filterMethod: (value: string, record: DataType) => record.name.includes(value),
    // defaultFilteredValue: ['Joe'],
    // filterIcon: (filtered) => <span style={{ color: filtered ? '#1890ff' : '' }}>^</span>,
    width: '30%',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    // filterMultiple: false,
    // defaultFilteredValue: ['London'],
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
    // filterSearch: true,
    filterSearch: (value: string, record: FilterMenusType) => {
      return record.label.toString().toLowerCase().includes(value.trim().toLowerCase());
    },
    width: '40%',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
  },
];

const App = () => {
  const [language, setLanguage] = useState('en-US');
  const locale =
    language === 'en-US'
      ? {
          table: {
            filterSearchPlaceholder: 'Search in filter',
            filterEmptyText: 'No filters',
            filterResult: 'Not Found',
            filterConfirm: 'filter',
            filterReset: 'reset',
          },
        }
      : {
          table: {
            filterSearchPlaceholder: '在筛选项中搜索1',
            filterEmptyText: '无筛选项1',
            filterResult: '未发现1',
            filterConfirm: '筛选1',
            filterReset: '重置1',
          },
        };
  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ width: '80px', cursor: 'pointer' }} onClick={() => setLanguage('en-US')}>
          English
        </div>
        <div style={{ width: '80px', cursor: 'pointer' }} onClick={() => setLanguage('zh-CN')}>
          Chinese
        </div>
      </div>
      {/*<LocalProvider locale={locale}>*/}
      {/*  <Table*/}
      {/*    language={language}*/}
      {/*    columns={columns}*/}
      {/*    dataSource={data}*/}
      {/*    bordered*/}
      {/*    // locale={{*/}
      {/*    //   filterSearchPlaceholder: 'Search in filter',*/}
      {/*    //   filterEmptyText: 'No filters',*/}
      {/*    //   filterResult: 'Not Found',*/}
      {/*    //   filterConfirm: 'filter',*/}
      {/*    //   filterReset: 'reset',*/}
      {/*    // }}*/}
      {/*  />*/}
      {/*</LocalProvider>*/}
      <Table
        language={language}
        columns={columns}
        dataSource={data}
        bordered
        // locale={{
        //   filterSearchPlaceholder: 'Search in filter',
        //   filterEmptyText: 'No filters',
        //   filterResult: 'Not Found',
        //   filterConfirm: 'filter',
        //   filterReset: 'reset',
        // }}
      />
    </div>
  );
};
export default App;
