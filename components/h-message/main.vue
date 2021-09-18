<template>
    <!-- 消息弹窗 -->
    <div class="h-message" :class="messageTypeClass">
        {{ message }}
    </div>
</template>

<script>
import destroy from '../../mixins/destroy';
export default {
    name: 'h-message',
    data () {
        return {

        }
    },
    mixins: [destroy],
    props: ['type', 'message', 'duration', 'showClose'],
    computed: {
        messageTypeClass() {
            const type = this.type || 'message';
            return `message-type--${type}`;
        }
    },
    mounted() {
        const duration = this.duration || 3000;
        setTimeout(() => {
            this.uninstall();
        }, duration);
    }
}
</script>

<style scoped>

@import './index.css';

</style>
