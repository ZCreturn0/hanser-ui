<template>
    <!-- 消息弹窗 -->
    <div class="h-message" :class="messageTypeClass">
        {{ message }}
    </div>
</template>

<script>
export default {
    name: 'h-message',
    data () {
        return {

        }
    },
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
            this.$destroy(true);
            this.$messageClose(this.hanserMessageId);
        }, duration);
    }
}
</script>

<style scoped>

@import './index.css';

</style>
