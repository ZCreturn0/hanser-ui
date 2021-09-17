import HMessage from './main.vue';

export const Message = {
    install(Vue) {
        const Constructor = Vue.extend(HMessage);
        Vue.prototype.$message = (options) => {
            let messageOptions = {};
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
                        message: options.message || '',
                        duration: options.duration || 3000,
                        showClose: options.showClose || false
                    })
                };
            } else {
                throw Error('$message params ERROR');
            }
            this.instance = new Constructor(messageOptions);
            this.instance.$mount();
            document.body.appendChild(this.instance.$el);
        };
    }
}
