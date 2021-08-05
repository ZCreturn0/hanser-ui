const fs = require('fs');
const path = require('path');

const colors = require('../theme/colors');

const notes = `/**
 * @description 此文件为自动生成,增加新色值后需要运行 npm run build-js 重新生成
 */\n\n`;
let content = '';
const prifix = '--theme';

const keys = Object.keys(colors);
const workPath = path.resolve('./theme');

keys.forEach((key) => {
    const jsKey = key.toLocaleLowerCase().split('_').join('-');
    content += `/**\n * @description ${colors[key]}\n */\nexport const ${key} = 'var(${prifix}-${jsKey})';\n\n`;
});

fs.writeFile(
    path.resolve(workPath, 'var.js'),
    notes + content,
    'utf-8',
    (err) => {
        if (err) {
            throw err;
        }
    }
);
