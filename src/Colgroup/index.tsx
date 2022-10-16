import { ColumnsType } from '../interface';

interface ColgroupProps<T> {
  colWidths: number[];
  columns: ColumnsType<T>[];
}

function Colgroup<T>(props: ColgroupProps<T>) {}

export default Colgroup;
