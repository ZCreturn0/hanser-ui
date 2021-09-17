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
            type: 'info',
            mesaage: '',
            duration: 3000,
            showClose: false
        }
    },
    computed: {
        messageTypeClass() {
            return `message-type--${this.type}`;
        }
    }
}
</script>

<style scoped>

@import './index.css';

</style>
