/* eslint-env node */
/**
 * @description 核对组件媒体查询里的断点都等于 common/breakpoints.js 的 MOBILE_MAX_WIDTH
 */
const fs = require('fs');
const path = require('path');
const { MOBILE_MAX_WIDTH } = require('../common/breakpoints');

const root = path.resolve(__dirname, '../components');
const bad = [];
let count = 0;

const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(file);
            return;
        }
        if (!/\.(css|vue)$/.test(entry.name)) return;
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, index) => {
            if (!line.includes('@media')) return;
            const pattern = /(max|min)-width:\s*(\d+)px/g;
            let match;
            while ((match = pattern.exec(line))) {
                count++;
                const [, kind, value] = match;
                const expected = kind === 'max' ? MOBILE_MAX_WIDTH : MOBILE_MAX_WIDTH + 1;
                if (Number(value) !== expected) {
                    bad.push(`${path.relative(root, file)}:${index + 1} ${kind}-width: ${value}px，应为 ${expected}px`);
                }
            }
        });
    });
};

walk(root);
if (bad.length) {
    console.error(`断点和 common/breakpoints.js 不一致：\n${bad.join('\n')}`);
    process.exit(1);
}
console.log(`断点检查通过：${count} 处都是 ${MOBILE_MAX_WIDTH}px`);
