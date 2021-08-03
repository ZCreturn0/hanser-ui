<template>
    <!-- 按钮 -->
    <div class="h-button" @click="handleClick">
        示例按钮
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
/* 前面加上 '/' 表示根路径，否则可能报错 */
@import '/hanser-css/components/h-button/index.css';
</style>
