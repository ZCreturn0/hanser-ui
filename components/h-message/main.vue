<template>
    <!-- 消息弹窗 -->
    <div class="h-message" :class="messageTypeClass">
        test
    </div>
</template>

<script>
import destroy from '../../mixins/destroy';
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
    mixins: [destroy],
    computed: {
        messageTypeClass() {
            return `message-type--${this.type}`;
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
