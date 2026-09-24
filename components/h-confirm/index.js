import HConfirm from './main.vue';

// 调用方可传的选项
const OPTION_KEYS = [
    'title',
    'type',
    'confirmButtonText',
    'cancelButtonText',
    'confirmButtonType',
    'showConfirmButton',
    'showCancelButton',
    'showClose',
    'closeOnClickModal',
    'closeOnPressEscape',
    'distinguishCancelAndClose',
    'dangerouslyUseHTMLString',
    'customClass',
    'width',
    'zIndex',
    'beforeClose',
    'inputValue',
    'inputType',
    'inputPlaceholder',
    'inputPattern',
    'inputValidator',
    'inputErrorMessage'
];

const KIND_DEFAULTS = {
    confirm: {},
    // alert 必须点确定：没有取消，点遮罩和 Esc 不关
    alert: { showCancelButton: false, closeOnClickModal: false, closeOnPressEscape: false },
    prompt: { showInput: true }
};

let Constructor = null;
const queue = [];
let current = null;

const showNext = () => {
    if (current || !queue.length) return;
    current = queue.shift();
    const { kind, fields, callback, resolve, reject } = current;
    const instance = new Constructor();
    Object.assign(instance, fields);
    instance.$on('action', (action) => {
        if (typeof callback === 'function') {
            if (instance.showInput) {
                callback(instance.inputValue, action);
            } else {
                callback(action, instance);
            }
        }
        if (action === 'confirm') {
            resolve(instance.showInput ? { value: instance.inputValue, action } : action);
        } else if (kind === 'alert') {
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

// 调用方式：(message, title, options)，title 可省略
// 确定 resolve；取消、关闭 reject，关闭默认也给 'cancel'，开 distinguishCancelAndClose 才给 'close'
// alert 不管怎么关都 resolve，调用方不用补 catch
// 同一时间只弹一个，后来的排队
const open = (kind) => (message, title, options) => {
    if (!Constructor) {
        throw new Error('hanser-ui h-confirm：先 Vue.use(Confirm) 再调用');
    }
    if (title && typeof title === 'object') {
        options = title;
        title = undefined;
    }
    options = options || {};
    const fields = Object.assign({}, KIND_DEFAULTS[kind], {
        message: message == null ? '' : String(message)
    });
    if (title !== undefined && title !== '') fields.title = String(title);
    OPTION_KEYS.forEach((key) => {
        if (options[key] !== undefined) fields[key] = options[key];
    });
    return new Promise((resolve, reject) => {
        queue.push({ kind, fields, callback: options.callback, resolve, reject });
        showNext();
    });
};

export const confirm = open('confirm');
export const alert = open('alert');
export const prompt = open('prompt');

export const Confirm = {
    install(Vue) {
        Constructor = Vue.extend(HConfirm);
        Vue.prototype.$confirm = confirm;
        Vue.prototype.$alert = alert;
        Vue.prototype.$prompt = prompt;
    },
    confirm,
    alert,
    prompt
};

export default Confirm;
