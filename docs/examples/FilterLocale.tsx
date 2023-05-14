import type { ColumnsType, SorterResult } from '@/interface';
import { useLocale } from 'dumi';
import React from 'react';
import Table from 'react-customize-data-table';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      {
        label: 'Joe',
        value: 'Joe',
      },
      {
        label: 'Jim',
        value: 'Jim',
      },
      {
        label: 'Category 1',
        value: 'Category 1',
      },
    ],
    filterSearch: true,
    filterMethod: (value: React.Key, record: DataType) => record.name.includes(value as string),
    sorter: (a: DataType, b: DataType) => a.name.length - b.name.length,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    defaultSortOrder: 'desc',
    sorter: (a: DataType, b: DataType) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
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
    filterMethod: (value: React.Key, record: DataType) =>
      record.address.startsWith(value as string),
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
  const currLocale = useLocale();

  const locale =
    currLocale.id === 'en-US'
      ? {
          filterSearchPlaceholder: 'Search in filter',
          filterEmptyText: 'No filters',
          filterResult: 'Not Found',
          filterConfirm: 'filter',
          filterReset: 'reset',
        }
      : {
          filterSearchPlaceholder: '在筛选项中搜索',
          filterEmptyText: '无筛选项',
          filterResult: '未发现',
          filterConfirm: '筛选',
          filterReset: '重置',
        };

  const handleSort = ({ column, order, field }: SorterResult<DataType>) => {
    console.log('sort', column, order, field);
  };

  const handleFilter = (filterInfo: Record<React.Key, React.Key[]>) => {
    console.log('filter', filterInfo);
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        onSort={handleSort}
        onFilter={handleFilter}
        locale={locale}
      />
    </div>
  );
};
export default App;
