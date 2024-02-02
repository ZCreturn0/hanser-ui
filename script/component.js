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
    return ' '.repeat(num);
};

const makeComponent = () => {
    const arr = process.argv.slice(2);
    if (arr.length < 2) {
        console.error('缺少必传参数');
        return;
    }
    if (!arr[0].startsWith('h-')) {
        console.error('组件名必须以 h- 开头');
        return;
    }
    // 生成组件的目录
    const rootPath = path.resolve('./components');
    const workPath = path.resolve(rootPath, arr[0]);
    const componentName = toHumpNaming(arr[0]);
    const htmlContent = `<template>\n${space(4)}<!-- ${arr[1]} -->\n${space(4)}<div class="${arr[0]}">\n${space(8)}\n${space(4)}</div>\n</template>`;
    const scriptContent = `<script>\nexport default {\n${space(4)}name: '${arr[0]}',\n${space(4)}data () {\n${space(8)}return {\n${space(12)}\n${space(8)}}\n${space(4)}}\n}\n</script>`;
    const styleContent = `<style scoped>\n\n@import './index.css';\n\n</style>`;
    const vueContent = `${htmlContent}\n\n${scriptContent}\n\n${styleContent}`;
    const jsContent = `import ${componentName} from './main.vue';\n\nexport default ${componentName};\n`;
    const cssContent = `.${arr[0]} {}`;

    // 开始建文件夹 -> 写文件
    fs.mkdir(workPath, (err) => {
        if (err) {
            throw err;
        }
        fs.writeFile(
            path.resolve(workPath, 'index.js'),
            jsContent,
            'utf-8',
            (err) => {
                if (err) {
                    throw err;
                }
            }
        );
        fs.writeFile(
            path.resolve(workPath, 'main.vue'),
            vueContent,
            'utf-8',
            (err) => {
                if (err) {
                    throw err;
                }
            }
        );
        fs.writeFile(
            path.resolve(workPath, 'index.css'),
            cssContent,
            'utf-8',
            (err) => {
                if (err) {
                    throw err;
                }
            }
        );
    });
};

makeComponent();
