<template>
    <!-- 按钮 -->
    <div class="h-button" @click="handleClick">
        <slot name="text" />
    </div>
</template>

<script>
export default {
    name: 'h-button',
    data () {
        return {

        }
    },
    methods: {
        handleClick () {
            // 事件名使用 '-' 连接
            this.$emit('self-made-event');
        }
    }
}
</script>

<style scoped>
@import './index.css';
</style>
