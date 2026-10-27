<template>
    <!-- 开关：根元素就是按钮，调用方写的 aria-label 会直接落在它上面，读屏才念得出开关叫什么 -->
    <button
        type="button"
        role="switch"
        class="h-switch"
        :class="{ 'h-switch--checked': value, 'h-switch--disabled': disabled }"
        :aria-checked="String(value)"
        :disabled="disabled"
        @click="toggle"></button>
</template>

<script>
export default {
    name: 'h-switch',
    props: {
        value: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false }
    },
    methods: {
        // 根元素就是按钮，聚焦它键盘就能直接切；禁用时原生按钮本来就聚焦不上
        focus() {
            this.$el.focus();
        },
        // 组件自己不改状态，只把新值抛出去，由调用方决定要不要真的切
        toggle() {
            if (this.disabled) return;
            const next = !this.value;
            this.$emit('input', next);
            this.$emit('change', next);
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
