/* eslint-env node */
/**
 * @description 手机端断点：屏宽不超过这个值按手机端处理
 * 组件 CSS 的媒体查询引用不了变量，只能写字面量；
 * 发版前 npm run check-breakpoints 会核对所有组件里的断点都和这里一致
 */
module.exports = {
    MOBILE_MAX_WIDTH: 750
};
