const fs = require('fs');
const path = require('path');

const workPath = path.resolve('./theme');
const colors = require('../theme/colors');
const template = fs.readFileSync(path.resolve(workPath, 'demo.template'), 'utf8');

const prifix = '--theme';
const getClassName = (name) => {
    const jsKey = name.toLocaleLowerCase().split('_').join('-');
    return `${prifix}-${jsKey}`;
};
const space = (num) => {
    return ' '.repeat(num);
};
const formatCss = (className) => {
    return `${space(8)}.${className} {\n${space(12)}background-color: var(${className});\n${space(8)}}\n`;
};
const formatHtml = (key, text, className) => {
    return `${space(8)}<div class="box ${className}">\n${space(12)}<div>${className}</div>\n${space(12)}<div>${key}</div>\n${space(12)}<div>${text}</div>\n${space(8)}</div>\n`;
};

let cssstr = '';
let htmlStr = '';
Object.entries(colors).forEach(([key, text]) => {
    const className = getClassName(key);
    const css = formatCss(className);
    const html = formatHtml(key, text, className);
    cssstr += css;
    htmlStr += html;
});

const vueContent = template.replace('/* css-template */', cssstr).replace('<!-- html-template -->', htmlStr);

fs.writeFile(
    path.resolve(workPath, 'demo.html'),
    vueContent,
    'utf-8',
    (err) => {
        if (err) {
            throw err;
        }
    }
);
