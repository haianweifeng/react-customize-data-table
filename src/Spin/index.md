---
title: Spin
group:
  path: /spin
---

# Spin 加载中

<font size='5'>示例</font>

### 基本用法

<code src="./demo/Basic.tsx"></code>

### 自定义提示文案

<code src="./demo/Tip.tsx"></code>

### 包裹容器

<code src="./demo/Wrapper.tsx" desc="直接把内容内嵌到 Spin 中，将现有容器变为加载状态。"></code>

### 容器

<code src="./demo/Inside.tsx" desc="放入容器中"></code>

### bounce

<code src="./demo/Bounce.tsx" desc="type='bounce'"></code>

### wave

<code src="./demo/Wave.tsx" desc="type='wave'"></code>

### cube

<code src="./demo/Cube.tsx" desc="type='cube'"></code>

### pulse

<code src="./demo/Pulse.tsx" desc="type='pulse'"></code>

### flow

<code src="./demo/Flow.tsx" desc="type='flow'"></code>

### circle

<code src="./demo/Circle.tsx" desc="type='circle'"></code>

### circle-fade

<code src="./demo/CircleFade.tsx" desc="type='circle-fade'"></code>

### grid

<code src="./demo/Grid.tsx" desc="type='grid'"></code>

### fold

<code src="./demo/Fold.tsx" desc="type='fold'"></code>

### ring

<code src="./demo/Ring.tsx" desc="type='ring'"></code>

### loading

<code src="./demo/Loading.tsx" desc="type='loading'"></code>

### chase

<code src="./demo/Chase.tsx" desc="type='chase'"></code>

### chase-bounce

<code src="./demo/ChaseBounce.tsx" desc="type='chase-bounce'"></code>

### 自定义指示符

<code src="./demo/Custom.tsx" desc="设置type='custom'且设置indicator属性"></code>

<style>
  .spin-plane {
    width: 40px;
    height: 40px;
    background-color: #1890ff;
    animation: spin-rotateplane 1.2s infinite ease-in-out;
  }
  
  @keyframes spin-rotateplane {
    0% { 
      transform: perspective(120px) rotateX(0deg) rotateY(0deg);
    } 50% { 
      transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
    } 100% { 
      transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
    }
  }
</style>

```css
.spin-plane {
  width: 40px;
  height: 40px;
  background-color: #1890ff;
  animation: spin-rotateplane 1.2s infinite ease-in-out;
}
@keyframes spin-rotateplane {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  }
  100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
  }
}
```

<style>
table { font-size: 13px; }
table th:nth-child(1) { width: 140px; }
table th:nth-child(3) { width: 100px; }
</style>

### API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| className | string | - | 扩展 className |
| style | CSSProperties | - | 样式对象 |
| size | `'default'` \| `'small'` \| `'large'` | 'default' | 大小 |
| tip | string | - | 提示文案 |
| isLoading | boolean | false | 是否为加载中状态 |
| indicator | ReactNode | - | 加载指示符 |
| type | `'bounce'` \| `'wave'` \| `'cube'` \| `'pulse'` \| `'flow'` \| `'circle'` \| `'circle-fade'` \| `'grid'` \| `'fold'` \| `'ring'` \| `'loading'` \| `'chase'` \| `'chase-bounce'` \| `'custom'` \| `'default'` | default | 加载器类型<br />设置自定义加载器 type: 'custom'且需要配合 indicator 属性 |
