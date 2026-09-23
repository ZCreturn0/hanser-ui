import HConfirm from './main.vue';

const normalize = (message, title, options) => {
    if (title && typeof title === 'object') {
        options = title;
        title = undefined;
    }
    return { message, title, options: options || {} };
};

// 调用方式和 element 的 MessageBox 一致：(message, title, options)
// $confirm 点确定 resolve('confirm')，取消或关闭 reject('cancel' | 'close')
// $alert 不管怎么关都 resolve，调用方不用补 catch
// 同一时间只弹一个，后来的排队
export const Confirm = {
    install(Vue) {
        const Constructor = Vue.extend(HConfirm);
        const queue = [];
        let current = null;

        const showNext = () => {
            if (current || !queue.length) return;
            current = queue.shift();
            const { propsData, isAlert, callback, resolve, reject } = current;
            const instance = new Constructor({ propsData });
            instance.$on('action', (action) => {
                if (typeof callback === 'function') callback(action);
                if (action === 'confirm' || isAlert) {
                    resolve(action);
                } else {
                    reject(action);
                }
            });
            instance.$on('closed', () => {
                instance.$destroy();
                current = null;
                showNext();
            });
            instance.$mount();
            instance.visible = true;
        };

        const open = (isAlert) => (...args) => {
            const { message, title, options } = normalize(...args);
            const propsData = {
                message: message == null ? '' : String(message),
                showCancel: !isAlert,
                closeOnOverlay: !isAlert,
                closeOnEscape: !isAlert
            };
            if (title !== undefined && title !== '') propsData.title = String(title);
            [
                'confirmButtonText',
                'cancelButtonText',
                'showCancel',
                'showClose',
                'closeOnOverlay',
                'closeOnEscape',
                'dangerouslyUseHTMLString',
                'width',
                'zIndex'
            ].forEach((key) => {
                if (options[key] !== undefined) propsData[key] = options[key];
            });
            return new Promise((resolve, reject) => {
                queue.push({ propsData, isAlert, callback: options.callback, resolve, reject });
                showNext();
            });
        };

        Vue.prototype.$confirm = open(false);
        Vue.prototype.$alert = open(true);
    }
};

export default HConfirm;
export { HConfirm };
