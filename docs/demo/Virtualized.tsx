import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';
import { faker } from '@faker-js/faker';
import moment from 'moment';

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

const columns: ColumnsType<DataType>[] = [
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
    render: (text: any, record: DataType) => {
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

const data: DataType[] = [];

const createData = (id: React.Key) => {
  const dataIns: DataType = {} as DataType;
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();

  columns.map((column) => {
    switch (column.dataIndex) {
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
        return ((dataIns as any)[column.dataIndex] = faker.finance.amount());
    }
  });
  return dataIns;
  // return {
  //   id,
  //   sex,
  //   firstName,
  //   lastName,
  //   birthday: faker.date.birthdate(),
  //   email: faker.internet.email(firstName, lastName),
  //   country: faker.address.country(),
  //   cityName: faker.address.cityName(),
  //   address: faker.address.streetAddress(),
  // };
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
      renderMaxRows={10}
    />
  );
};
export default App;
