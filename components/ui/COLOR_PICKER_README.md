# 颜色选择器组件

基于 shadcn-ui 的颜色选择器组件，提供两种使用方式。

## 快速开始

```tsx
import { ColorPicker } from "@/components/ui/color-picker";

function MyComponent() {
  const [color, setColor] = useState("#3B82F6");

  return <ColorPicker value={color} onChange={setColor} />;
}
```

## 组件说明

### ColorPicker - 完整颜色选择器

- 18 个预设颜色（2 行 ×9 列）
- 手动输入 HEX 颜色值
- 实时预览

### SimpleColorPicker - 简单颜色选择器

- 快速选择，无需弹窗
- 支持 sm/md/lg 三种尺寸
- 可自定义颜色集

## 演示页面

访问 `/color-picker-demo` 查看完整演示
