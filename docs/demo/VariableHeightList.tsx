import React from 'react';
import type { ColumnsType } from 'react-data-table';
import { Table } from 'react-data-table';
import { faker } from '@faker-js/faker';

interface DataType {
  id: number;
  title: string;
  paragraphs: string;
  image: string;
}

const columns: ColumnsType<DataType>[] = [
  {
    title: 'Title',
    dataIndex: 'title',
    render: (text: any, record: DataType) => {
      return (
        <div>
          <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{`${record.title}_${record.id}`}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{record.paragraphs}</div>
          <div>
            <img src={record.image} alt="" />
          </div>
        </div>
      );
    },
  },
];

const data: DataType[] = [];

const imageUrls = [
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1678545091829-6b232518ef52?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDY5fDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679760452619-cf2dcb88b659?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDJ8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679775912570-202aa997b326?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDR8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679775912575-cfe09ff563b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDN8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679351004525-158b21e4efee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDF8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679542501404-5f994a2ecb4d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDd8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679772080462-ffe507c0a35e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDV8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679766826593-738e9b6338c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDZ8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679506391790-e76e47706bc2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDh8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679499067430-106da3ba663a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDl8NnNNVmpUTFNrZVF8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679351818954-3263ea6825de?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEzfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679428997403-c75e1c148b28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDExfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679063329944-7a0db4a253eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDE1fDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679352223240-79c807dc68af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEyfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679126540293-7b50d1cd72b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDE3fDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1679155506707-a072b305dd91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDIwfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1672161689485-56c2bee73f0d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI1fDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677528816821-2e373e2602cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDF8eGpQUjRobGtCR0F8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1661342576454-e53266e48a06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDV8eGpQUjRobGtCR0F8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1657934787560-cbecc866430a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDZ8eGpQUjRobGtCR0F8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1678408875048-10f4a9c67a5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDl8eGpQUjRobGtCR0F8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1678392690809-7ccd62950b12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEyfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1678297491694-7d9edd4557f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDE0fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1678225178163-1dcb7c0bae2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDE3fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1678297518189-4e947373331f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677665677780-b390a3854043?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDIxfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677950876655-964c27d4026a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDIzfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677265741635-0f6e1e74581e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI3fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677346803311-b4d68fa9a10f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI4fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677346803443-8eb60328cf71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDI5fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677346803457-d19c20b28744?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDMwfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677687695777-e9aea078ddea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1677682898503-ef62ef37d680?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDMyfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677624074617-1fb59d973155?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDM1fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677555024309-19edb4a1d40e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQwfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677523875173-e1f7f5138b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDM4fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677414519330-b95a8ee85c67?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQzfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677414283794-677bdf6dc6c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQ0fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677555024244-3995f3c748d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQxfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677173225981-4e060ad72dd1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQ3fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1604500693013-92b5a2b51799?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQ5fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1676648117781-e671a792226e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDUyfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1675790959822-b164bea916f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDU2fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1676810360780-e38eeac46c06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDYwfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1676642615413-e18b508a0ff3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDcxfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1676466902996-6ced9f6bf0f0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDc3fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1676466878843-76fa4d53d73b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDc2fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1676809108409-8f4f9d5bfdfc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDgyfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1676611437412-ad28dd2e41b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDgzfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1675914850327-87b816de133e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDkzfHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
];

const createData = (id: number) => {
  // const WIDTH = 640;
  // const HEIGHT = 480;
  return {
    id,
    title: faker.lorem.words(),
    paragraphs: faker.lorem.sentences(),
    image: imageUrls[id - 1],
    // image: faker.image.nature(WIDTH, Math.floor(Math.random() * id * HEIGHT), true)
  };
};

for (let i = 0; i < 50; i++) {
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
      showHeader={false}
    />
  );
};
export default App;
