import HAlert from './main.vue';

export const Alert ={
    install(Vue) {
        const Constructor = Vue.extend(HAlert);

        Vue.prototype.$alert = (options) => {
            // 是字符串直接显示
            if (typeof options === 'string') {
                messageOptions = {
                    propsData: {
                        message: options
                    }
                };
            } else if (typeof options === 'object') {
                messageOptions = {
                    propsData: Object.assign(messageOptions, {
                        type: options.type || 'message',
                        message: options.message || ''
                    })
                };
            } else {
                throw Error('$message params ERROR');
            }
            instance.$mount();
        };
    }
};
