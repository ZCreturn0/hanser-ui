import HMessage from './main.vue';
import HModal from '../h-modal';

export default (Vue) => {
    const instance = new HModal(Vue, HMessage);
    Vue.prototype.$message = () => {
        instance.show();
    };
};
