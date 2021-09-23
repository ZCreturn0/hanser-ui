import HMessage from './main.vue';

export const Message = {
    install(Vue) {
        const Constructor = Vue.extend(HMessage);
        const instances = [];
        let hanserMessageId = 0;

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
            instance.hanserMessageId = hanserMessageId++;
            instance.$mount();
            instance.$el.style = `top: ${20 + instances.length * 80}px`;
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

        Vue.prototype.$messageClose = (hanserMessageId) => {
            const index = instances.findIndex((instance) => instance.hanserMessageId === hanserMessageId);
            const [instance] = instances.splice(index, 1);
            // 被 $messageCloseAll 关闭后实例不存在,不需要继续往下执行
            if (!instance) return;
            instance.$el.classList.add('h-message-disappear');
            instances.forEach((instance, instanceIndex) => {
                if (instanceIndex >= index) {
                    const top = instance.$el.style.top;
                    instance.$el.style.top = parseInt(top) - 80 + 'px';
                }
            });
            setTimeout(() => {
                document.body.removeChild(instance.$el);
                Vue.prototype.ui.messageCount = instances.length;
            }, 500);
        };

        Vue.prototype.$messageCloseAll = () => {
            for (let instance of instances) {
                instance.$el.classList.add('h-message-disappear');
                const top = instance.$el.style.top;
                instance.$el.style.top = parseInt(top) - 80 + 'px';
            }
            setTimeout(() => {
                instances.forEach((instance) => {
                    document.body.removeChild(instance.$el);
                });
                instances.splice(0);
                Vue.prototype.ui.messageCount = instances.length;
            }, 500);
        };
    }
};
