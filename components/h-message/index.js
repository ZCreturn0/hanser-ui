import HMessage from './main.vue';

export const Message = {
    install(Vue) {
        const Constructor = Vue.extend(HMessage);
        let instances = [];
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
            const [instance] = instances.slice(index, 1);
            // 正在关闭的实例不往下执行
            if (!instance || (instance && instance.status === 'closing')) return;
            instance.$el.classList.add('h-message-disappear');
            instance.status = 'closing';
            instances.forEach((instance, instanceIndex) => {
                if (instanceIndex >= index && instance.status !== 'closing') {
                    const top = instance.$el.style.top;
                    instance.$el.style.top = parseInt(top) - 80 + 'px';
                }
            });
            setTimeout(() => {
                document.body.removeChild(instance.$el);
                instances.splice(index, 1);
                Vue.prototype.ui.messageCount = instances.length;
            }, 500);
        };

        Vue.prototype.$messageCloseAll = () => {
            for (let instance of instances) {
                if (instance.status !== 'closing') {
                    instance.$el.classList.add('h-message-disappear');
                    instance.status = 'closing';
                    const top = instance.$el.style.top;
                    instance.$el.style.top = parseInt(top) - 80 + 'px';
                }
            }
            setTimeout(() => {
                instances.forEach((instance) => {
                    // 调用 messageCloseAll 后再次弹出 message，这时的 message status 不为 closing
                    if (instance.status === 'closing') document.body.removeChild(instance.$el);
                });
                instances = instances.filter((instance) => instance.status !== 'closing');
                Vue.prototype.ui.messageCount = instances.length;
            }, 500);
        };
    }
};
