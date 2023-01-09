/**
 * @description 创建颜色，依次传入以下参数，示例：`npm run add-color 'EXAMPLE_ADD_COLOR 测试添加颜色' '#fff #eee #444 #888'`
 * @param {string} name 按var.js中传入，如 NEW_BG_COLOR
 * @param {string} description 颜色说明
 * @param {string[]} 依次传入各主题的颜色，多余的参数回舍弃，缺少的参数会默认为#fff
 */

const fs = require('fs');
const path = require('path');

const workPath = path.resolve('./theme');

const jsPath = fs.readFileSync(path.resolve(workPath, 'colors.js'), 'utf8');
const cssPath = fs.readFileSync(path.resolve(workPath, 'var.css'), 'utf8');

const findAllIndex = (arr, ele) => {
    const indexes = [];
    arr.forEach((value, index) => {
        if (ele === value) {
            indexes.push(index);
        }
    });
    return indexes;
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

const getCssClassName = (name) => {
    const pieces = name.split('_').map((item) => item.toLowerCase());
    return `--theme-${pieces.join('-')}`;
};

const modules = cssPath.split('\n').filter((item) => !!item);
const indexes = findAllIndex(modules, '}');

const themes = indexes.map((item, index) => {
    let beforeIndex;
    if (index === 0) {
        beforeIndex = 0;
    } else {
        beforeIndex = indexes[index - 1] + 1;
    }
    return modules.slice(beforeIndex, item + 1);
});

const args = process.argv.slice(2);
const nameAndDesc = args[0].split(' ');
const name = nameAndDesc[0];
const description = nameAndDesc[1];
const colors = args[1].split(' ');

// js
const descs = jsPath.split('\n').filter((item) => !!item);
descs[descs.length - 2] += ',';
descs.splice(descs.length - 1, 0, `${space(4)}${name}: '${description}'`);

// css
themes.forEach((item, index) => {
    item.splice(item.length - 1, 0, `${space(4)}${getCssClassName(name)}: ${colors[index] || '#fff'};`);
});

fs.writeFile(
    path.resolve(workPath, 'colors.js'),
    descs.join('\n'),
    'utf-8',
    (err) => {
        if (err) {
            throw err;
        }
    }
);

fs.writeFile(
    path.resolve(workPath, 'var.css'),
    themes.map((item) => item.join('\n')).join('\n\n'),
    'utf-8',
    (err) => {
        if (err) {
            throw err;
        }
    }
);
