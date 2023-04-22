import type { ColumnsType } from '@/interface';
import { faker } from '@faker-js/faker';
import moment from 'moment';
import React from 'react';
import Table from 'react-data-table';

interface DataType {
  id: React.Key;
  firstName: string;
  lastName: string;
  sex: 'male' | 'female';
  birthday: Date;
  email: string;
  country: string;
  cityName: string;
  address: string;
}

const style = {
  color: '#1890ff',
  textDecoration: 'none',
  cursor: 'pointer',
  outline: 'none',
};

const columns: ColumnsType<DataType> = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 70,
  },
  {
    title: 'FirstName',
    dataIndex: 'firstName',
    key: 'firstName',
    fixed: 'left',
    width: 100,
  },
  {
    title: 'LastName',
    dataIndex: 'lastName',
    key: 'lastName',
    fixed: 'left',
    width: 100,
  },
  {
    title: 'Sex',
    dataIndex: 'sex',
    key: 'sex',
    width: 80,
  },
  {
    title: 'Birthday',
    dataIndex: 'birthday',
    key: 'birthday',
    width: 110,
    render: (text: any) => {
      return moment(text).format('YYYY-MM-DD');
    },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 260,
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country',
    width: 160,
  },
  {
    title: 'City',
    dataIndex: 'cityName',
    key: 'cityName',
    width: 180,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width: 260,
  },
];

for (let i = 0; i < 50; i++) {
  columns.push({
    title: `Salary${i + 1}`,
    dataIndex: `salary${i}`,
    key: `salary${i}`,
    width: 120,
  });
}

columns.push({
  title: 'Action',
  dataIndex: 'operation',
  key: 'operation',
  width: 120,
  fixed: 'right',
  render: () => {
    return (
      <a style={style} onClick={() => console.log('编辑')}>
        edit
      </a>
    );
  },
});

const data: DataType[] = [];

const createData = (id: React.Key) => {
  const dataIns: DataType = {} as DataType;
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();

  columns.map((column) => {
    switch ('dataIndex' in column && column.dataIndex) {
      case 'id':
        return (dataIns.id = id);
      case 'sex':
        return (dataIns.sex = sex);
      case 'firstName':
        return (dataIns.firstName = firstName);
      case 'lastName':
        return (dataIns.lastName = lastName);
      case 'birthday':
        return (dataIns.birthday = faker.date.birthdate());
      case 'email':
        return (dataIns.email = faker.internet.email(firstName, lastName));
      case 'country':
        return (dataIns.country = faker.address.country());
      case 'cityName':
        return (dataIns.cityName = faker.address.cityName());
      case 'address':
        return (dataIns.address = faker.address.streetAddress());
      default:
        if ('dataIndex' in column && column.dataIndex) {
          return ((dataIns as any)[column.dataIndex] = faker.finance.amount());
        }
    }
  });
  return dataIns;
};

for (let i = 0; i < 10000; i++) {
  data.push(createData(i + 1));
}

const App = () => {
  return (
    <Table
      virtualized
      dataSource={data}
      columns={columns}
      bordered
      rowKey="id"
      height={500}
      width={7440}
      renderMaxRows={10}
    />
  );
};
export default App;
