import HMessage from './main.vue';

const TOP = 20;
const GAP = 12;
// 和 index.css 里收起动画的时长一致
const LEAVE_DURATION = 300;

export const Message = {
    install(Vue) {
        const Constructor = Vue.extend(HMessage);
        const instances = [];
        let hanserMessageId = 0;

        // 正在关闭的不占位置
        const openInstances = () => instances.filter((instance) => instance.status !== 'closing');
        // 按每条的实际高度从上往下排
        const layout = () => {
            openInstances().reduce((top, instance) => {
                instance.$el.style.top = `${top}px`;
                return top + instance.$el.offsetHeight + GAP;
            }, TOP);
        };

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
            // 先算好位置再挂上去，挂上去之后再改 top 会从最上面滑下来
            instance.$el.style.top = `${openInstances().reduce((top, item) => top + item.$el.offsetHeight + GAP, TOP)}px`;
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
            const instance = instances.find((item) => item.hanserMessageId === hanserMessageId);
            // 正在关闭的实例不往下执行
            if (!instance || instance.status === 'closing') return;
            instance.$el.classList.add('h-message-disappear');
            instance.status = 'closing';
            layout();
            setTimeout(() => {
                document.body.removeChild(instance.$el);
                instances.splice(instances.indexOf(instance), 1);
                Vue.prototype.ui.messageCount = instances.length;
            }, LEAVE_DURATION);
        };

        Vue.prototype.$messageCloseAll = () => {
            instances.forEach((instance) => Vue.prototype.$messageClose(instance.hanserMessageId));
        };
    }
};
