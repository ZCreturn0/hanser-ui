import HAlert from './main.vue';

export const Alert ={
    install(Vue) {
        const Constructor = Vue.extend(HAlert);

        Vue.prototype.$alert = (options) => {
            let alertOptions = {};
            // 是字符串直接显示
            if (typeof options === 'string') {
                alertOptions = {
                    propsData: {
                        message: options
                    }
                };
            } else if (typeof options === 'object') {
                alertOptions = {
                    propsData: Object.assign(alertOptions, {
                        type: options.type || 'message',
                        message: options.message || ''
                    })
                };
            } else {
                throw Error('$message params ERROR');
            }
            const instance = new Constructor(alertOptions);
            instance.$mount();
            document.body.appendChild(instance.$el);
        };
    }
};
