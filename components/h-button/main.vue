<template>
    <!-- 按钮 -->
    <button class="h-button" @click="handleClick" :class="buttonClass">
        <slot name="text" />
    </button>
</template>

<script>
export default {
    name: 'h-button',
    data () {
        return {

        }
    },
    props: ['size'],
    computed: {
        buttonClass() {
            const classes = [];
            const size = ['medium', 'small', 'mini'];
            if (this.size && size.includes(this.size)) {
                classes.push(`h-button--${this.size}`);
            }
            return classes;
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
