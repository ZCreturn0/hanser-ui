<template>
    <!-- 消息弹窗 -->
    <div class="h-message" :class="messageTypeClass">
        test
    </div>
</template>

<script>
export default {
    name: 'h-message',
    data () {
        return {
            type: 'message',
            mesaage: '',
            duration: 3000,
            showClose: false
        }
    },
    computed: {
        messageTypeClass() {
            return `message-type--${this.type}`;
        }
    },
    methods: {
        uninstall() {
            this.$destroy(true);
            document.body.removeChild(this.$el);
        }
    },
    mounted() {
        setTimeout(() => {
            this.uninstall();
        }, this.duration);
    }
}
</script>

<style scoped>

@import './index.css';

</style>
