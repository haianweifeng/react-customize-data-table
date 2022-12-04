import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table, Icon } from 'react-data-table';

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
    width: '30%',
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
  const UpArrow = () => (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em">
      <path
        d="M483.029333 286.165333l30.165334-30.208 415.957333 415.829334c16.426667 16.426667 16.64 43.648 0 60.288a42.538667 42.538667 0 0 1-60.330667 0.042666L513.28 376.746667l-355.242667 355.413333a42.496 42.496 0 0 1-60.288 0 42.837333 42.837333 0 0 1-0.085333-60.330667l383.701333-383.872 1.706667-1.749333z"
        fill="currentColor"
      />
    </svg>
  );

  const DownArrow = () => (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em">
      <path
        d="M483.072 714.496l30.165333 30.208 415.957334-415.829333a42.837333 42.837333 0 0 0 0-60.288 42.538667 42.538667 0 0 0-60.330667-0.042667l-355.541333 355.413333-355.242667-355.413333a42.496 42.496 0 0 0-60.288 0 42.837333 42.837333 0 0 0-0.085333 60.330667l383.701333 383.872 1.706667 1.749333z"
        fill="currentColor"
      />
    </svg>
  );

  const handleRenderSorter = ({
    activeAsc,
    activeDesc,
    triggerAsc,
    triggerDesc,
  }: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => {
    return (
      <>
        <Icon
          component={UpArrow}
          onClick={triggerAsc}
          style={{ color: activeAsc ? '#197afa' : '#dbdbdb', fontSize: '12px', cursor: 'pointer' }}
        />
        <Icon
          component={DownArrow}
          onClick={triggerDesc}
          style={{ color: activeDesc ? '#197afa' : '#dbdbdb', fontSize: '12px', cursor: 'pointer' }}
        />
      </>
    );
  };

  return <Table columns={columns} dataSource={data} bordered renderSorter={handleRenderSorter} />;
};
export default App;
