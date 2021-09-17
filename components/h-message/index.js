import HMessage from './main.vue';

export const Message = {
    install(Vue) {
        const Constructor = Vue.extend(HMessage);
        this.instance = new Constructor();
        Vue.prototype.$message = () => {
            this.instance.$mount();
            document.body.appendChild(this.instance.$el);
        };
    }
}
