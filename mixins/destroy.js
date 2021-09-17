export default {
    methods: {
        uninstall() {
            this.$destroy(true);
            document.body.removeChild(this.$el);
        }
    }
};
