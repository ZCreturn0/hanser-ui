import { Confirm, alert } from '../h-confirm';

// 已废弃，请用 h-confirm 的 $alert。
// 原来的实现弹出来没有关闭按钮、关不掉，而且和 h-confirm 都往 Vue.prototype 上注册 $alert，
// 后装的会覆盖先装的。现在转交给 h-confirm，两个不管先装哪个，$alert 都是同一套实现，
// 原来的 $alert('文字') 和 $alert({ type, message }) 两种写法照旧可用
const LEGACY_TYPES = {
    message: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    error: 'error'
};

const legacyAlert = (options, ...rest) => {
    if (options && typeof options === 'object' && !rest.length) {
        return alert(options.message || '', { type: LEGACY_TYPES[options.type] || '' });
    }
    return alert(options, ...rest);
};

export const Alert = {
    install(Vue) {
        Vue.use(Confirm);
        Vue.prototype.$alert = legacyAlert;
    }
};
