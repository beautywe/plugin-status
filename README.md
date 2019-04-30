# 介绍

[![CircleCI](https://circleci.com/gh/beautywe/beautywe-plugin-status/tree/master.svg?style=svg)](https://circleci.com/gh/beautywe/beautywe-plugin-status/tree/master)

[![NPM Version](https://img.shields.io/npm/v/@beautywe/plugin-status.svg)](https://www.npmjs.com/package/@beautywe/plugin-status) [![NPM Downloads](https://img.shields.io/npm/dm/@beautywe/plugin-status.svg)](https://www.npmjs.com/package/@beautywe/plugin-status) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@beautywe/plugin-status.svg)[![Coverage Status](https://coveralls.io/repos/github/beautywe/beautywe-plugin-status/badge.svg)](https://coveralls.io/github/beautywe/beautywe-plugin-status)

# Feature
1. 基于事件驱动的状态机
2. 依赖于 `beautywe-plugin-event`
3. 支持 BtPage，BtApp

# 安装

```
$ npm i @beautywe/plugin-event
$ npm i @beautywe/plugin-status
```

```javascript
import BeautyWe from '@beautywe/core';
import event from '@beautywe/plugin-event';
import status from '@beautywe/plugin-status';

const app = new BeautyWe.BtApp();

// status 插件依赖于 beautywe-plugin-event
app.use(event());

// 使用 status 插件
app.use(status({
    // options
}));
```

# 使用

`beautywe-plugin-status` 弥补了微信小程序生命周期钩子不支持异步阻塞的问题。

假设我们有这样一个场景：在应用启动的时候进行全局的数据获取和初始化，待成功后，各页面再进行初始化。

那么我们可能是这样写代码：
```javascript
// on app.js
App({
    onLaunch() {
        API
            .fetch('xxx')
            .then(data => this.globalData = data);
    },
});

// on page.js
Page({
    onLoad() {
        // 在微信小程序中，onLoad 执行的时候，可能数据还没返回呢。
        const globalData = getApp().globalData;
        if (globaleData) this.initPage(globalData);
    },
});
```

在原生的小程序启动流程中，因为无论 app，page，component 的生命周期钩子函数，都不支持异步阻塞。    
但是实际项目中，我们有大量的类似的实际场景需要满足：登录态的初始化，全局数据的初始化等等。

`beautywe-plugin-status` 基于事件驱动，来满足这一类的需求：
```javascript
// on app.js
const app = BtApp({
    onLaunch() {
        API
            .fetch('xxx')
            .then(data => this.globalData = data)

            // 把状态机设置为 success
            .then(() => this.status.get('fetchGlobalData').success());
    },
});

app.use(status({
    statuses: ['fetchGlobalData'],
}));

App(app);

// on page.js
Page({
    onLoad() {
        getApp()
            .status.get('fetchGlobalData')

            // 监听一次成功状态事件
            .onceSuccess(() => {
                const globalData = getApp().globalData;
                if (globaleData) this.initPage(globalData);
            });
    },
});
```

## 原生启动流程 VS 事件驱动启动流程

![](https://img.yzcdn.cn/public_files/2019/02/26/e7a7f1ddb418507ebd1f7a45063e3814.png)

## 状态机的获取，移除，注册，批量注册

```javascript
// 批量注册（批量注册只能是在引入插件的时候）
app.use(status({
    statuses: [
        'abc',
        'def',
        'ghi',
    ],
}));

// 获取一个状态机实例
const statusInstance = app.status.get('abc');

// 移除一个状态机
app.status.remove('def');

// 新增一个状态机
app.status.add('jkl');

// 可以使用以下 api
statusInstance.success();
statusInstance.fail();
statusInstance.ing();
statusInstance.reset();
statusInstance.onceSuccess();
statusInstance.onceFail();
statusInstance.must();
statusInstance.isIng();
statusInstance.isSuccess();
statusInstance.isFail();
```

# Class Status

状态机是一个 Class，所有状态机都是 `Class Status` 的实例。    

一个状态机，有四种状态：
* 未开始：un start （为状态机的初始态）
* 进行中：ing
* 成功：success
* 失败：fail

实例的 api 主要分三类：
* 状态改变
* 状态监听
* 状态判断

## 状态改变

* Status.prototype.success：把状态机设置为 success
* Status.prototype.fail：把状态机设置为 fail
* Status.prototype.ing：把状态机设置为 ing
* Status.prototype.reset：把状态机设置为 un start

## 状态监听

* Status.prototype.onceSuccess：监听一次状态机成功的事件，监听会被注销
* Status.prototype.onceFail：监听一次状态机失败的事件，触发过后，监听会被注销
* Status.prototype.must：至少监听一次状态机成功的事件，过程中状态机失败了，会打印错误，然后监听下一次成功事件

## 状态判断

* Status.prototype.isIng()：当前状态机是否为 ing 状态，返回 true | false
* Status.prototype.isSuccess()：当前状态机是否为 success 状态，返回 true | false
* Status.prototype.isFail()：当前状态机是否为 fail 状态，返回 true | false