<p align="right">En | <a href="doc/readme_zh_cn.md">中文</a>
<div align="center">
<h1>radbar</h1>

Quickly start a smart progress in NodeJs with radbar

[![GitHub release](https://img.shields.io/github/v/release/newtorn/radbar)](https://github.com/newtorn/radbar/releases)
[![Npm version](https://img.shields.io/npm/v/radbar)](https://github.com/newtorn/radbar.git)
[![Github license](https://img.shields.io/github/license/newtorn/radbar)](LICENSE)
===
</div>

``radbar`` means ``rad bar``, rad means ``great|good|terrific|fantastic|Extremely``, it's terminal progress indicator.

## QuickStart
Just wrap any iterable with ``iterator(iterable)``, quickly show a tiny smart progress bar.

```js
const radbar = require('radbar');
for (let _ of radbar.ProgressBar.iterator(Array(2e4)));
```
```
hello:  68.40%|█████████████░░░░░░░| 1368/2000 [00:02>00:01, 1000.07Bytes/s]
```

![quickstart](assets/quickstart.gif)

## Installation
```shell
npm install radbar
```

## API
`::ProgressBar`
create a progress bar
```js
const radbar = require('radbar');
let pb = new radbar.ProgressBar();
```

`::options`
constructor parameter, set ProgressBar options, type: Object
```js
const radbar = require('radbar');
let opts = {
    total: 100,         // processing total, default: 100
    unit: "MB",         // speed unit, default: "Bytes"
    desc: "Write",      // bar description, default: ""
    barlen: 25,         // bar length, default: terimal width
    visrest: true,      // print incomplete length, default: false
    endl: true,         // print end line, default: false
    comp_char: '*',     // complete char, default: '\u2588'(█)
    rest_char: ' ',     // incomplete char, default: '\u2591' (░)
    callback: ()=>{},   // callback funtion, default: undefined
}
let pb = new radbar.ProgressBar(opts);
```

`::update`
it's an instant method, each processing length using update function to render, params: num(update length)
```js
const radbar = require('radbar');
let pb = new radbar.ProgressBar({total: 4e5});
function *gen() { for (let i=0; i<4e4; ++i) yield 10; }
for (let written of gen()) { pb.update(written) }
```

`iterator`
it's a class static method, quickly show a smart progress bar, params: (obj, options), returns a generator. obj is a number or an iteratable object.
```js
const radbar = require('radbar');
for (let _ of radbar.ProgressBar.iterator(Array(2e4)));
```

## LICENSE
Code license with [MIT](LICENSE)