import React, { useState, useEffect } from 'react';
import type { ColumnsType, FilterInfoType, SortInfoType } from 'react-data-table';
import { Table } from 'react-data-table';

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

const App = () => {
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [list, setList] = useState<DataType[]>([]);
  const [sorts, setSorts] = useState<SortInfoType[]>([]);
  const [filters, setFilters] = useState<FilterInfoType>({});

  useEffect(() => {
    let data: DataType[] = [];
    for (let i = 0; i < 46; i++) {
      data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32 + i,
        address: `London, Park Lane no. ${i}`,
      });
    }
    data.push({
      key: 46,
      name: `Jim`,
      age: 78,
      address: `London, Park Lane no. ${78}`,
    });

    Object.keys(filters).forEach((key: string) => {
      const value: string[] = filters[key];
      data = data.filter((d) => {
        if (value && value.length) {
          const res = value.some((v) => {
            return (d as any)[key].includes(v);
          });
          return res;
        }
        return true;
      });
    });

    sorts.forEach((s) => {
      const sortFn = (a: DataType, b: DataType) => {
        const a1 = (a as any)[s.field].toString();
        const b1 = (b as any)[s.field].toString();
        return a1.localeCompare(b1);
      };
      data.sort((a, b) => {
        const compareResult = sortFn(a, b);
        if (compareResult !== 0) {
          return s.order === 'asc' ? compareResult : -compareResult;
        }
        return compareResult;
      });
    });

    const start = (current - 1) * pageSize;
    data.slice(start, start + pageSize);
    setList(data);
  }, [current, pageSize, sorts, filters]);

  const handleChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  };

  const handleSort = (sortInfo: SortInfoType) => {
    setSorts(sortInfo);
  };

  const handleFilter = (info: FilterInfoType) => {
    setFilters(info);
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
      dataSource={list}
      rowSelection={rowSelection}
      pagination={{
        align: 'right',
        total: list.length,
        current,
        pageSize,
        layout: ['prev', 'pager', 'next', 'sizes', 'jumper', renderInfo],
        onChange: handleChange,
      }}
      onSort={handleSort}
      onFilter={handleFilter}
    />
  );
};

export default App;
