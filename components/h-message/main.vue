<template>
    <!-- 消息弹窗 -->
    <div class="h-message">
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
    }
}
</script>

<style scoped>

@import './index.css';

</style>
