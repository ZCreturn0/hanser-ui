import HMessage from './main.vue';

export const Message = {
    install(Vue) {
        const Constructor = Vue.extend(HMessage);
        const instances = [];

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
            const instance = new Constructor(messageOptions);
            instance.$mount();
            instance.$el.style = `top: ${20 + instances.length * 50}px`;
            document.body.appendChild(instance.$el);
            instances.push(instance);
            if (!Vue.prototype.ui) {
                Vue.prototype.ui = {
                    messageCount: instances.length
                };
            } else {
                Vue.prototype.ui.messageCount = instances.length;
            }
        };

        Vue.prototype.$messageClose = () => {
            const index = instances.find((instance) => instance === this);
            const [instance] = instances.splice(index, 1);
            instance.$el.classList.add('h-message-disappear');
            setTimeout(() => {
                document.body.removeChild(instance.$el);
                Vue.prototype.ui.messageCount = instances.length;
            }, 500);
        };

        Vue.prototype.$messageCloseAll = () => {
            for (let instance of instances) {
                instance.$messageClose();
            }
        };
    }
}
