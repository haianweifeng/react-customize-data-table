import type { ColumnsType } from '@/interface';
import React, { useRef, useState } from 'react';
import Table from 'react-data-table';

interface DataType {
  id: React.Key;
  name: string;
  age: number;
  address: string;
  position: string;
  office: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
  {
    title: 'Position',
    dataIndex: 'position',
  },
  {
    title: 'Office',
    dataIndex: 'office',
  },
];

const data: DataType[] = [
  {
    id: 1,
    name: 'John Brown',
    age: 18,
    address: 'New York No. 1 Lake Park',
    position: 'Marketing Designer',
    office: 'Miami',
  },
  {
    id: 2,
    name: 'Jim Green',
    age: 24,
    address: 'London No. 1 Lake Park',
    position: 'Financial Controller',
    office: 'San Paulo',
  },
  {
    id: 3,
    name: 'Joe Black',
    age: 30,
    address: 'Sydney No. 1 Lake Park',
    position: 'Development Lead',
    office: 'Delhi',
  },
  {
    id: 4,
    name: 'Jon Snow',
    age: 26,
    address: 'Ottawa No. 2 Lake Park',
    position: 'Developer',
    office: 'Boston',
  },
];

const App = () => {
  const dragging = useRef<boolean>(false);
  const startIndex = useRef<number>();
  const [list, setList] = useState<DataType[]>(data);

  const findNearestDOM = (el: any, tagName: string) => {
    let node = el;
    while (node.tagName !== tagName && node.tagName !== 'BODY') {
      node = node.parentNode;
    }
    return node;
  };

  const findIndex = (el: any) => {
    const tbody = findNearestDOM(el, 'TBODY');
    const nodes = Array.prototype.slice.call(tbody.children);
    return nodes.indexOf(el);
  };

  const handleDragStart = (e: DragEvent) => {
    if (dragging.current) return;
    dragging.current = true;
    startIndex.current = findIndex(e.target);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    dragging.current = false;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const tr = findNearestDOM(e.target, 'TR');
    const endIndex = findIndex(tr);
    if (startIndex.current || startIndex.current === 0) {
      if (startIndex.current === endIndex) return;
      const source = list[startIndex.current];
      const copyList = [...list];
      copyList.splice(startIndex.current, 1);
      copyList.splice(endIndex, 0, source);
      setList(copyList);
    }
  };

  return (
    <Table
      rowKey="id"
      dataSource={list}
      columns={columns}
      onRowEvents={() => {
        return {
          draggable: true,
          onDragStart: handleDragStart,
          onDragOver: handleDragOver,
          onDragEnd: handleDragEnd,
          onDrop: handleDrop,
        };
      }}
    />
  );
};
export default App;
