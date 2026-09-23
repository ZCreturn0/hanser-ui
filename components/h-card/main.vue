<template>
    <!-- 卡片外壳：圆角、主题描边、阴影和底色，内边距交给调用方 -->
    <component :is="tag" class="h-card" :class="{ 'h-card--flat-on-mobile': flatOnMobile }">
        <slot />
    </component>
</template>

<script>
export default {
    name: 'h-card',
    props: {
        tag: {
            type: String,
            default: 'div'
        },
        // 手机上铺满屏宽的卡去掉描边和圆角；两侧留了边距的卡要关掉
        flatOnMobile: {
            type: Boolean,
            default: true
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
