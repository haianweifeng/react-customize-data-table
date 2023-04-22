---
toc: content
title: Pagination
group:
  path: /pagination
---

# Pagination 分页

<font size='5'>示例</font>

### 基本用法

<code src="./demo/Basic.tsx"></code>

### 大小

<code src="./demo/Size.tsx" desc="内置了 2 种大小供选择，'small' | 'default', 默认为 'default'"></code>

### 对齐

<code src="./demo/Align.tsx" desc="设置 align 属性控制对齐, 'left' | 'center' | 'right' , 默认值为'left'"></code>

### 布局

<code src="./demo/Layout.tsx" desc="设置 layout 属性显示需要的内容, 默认值为['prev', 'pager', 'next']"></code>

### 禁用

<code src="./demo/Disabled.tsx" desc="设置 disabled 属性禁用分页"></code>

### 受控

<code src="./demo/Controlled.tsx" desc="受控的页码和显示条数,需要配合onChange使用"></code>

### 自定义渲染

<code src="./demo/Custom.tsx" desc="自定义上一页,下一页以及页码列表"></code>

<style>
table { font-size: 13px; }
table th:nth-child(1) { width: 160px; }
table th:nth-child(3) { width: 100px; }
</style>

### API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| className | string | - | 扩展 className |
| style | CSSProperties | - | 样式对象 |
| align | `'left'` \| `'center'` \| `'right'` | 'left' | 对齐方式 |
| size | `'default'` \| `'small'` | 'default' | 大小 |
| total | number | 0 | 数据总数 |
| current | number | - | 当前页数 |
| defaultCurrent | number | 1 | 默认的当前页数 |
| defaultPageSize | number | 10 | 默认的每页条数 |
| pageSize | number | - | 每页条数 |
| disabled | boolean | false | 禁用分页 |
| pageSizeOptions | number[] | \[10, 20, 30, 50, 100] | 每页显示数量可选列表 |
| layout | string[] | \['prev', 'pager', 'next'] | 显示需要的内容，可选值为:<br />'pager': 页码<br />'prev': 上一页<br />'next': 下一页<br />'sizes': 每页显示的页码数量<br />'jumper': 跳转页码<br />function({ current, total, pageSize }): 匿名函数，用来信息展示 |
| onChange | (current: number, pageSize: number) => void | - | 页码或每页显示数量改变时回调<br />current: 改变后的页码<br />pageSize: 改变后的每页条数 |
| itemRender | (page, type: 'page' \| 'prev' \| 'next', originalElement) => React.ReactNode | - | 自定义页码的结构 |
