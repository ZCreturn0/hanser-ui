<template>
    <!-- 按钮 -->
    <div class="h-button" @click="handleClick">
        {{ text }}
    </div>
</template>

<script>
export default {
    name: 'h-button',
    data () {
        return {

        }
    },
    props: ['text'],
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
