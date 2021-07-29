/**
 * @description 自动生成组件模版 依次传入以下参数 例: npm run component h-button 按钮
 * @param {string} @requires name required 组件名,使用'-'连接,必须以 'h-' 开头
 * @param {string} @requires comment 注释
 */
const fs = require('fs');
const path = require('path');

// '-' 转 首字母大写
const toHumpNaming = (name) => {
    const names = name.split('-');
    let str = '';
    let index = 0;
    let temp;
    while ((temp = names[index++])) {
        str += temp[0].toUpperCase() + temp.slice(1);
    }
    return str;
};

// 返回空格数
const space = (num) => {
    let i = 0;
    let str = '';
    while (i++ < num) {
        str += ' ';
    }
    return str;
};

const makeComponent = () => {
    const arr = process.argv.slice(2);
    if (arr.length < 2) {
        console.error('缺少必传参数');
        return;
    }
    if (!arr[0].startsWith('h-')) {
        console.error('组件名必须以 h- 开头');
    }
    console.log('done');
};

makeComponent();
