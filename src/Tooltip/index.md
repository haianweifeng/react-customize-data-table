---
title: Tooltip
group:
  path: /tooltip
---

# Tooltip 文字提示

<font size='5'>示例</font>

### 基本用法

<code src="./demo/Basic.tsx"></code>

### 触发方式

<code src="./demo/Trigger.tsx" desc='两种触发方式，鼠标移入、点击。'></code>

### 弹出位置

<code src="./demo/Placement.tsx" desc='提供了12个方向来显示tooltip'></code>

### 主题

<code src="./demo/Theme.tsx" desc='提供了两个不同的主题: `dark` 和 `light`。设置theme属性来改变主题，默认为`dark`'></code>

### 延迟

<code src="./demo/Delay.tsx" desc='设置delay 属性来延迟展示'></code>

### 指定渲染容器

<code src="./demo/PopupContainer.tsx" desc='设置 getPopupContainer 指定渲染的目标容器, 默认开启autoAdjustPlacement属性自动调整弹层位置防止被遮挡'></code>

### 受控

<code src="./demo/Controlled.tsx" desc='通过visible配合onVisibleChange控制浮层显示'></code>

### API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| className | string | - | 扩展 className |
| style | CSSProperties | - | 样式对象 |
| trigger | `'hover'` \| `'click'` | 'hover' | 触发行为 |
| theme | `'dark'` \| `'light'` | 'dark' | 主题 |
| tip | `string` \| `React.ReactNode` \| `(() => React.ReactNode)` | - | 显示的文字 |
| placement | `top` \| `bottom` \| `left` \| `right` \| `topLeft` \| `topRight` \| `bottomLeft` \| `bottomRight` \| `leftTop` \| `leftBottom` \| `rightTop` \| `rightBottom` | 'top' | 气泡框位置 |
| delay | number | 0 | 延迟显示，单位毫秒 |
| getPopupContainer | function():HTMLElement | () => HTMLElement | 浮层渲染父节点，默认渲染到 body 上 |
| visible | boolean | false | 用于手动控制浮层显隐 |
| autoAdjustPlacement | boolean | true | 气泡被遮挡时自动调整位置 |
| onVisibleChange | (visible) => void | - | 显示隐藏的回调 |
