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