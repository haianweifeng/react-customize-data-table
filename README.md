# react-customize-data-table

A React table component designed to display large data with high performance.

## Features

- 🚀 高性能: 数据量较大时可以开启虚拟滚动
- 🎨 定制: 简单灵活的 API，丰富的定制能力
- 💎 实用表格特性: 支持排序、搜索、分页、固定表头、左侧/右侧锁列、自定义操作等复杂功能

## Example

http://localhost:8000

online example: https://haianweifeng.github.io/react-customize-data-table

## Install

`npm i react-customize-data-table`

## Development

Install dependencies,

```bash
$ npm i
```

Start the dev server,

```bash
$ npm start
```

Build documentation,

```bash
$ npm run docs:build
```

Run test,

```bash
$ npm test
```

Build library via `father`,

```bash
$ npm run compile
```

## Usage

```js
import Table from 'react-customize-data-table';

ReactDOM.render(<Table />, container);
```

## API

### Table

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 表格的样式类名 | string | - |
| style | 表格的行内样式 | React.CSSProperties | - |
| dataSource | 表格展示的数据源 | object[] | - |
| columns | 表格列的配置 | [`ColumnsType<T> `](#column) | - |
| rowKey | 表格行 key 默认取值 key | string \| ((row: T) => string \| number) | `key` |
| striped | 是否显示交错斑马底纹 | boolean | false |
| bordered | 是否展示外边框和列边框 | boolean | false |
| loading | 页面是否加载中 | `boolean` \| `React.ReactNode` | false |
| showHeader | 是否显示表头 | boolean | true |
| size | 表格大小 | `default` \| `small` \| `large` | default |
| rowClassName | 表格行的类名 | (record: T, index: number) => string | - |
| rowStyle | 表格行的 style | ((record: T, index: number) => React.CSSProperties) \| React.CSSProperties | - |
| cellClassName | 表体单元格的类名 | ((column: [`ColumnType<T>`](#column), rowIndex: number, colIndex: number) => string) \| string | - |
| cellStyle | 表体单元格的 style | ((column: [`ColumnType<T>`](#column), rowIndex: number, colIndex: number) => React.CSSProperties) \| React.CSSProperties | - |
| headerCellClassName | 表头单元格的类名 | ((column: [`ColumnType<T>`](#column) \| [`ColumnGroupType<T>`](#columngroup), rowIndex: number, colIndex: number) => string) \| string | - |
| headerCellStyle | 表头单元格的 style | ((column: [`ColumnType<T>`](#column) \| [`ColumnGroupType<T>`](#columngroup), rowIndex: number, colIndex: number) => React.CSSProperties) \| React.CSSProperties | - |
| headerRowClassName | 表头行的类名 | ((rowIndex: number) => string) \| string | - |
| headerRowStyle | 表头行的 style | ((rowIndex: number) => React.CSSProperties) \| React.CSSProperties | - |
| onHeaderRowEvents | 设置表头行事件 | (rowIndex: number) => object | - |
| onHeaderCellEvents | 设置表头行单元格事件 | (column: [`ColumnType<T>`](#column) \| [`ColumnGroupType<T>`](#columngroup), rowIndex: number) => object | - |
| onRowEvents | 设置表体行事件 | (record: T, rowIndex: number) => object | - |
| onCellEvents | 设置表体单元格事件 | (record: T, rowIndex: number) => object | - |
| pagination | 分页 | [PaginationProps](/components/pagination#api) | - |
| empty | 空数据文案 | string \| React.ReactNode | - |
| locale | 默认文案设置 | [LocalType](#localtype) | - |
| rowHeight | 单行表格的预期高度 | number | - |
| renderMaxRows | 单次 render 的最大行数 | number | - |
| width | 表格宽度 | number | - |
| height | 表格高度，默认为自动高度，如果表格内容大于此值，会固定表头 | number | - |
| virtualized | 是否开启虚拟列表 | boolean | - |
| onScroll | 监听滚动回调函数 | (x: number, y: number) => void | - |
| onColumnResize | 列宽伸缩后的回调 | (newWidth: number, oldWidth: number, column: [`ColumnType<T>`](#column), event: Event) => void | - |
| rowSelection | 表格行是否可选择, [配置项](#rowselection) | object | - |
| onSort | 排序事件 | (sortResult: { column: [`ColumnType<T>`](#column), order: `asc` \| `desc` \| `null`, field: string \| undefined }) => void | - |
| onFilter | 筛选事件 | (filterInfo: Record<React.Key, React.Key[]>) => void | - |
| expandable | 配置展开属性, [配置项](#expandable) | object | - |
| treeProps | 配置树形数据属性, [配置项](#treeexpandable) | object | - |
| summary | 渲染底部信息 | { render: () => React.ReactNode; colSpan?: number; rowSpan?: number }[][] | - |

### Column

列描述数据对象，是 columns 中的一项，Column 使用相同的 API。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 设置列的类型 | `expand` \| `checkbox` \| `radio` \| `default` | `default` |
| align | 设置列的对齐方式 | `left` \| `center` \| `right` | `left` |
| className | 列样式类名 | string | - |
| dataIndex | 列对应字段名 | string | - |
| key | React 需要的 key，如果已经设置了唯一的 dataIndex，可以忽略这个属性 | string | - |
| fixed | 列固定 如果相邻的多列需要锁定，只需指定最外侧的 column 即可，需要配合横向滚动才生效 | `left` \| `right` | - |
| render | 生成复杂数据的渲染函数 | (text: any, record: T, index: number) => React.ReactNode | - |
| title | 列头显示文字 | React.ReactNode | - |
| width | 列宽度 | number \| string | - |
| maxWidth | 最大列宽 | number \| string | - |
| minWidth | 最小列宽 | number \| string | - |
| ellipsis | 超过宽度将自动省略 | boolean \| { tooltip: boolean; tooltipTheme?: `dark` \| `light`; renderTooltip?: (trigger: React.ReactNode, tip: React.ReactNode) => React.ReactNode;} | - |
| colSpan | 表头列合并, 设置为 0 时，不渲染 | number | - |
| resizable | 是否允许拖拽调整宽度 需开启 border 属性，对于多级表头只支持最后一级表头拖拽调整宽度 | boolean | - |
| onCell | 设置单元格属性 | (record: T, rowIndex: number) => { colSpan?: number; rowSpan?: number } | - |
| defaultSortOrder | 默认排序 | `asc` \| `desc` | - |
| sortOrder | 排序的受控属性,外界可用此控制列的排序 | `asc` \| `desc` \| null | - |
| sorter | 排序函数 | ((rowA: T, rowB: T) => number) \| { compare: (rowA: T, rowB: T) => number; weight: number; } | - |
| renderSorter | 自定义排序图标 | (params: { activeAsc: boolean; activeDesc: boolean; triggerAsc: (event: React.MouseEvent) => void; triggerDesc: (event: React.MouseEvent) => void; }) => React.ReactNode | - |
| defaultFilteredValue | 默认筛选值 | React.Key[] | - |
| filteredValue | 筛选的受控属性 | React.Key[] | - |
| filterMultiple | 筛选是否多选 | boolean | - |
| filterIcon | 自定义 filter 图标 | (filtered: boolean) => React.ReactNode | - |
| filterSearch | 筛选菜单项是否可搜索 | ((value: string, record: FilterMenus) => boolean) \| boolean | - |
| filters | 表头的筛选菜单项 | { label: string; value: string }[] | - |
| filterMethod | 筛选函数 | (value: React.Key, record: T) => boolean | - |

### ColumnGroup

参照列的[配置](#column)，但是忽略`dataIndex`和`type 属性`，增加`children`属性, children 就是列配置属性的集合。

### expandable

展开功能的配置。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columnTitle | 自定义展开列表头 | React.ReactNode | - |
| columnWidth | 自定义展开列宽度 | string \| number | - |
| expandedRowRender | 渲染展开行的内容 | (record: T, index: number, expanded: boolean) => React.ReactNode | - |
| expandedRowClassName | 展开行的 className | (record: T, index: number) => string | - |
| rowExpandable | 设置是否允许行展开 | (record: T) => boolean | - |
| defaultExpandAllRows | 初始时，是否展开所有行 | boolean | false |
| defaultExpandedRowKeys | 默认展开的行 | string[] \| number[] | - |
| expandedRowKeys | 展开的行，控制属性 | string[] \| number[] | - |
| expandIcon | 自定义展开图标 | (record: T, expanded: boolean, onExpand?: (expanded: boolean, record: T) => void) => React.ReactNode | - |
| onExpand | 点击展开图标时触发 | (expanded: boolean, record: T) => void | - |

### TreeExpandable

树形功能的配置。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| indentSize | 树形数据每层的缩进 | number | 15 |
| treeColumnsName | 展开图标所在列名 | string | - |
| defaultExpandAllRows | 初始时，是否展开所有行 | boolean | false |
| defaultExpandedRowKeys | 默认展开的行 | string[] \| number[] | - |
| expandedRowKeys | 展开的行，控制属性 | string[] \| number[] | - |
| expandIcon | 自定义展开图标 | (record: T, expanded: boolean, onExpand?: (expanded: boolean, record: T) => void) => React.ReactNode | - |
| onExpand | 点击展开图标时触发 | (expanded: boolean, record: T) => void | - |

### rowSelection

选择功能的配置。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columnTitle | 自定义列表选择框标题 | React.ReactNode | - |
| columnWidth | 自定义列表选择框宽度 | string \| number | `44px` |
| getCheckboxProps | 选择框的默认属性配置 | (record: T) => any | - |
| renderCell | 渲染表体的勾选框 | (checked: boolean, record: T, index: number, originNode: React.ReactNode) => React.ReactNode | - |
| selectedRowKeys | 指定选中项的 key 数组，需要和 onChange 进行配合 | string[] \| number[] | - |
| defaultSelectedRowKeys | 默认选中项的 key 数组 | string\[] \| number\[] | - |
| type | 多选/单选 | `checkbox` \| `radio` | `checkbox` |
| onChange | 选中项发生变化时的回调 | (selectedRowKeys: (string \| number)[], selectedRows: T[]) => void | - |
| onSelect | 用户手动选择/取消选择某行的回调 | (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void | - |
| onSelectAll | 用户手动选择/取消选择所有行的回调 | (selected: boolean, selectedRows: T[], changeRows: T[]) => void | - |

### LocalType

文案设置。

| 参数                    | 说明                 | 类型   | 默认值           |
| ----------------------- | -------------------- | ------ | ---------------- |
| filterSearchPlaceholder | 筛选搜索框提示语     | string | '在筛选项中搜索' |
| filterEmptyText         | 无筛选菜单时提示文案 | string | '无筛选项'       |
| filterResult            | 过滤搜索结果         | string | '未发现'         |
| filterConfirm           | 过滤确定按钮         | string | '筛选'           |
| filterReset             | 过滤重置按钮         | string | '重置'           |
