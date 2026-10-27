<template>
    <!-- 标签：只是一个壳，底色和文字由调用方放进来；关闭按钮压在右上角 -->
    <span class="h-tag">
        <slot></slot>
        <button
            v-if="closable"
            ref="close"
            type="button"
            class="h-tag__close"
            :aria-label="closeLabel"
            @click="$emit('close', $event)">
            <i class="h-tag__close-icon" aria-hidden="true"></i>
        </button>
    </span>
</template>

<script>
export default {
    name: 'h-tag',
    props: {
        closable: { type: Boolean, default: false },
        // 关闭按钮只有一个 ×，读屏要靠它说清关掉的是哪个；漏传时至少念出「关闭」
        closeLabel: { type: String, default: '关闭' }
    },
    methods: {
        // 用键盘关掉一个之后，调用方要把焦点交给下一个标签的关闭按钮
        focusClose() {
            if (this.$refs.close) this.$refs.close.focus();
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
