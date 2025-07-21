# vite-plugin-inline-source-minus

[![npm version](https://img.shields.io/npm/v/vite-plugin-inline-source-minus)](https://www.npmjs.com/package/vite-plugin-inline-source-minus)

一个用来将css和js资源内联导入到html中的的vite插件，附带缓存机制。
感谢 [vite-plugin-inline-source](https://github.com/bienzaaron/vite-plugin-inline-source) 提供的原始版本

## 安装

```bash
# 使用 npm
npm install vite-plugin-inline-source-minus --save-dev

# 使用 yarn
yarn add vite-plugin-inline-source-minus -D

# 使用 pnpm
pnpm add vite-plugin-inline-source-minus -D
```

## 基本使用

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import inlineSource from 'vite-plugin-inline-source-minus'

export default defineConfig({
  plugins: [inlineSource()]
})
```

## 配置选项

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import inlineSource from 'vite-plugin-inline-source-minus'

export default defineConfig({
  plugins: [
    inlineSource({
      // 是否优化CSS（默认：true）
      optimizeCss: true,
      
      // 是否优化JavaScript（默认：true）
      optimizeJs: true,
      
      // CSSO优化选项
      cssoOptions: {},
      
      // Terser优化选项
      terserOptions: {},
      
      // 需要替换的标签列表
      replaceTags: [],
      
      // 在开发服务器模式下是否内联资源（默认：false）
      // 设置为 true 时，开发模式下也会内联资源
      // 设置为 false 时，开发模式下保持资源分离，便于调试
      inlineServer: false
    })
  ]
})
```

### inlineServer 参数说明

- `inlineServer: false`（默认）：在开发服务器模式（`vite dev`）下不进行内联，保持资源分离便于调试
- `inlineServer: true`：在开发服务器模式下也进行内联，与生产构建行为一致

这个参数特别有用，因为：
- 开发时保持资源分离可以更好地进行调试和热更新
- 生产构建时进行内联可以减少HTTP请求，提升性能

### 开发模式下的文件路径处理

当 `inlineServer: true` 时，插件在开发模式下会正确处理各种文件路径：

```html
<!-- 相对于项目根目录的路径 -->
<link inline-source href="/src/assets/style.css" rel="stylesheet" />
<script inline-source src="/src/assets/script.js"></script>

<!-- node_modules 中的文件 -->
<link inline-source href="/node_modules/some-package/dist/style.css" rel="stylesheet" />

<!-- 相对路径 -->
<link inline-source href="./assets/local.css" rel="stylesheet" />
```

插件会自动解析这些路径并正确读取文件内容进行内联。
```html
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, shrink-to-fit=no, user-scalable=0">
        <meta name="color-scheme" content="light dark">
        <link inline-source href="/node_modules/somenpm/screen.css" rel="stylesheet" type="text/css" />
        <script inline-source  src="/src/assets/some.js"></script>
    </head>
    <body>
        <div id="app"></div>
        <noscript>
            <strong>We're sorry but demo doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
        </noscript>
    </body>
</html>

```