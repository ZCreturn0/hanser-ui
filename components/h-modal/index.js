import HModal from './main.vue';

export default class {
    constructor(Vue, InnerComponent) {
        const Constructor = Vue.extends(HModal);
        const instance = new Constructor();
        instance.content = InnerComponent;
    }

    show() {
        instance.$mount();
        document.body.appendChild(instance.$el);
    }
}
