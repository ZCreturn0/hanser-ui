<template>
    <!-- 消息弹窗 -->
    <div class="h-message" :class="messageTypeClass">
        <svg class="h-message__icon" viewBox="0 0 24 24" aria-hidden="true">
            <template v-if="messageType === 'warning'">
                <path d="M12 3.5 21 19.5H3Z" />
                <path d="M12 9.5v4" />
                <circle class="h-message__dot" cx="12" cy="16.8" r="1.25" />
            </template>
            <template v-else>
                <circle cx="12" cy="12" r="9" />
                <path v-if="messageType === 'success'" d="M8 12.5 11 15.5 16.5 9.5" />
                <path v-else-if="messageType === 'danger'" d="M9 9l6 6M15 9l-6 6" />
                <template v-else>
                    <path d="M12 11v5.5" />
                    <circle class="h-message__dot" cx="12" cy="7.8" r="1.25" />
                </template>
            </template>
        </svg>
        <span class="h-message__text">{{ message }}</span>
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
        messageType() {
            return this.type || 'message';
        },
        messageTypeClass() {
            return `message-type--${this.messageType}`;
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
