### Table

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| className | Custom class names for table | string | - |
| style | Custom style for table | React.CSSProperties | - |
| dataSource | Data record array to be displayed | object[] | - |
| columns | Columns of table | [`ColumnsType<T> `](#column) | - |
| rowKey | Row's unique key, the default value is key | string \| ((row: T) => string \| number) | `key` |
| striped | Show stripe or not. | boolean | false |
| bordered | Whether to show all table borders | boolean | false |
| loading | Loading status of table | `boolean` \| `React.ReactNode` | false |
| showHeader | Whether to show table header | boolean | true |
| size | Size of table | `default` \| `small` \| `large` | default |
| rowClassName | Row's className | (record: T, index: number) => string | - |
| rowStyle | Row's style | ((record: T, index: number) => React.CSSProperties) \| React.CSSProperties | - |
| cellClassName | custom class names for a cell | ((column: [`ColumnType<T>`](#column), rowIndex: number, colIndex: number) => string) \| string | - |
| cellStyle | custom style for a cell | ((column: [`ColumnType<T>`](#column), rowIndex: number, colIndex: number) => React.CSSProperties) \| React.CSSProperties | - |
| headerCellClassName | custom class names for a cell in table header | ((column: [`ColumnType<T>`](#column) \| [`ColumnGroupType<T>`](#columngroup), rowIndex: number, colIndex: number) => string) \| string | - |
| headerCellStyle | custom style for a cell in table header | ((column: [`ColumnType<T>`](#column) \| [`ColumnGroupType<T>`](#columngroup), rowIndex: number, colIndex: number) => React.CSSProperties) \| React.CSSProperties | - |
| headerRowClassName | custom class names for a row in table header | ((rowIndex: number) => string) \| string | - |
| headerRowStyle | custom style for a row in table header | ((rowIndex: number) => React.CSSProperties) \| React.CSSProperties | - |
| onHeaderRowEvents | Set events on per header row | (rowIndex: number) => object | - |
| onHeaderCellEvents | Set events on per header cell | (column: [`ColumnType<T>`](#column) \| [`ColumnGroupType<T>`](#columngroup), rowIndex: number) => object | - |
| onRowEvents | Set events on per row | (record: T, rowIndex: number) => object | - |
| onCellEvents | Set events on per cell | (record: T, rowIndex: number) => object | - |
| pagination | Config of pagination | [PaginationProps](/components/pagination#api) | - |
| empty | Displayed text when data is empty | string \| React.ReactNode | - |
| locale | The i18n text | [LocalType](#localtype) | - |
| rowHeight | The expected height of the table row | number | - |
| renderMaxRows | Maximum number of rows per render | number | - |
| width | The width of the table | number | - |
| height | The height of the table. Unit: px / When this prop is set, if the content height is larger then the set value, the header will be fixed at the top. | number | - |
| virtualized | Whether to enable the virtual list | boolean | - |
| onScroll | The callback function after scrolling. | (x: number, y: number) => void | - |
| onColumnResize | columns resize callback | (newWidth: number, oldWidth: number, column: [`ColumnType<T>`](#column), event: Event) => void | - |
| rowSelection | Row selection, [config](#rowselection) | object | - |
| onSort | Sort event | (sortResult: { column: [`ColumnType<T>`](#column), order: `asc` \| `desc` \| `null`, field: string \| undefined }) => void | - |
| onFilter | Filter event | (filterInfo: Record<React.Key, React.Key[]>) => void | - |
| expandable | Config expandable content, [config](#expandable) | object | - |
| treeProps | Configure tree data properties, [config](#treeexpandable) | object | - |
| summary | Render footer | { render: () => React.ReactNode; colSpan?: number; rowSpan?: number }[][] | - |

### Column

One of the Table columns prop for describing the table's columns, Column has the same API.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| type | Set column type | `expand` \| `checkbox` \| `radio` \| `default` | `default` |
| align | The specify which way that column is aligned | `left` \| `center` \| `right` | `left` |
| className | The className of this column | string | - |
| dataIndex | Display field of the data record | string | - |
| key | Unique key of this column, you can ignore this prop if you've set a unique `dataIndex` | string | - |
| fixed | Column fixed If multiple adjacent columns need to be locked, you only need to specify the outermost column, and it will take effect with horizontal scrolling | `left` \| `right` | - |
| render | Renderer of the table cell. The return value should be a ReactNode | (text: any, record: T, index: number) => React.ReactNode | - |
| title | Title of this column | React.ReactNode | - |
| width | Width of this column | number \| string | - |
| maxWidth | Maximum column width | number \| string | - |
| minWidth | Minimum column width | number \| string | - |
| ellipsis | The ellipsis cell content | boolean \| { tooltip: boolean; tooltipTheme?: `dark` \| `light`; renderTooltip?: (trigger: React.ReactNode, tip: React.ReactNode) => React.ReactNode;} | - |
| colSpan | The header columns are merged, when set to 0, no rendering | number | - |
| resizable | Whether to allow drag and drop to adjust the width The border attribute needs to be enabled, and for multi-level headers only supports drag and drop to adjust the width of the last level header | boolean | - |
| onCell | Set props on per cell | (record: T, rowIndex: number) => { colSpan?: number; rowSpan?: number } | - |
| defaultSortOrder | Default order of sorted values | `asc` \| `desc` | - |
| sortOrder | Order of sorted values | `asc` \| `desc` \| null | - |
| sorter | Sort function | ((rowA: T, rowB: T) => number) \| { compare: (rowA: T, rowB: T) => number; weight: number; } | - |
| renderSorter | Customize sort icons | (params: { activeAsc: boolean; activeDesc: boolean; triggerAsc: (event: React.MouseEvent) => void; triggerDesc: (event: React.MouseEvent) => void; }) => React.ReactNode | - |
| defaultFilteredValue | Default filtered values | React.Key[] | - |
| filteredValue | Controlled filtered value | React.Key[] | - |
| filterMultiple | Whether multiple filters can be selected | boolean | - |
| filterIcon | Customized filter icon | (filtered: boolean) => React.ReactNode | - |
| filterSearch | Whether to be searchable for filter menu | ((value: string, record: FilterMenus) => boolean) \| boolean | - |
| filters | Filter menu config | { label: string; value: string }[] | - |
| filterMethod | Function that determines if the row is displayed when filtered | (value: React.Key, record: T) => boolean | - |

### ColumnGroup

Refer to [config](#column) of column, but ignore `dataIndex` and `type attribute`, add `children` attribute, children is the collection of column configuration attributes.

### expandable

Properties for expandable.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| columnTitle | Set the title of the expand column | React.ReactNode | - |
| columnWidth | Set the width of the expand column | string \| number | - |
| expandedRowRender | Expanded container render for each row | (record: T, index: number, expanded: boolean) => React.ReactNode | - |
| expandedRowClassName | Expanded row's className | (record: T, index: number) => string | - |
| rowExpandable | Enable row can be expandable | (record: T) => boolean | - |
| defaultExpandAllRows | Expand all rows initially | boolean | false |
| defaultExpandedRowKeys | Initial expanded row keys | string[] \| number[] | - |
| expandedRowKeys | Current expanded row keys | string[] \| number[] | - |
| expandIcon | Customize row expand Icon | (record: T, expanded: boolean, onExpand?: (expanded: boolean, record: T) => void) => React.ReactNode | - |
| onExpand | Callback executed when the row expand icon is clicked | (expanded: boolean, record: T) => void | - |

### TreeExpandable

Configuration of tree functions.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| indentSize | indent of each level | number | 15 |
| treeColumnsName | The name of the column where the icon is expanded | string | - |
| defaultExpandAllRows | Expand all rows initially | boolean | false |
| defaultExpandedRowKeys | Initial expanded row keys | string[] \| number[] | - |
| expandedRowKeys | Current expanded row keys | string[] \| number[] | - |
| expandIcon | Customize row expand Icon | (record: T, expanded: boolean, onExpand?: (expanded: boolean, record: T) => void) => React.ReactNode | - |
| onExpand | Callback executed when the row expand icon is clicked | (expanded: boolean, record: T) => void | - |

### rowSelection

Properties for row selection.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| columnTitle | Set the title of the selection column | React.ReactNode | - |
| columnWidth | Set the width of the selection column | string \| number | `44px` |
| getCheckboxProps | Get Checkbox or Radio props | (record: T) => any | - |
| renderCell | Renderer of the table cell. Same as `render` in column | (checked: boolean, record: T, index: number, originNode: React.ReactNode) => React.ReactNode | - |
| selectedRowKeys | Controlled selected row keys | string[] \| number[] | - |
| defaultSelectedRowKeys | Initial selected row keys | string\[] \| number\[] | - |
| type | `checkbox` or `radio` | `checkbox` \| `radio` | `checkbox` |
| onChange | Callback executed when selected rows change | (selectedRowKeys: (string \| number)[], selectedRows: T[]) => void | - |
| onSelect | Callback executed when select/deselect one row | (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void | - |
| onSelectAll | Callback executed when select/deselect all rows | (selected: boolean, selectedRows: T[], changeRows: T[]) => void | - |

### LocalType

The i18n text for filter。

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| filterSearchPlaceholder | Filter Search Box Prompts | string | 'Search in filters' |
| filterEmptyText | Prompt copy when there is no filter menu | string | 'No filters' |
| filterResult | filter search results | string | 'Not Found' |
| filterConfirm | filter OK button | string | 'Filter' |
| filterReset | filter reset button | string | 'Reset' |
