---
title: 样式 & 事件
order: 22
toc: content
---

<code src="../examples/RowStyle.tsx">自定义行样式</code>

```css
.rv-table-container .demo-table-info-row td,
.rv-table-container .demo-table-info-row:hover td {
  color: #fff;
  background-color: #2db7f5;
}

.rv-table-container .demo-table-error-row td,
.rv-table-container .demo-table-error-row:hover td {
  color: #fff;
  background-color: #ff6600;
}
```

<code src="../examples/ColumnStyle.tsx">自定义列样式</code>

```css
.rv-table-container td.demo-table-info-column,
.rv-table-container tr:hover td.demo-table-info-column {
  color: #fff;
  background-color: #2db7f5;
}
```

<code src="../examples/CellStyle.tsx">自定义单元格样式</code>

```css
.rv-table-container tr td.demo-table-info-cell-name,
.rv-table-container tr:hover td.demo-table-info-cell-name {
  color: #fff;
  background-color: #2db7f5;
}
.rv-table-container tr td.demo-table-info-cell-age,
.rv-table-container tr:hover td.demo-table-info-cell-age {
  color: #fff;
  background-color: #ff6600;
}
.rv-table-container tr td.demo-table-info-cell-address,
.rv-table-container tr:hover td.demo-table-info-cell-address {
  color: #fff;
  background-color: #187;
}
```

<style>
.rv-table-container .demo-table-info-row td,
.rv-table-container .demo-table-info-row:hover td {
   background-color: #2db7f5;
   color: #fff;
}

.rv-table-container .demo-table-error-row td,
.rv-table-container .demo-table-error-row:hover td {
    background-color: #ff6600;
    color: #fff;
}

.rv-table-container td.demo-table-info-column,
.rv-table-container tr:hover td.demo-table-info-column {
    background-color: #2db7f5;
    color: #fff;
}

.rv-table-container tr td.demo-table-info-cell-name,
.rv-table-container tr:hover td.demo-table-info-cell-name {
    background-color: #2db7f5;
    color: #fff;
}
.rv-table-container tr td.demo-table-info-cell-age,
.rv-table-container tr:hover td.demo-table-info-cell-age {
    background-color: #ff6600;
    color: #fff;
}
.rv-table-container tr td.demo-table-info-cell-address,
.rv-table-container tr:hover td.demo-table-info-cell-address {
    background-color: #187;
    color: #fff;
}
</style>

<code src="../examples/Events.tsx">事件</code>
