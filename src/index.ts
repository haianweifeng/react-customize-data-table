// export { default as Foo } from './Foo';
//
// export { default as Table } from './Table';
//
// export { default as Checkbox } from './Checkbox';
// export { default as Radio } from './Radio';
//
// export { default as Pagination } from './Pagination';
//
// export type { PaginationProps } from './Pagination';
//
// export { default as Icon } from './Icon';
//
// export { default as Spin } from './Spin';
//
// export { default as Tooltip } from './Tooltip';
//
// export { default as LocalProvider } from './LocalProvider';
//
// export type { ColumnType, ColumnsType, FilterInfoType, FilterMenusType, SortInfoType } from './interface';

// export * from './index.less';

import Checkbox from './Checkbox';
import Icon from './Icon';
import Pagination from './Pagination';
import Radio from './Radio';
import Spin from './Spin';
import Table from './Table';
import Tooltip from './Tooltip';

export * from './index.less';
export type { ColumnsType, ColumnType, FilterMenus, SorterResult } from './interface';
export type { PaginationProps } from './Pagination';
export { Icon, Spin, Radio, Checkbox, Tooltip, Pagination };

export default Table;

// export * from './style/variables.less';
