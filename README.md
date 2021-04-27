# unused-webpack-plugin

查找项目中未使用的文件，生成`unused-files.txt`文件

## 安装

```bash
npm install -D unused-fs-webpack-plugin
```

## 使用
```javascript
const UnusedPlugin = require('unused-fs-webpack-plugin')

{
    ...
  plugins: [
      new UnusedPlugin({
        baseUrl: ['src'],
        exclude: ['node_modules']
      })
  ]
}
```

webpack build 完成后会在 output 文件夹生成，`unused-files.txt`

## 插件安装
vscode: [unused file view plugin](https://marketplace.visualstudio.com/items?itemName=zhiqiang0x0.unused-file-view)
可以安装此插件，进行便捷删除文件
