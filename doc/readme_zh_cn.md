<p align="right">中文 | <a href="../readme.md">En</a>
<div align="center">
<h1>radbar</h1>

快速通过radbar在NodeJs中创建一个进度条

[![GitHub release](https://img.shields.io/github/v/release/newtorn/radbar)](https://github.com/newtorn/radbar/releases)
[![Npm version](https://img.shields.io/npm/v/radbar)](https://github.com/newtorn/radbar.git)
[![Github license](https://img.shields.io/github/license/newtorn/radbar)](LICENSE)
===
</div>

``radbar`` 意思是 ``rad bar``, rad 意为 ``非常棒的、极好的、吸引人的``, 它是一个终端上的进度信号器。

## 快速开始
通过``iterator(iterable)``包装一个可迭代对象, 即可快速产生一个小的智能进度条。

```js
const radbar = require('radbar');
for (let _ of radbar.ProgressBar.iterator(Array(2e4)));
```
```
hello:  68.40%|█████████████░░░░░░░| 1368/2000 [00:02>00:01, 1000.07Bytes/s]
```

![quickstart](../assets/quickstart.gif)

## 安装
```shell
npm install radbar
```

## 接口
`::ProgressBar`
创建一个默认的进度条。
```js
const radbar = require('radbar');
let pb = new radbar.ProgressBar();
```

`::options`
它是构造函数的参数，选项见下列代码。
```js
const radbar = require('radbar');
let opts = {
    total: 100,         // 处理任务的总数量，默认：100
    unit: "MB",         // 速度单位，默认："Bytes"
    desc: "Write",      // 进度条描述，默认：""
    barlen: 25,         // 进度条长度，默认：终端宽度
    visrest: true,      // 是否打印剩余进度数量，默认：false
    endl: true,         // 是否结束后换行, 默认：false
    comp_char: '*',     // 完成的进度显示字符，默认：'\u2588'(█)
    rest_char: ' ',     // 未完成的进度显示字符，默认：'\u2591' (░)
    callback: ()=>{},   // 进度条完成后回调函数，默认：undefined
}
let pb = new radbar.ProgressBar(opts);
```

`::update`
它是一个实例方法，使用该函数更新每次处理的数量，接收一个更新数量参数。
```js
const radbar = require('radbar');
let pb = new radbar.ProgressBar({total: 4e5});
function *gen() { for (let i=0; i<4e4; ++i) yield 10; }
for (let written of gen()) { pb.update(written) }
```

`iterator`
it's a class static method, quickly show a smart progress bar, params: (obj, options), returns a generator. obj is a number or an iteratable object.
它是一个类静态方法，能够快速产生一个智能的进度条，接收两个参数，参数一既可以是可迭代对象，也可以是数字，当为数字时将作为total选项参数，参数二为选项参数。
```js
const radbar = require('radbar');
for (let _ of radbar.ProgressBar.iterator(Array(2e4)));
```

## 声明
代码声明使用 [MIT](LICENSE)
