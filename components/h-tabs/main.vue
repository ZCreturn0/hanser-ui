<template>
    <!-- 切换栏：nav 是页面顶部的主题色导航条，line 是卡片里的下划线筛选 -->
    <nav class="h-tabs" :class="`h-tabs--${type}`">
        <template v-for="item in items">
            <router-link
                v-if="item.to"
                :key="item.value"
                class="h-tabs__item"
                :class="{ 'is-active': item.value === value }"
                :to="item.to"
                :replace="replace"
                :aria-current="item.value === value ? 'page' : null"
                @click.native="select(item)">
                <span class="h-tabs__label">{{ item.label }}</span>
                <span v-if="item.count" class="h-tabs__count">{{ item.count }}</span>
            </router-link>
            <button
                v-else
                :key="item.value"
                type="button"
                class="h-tabs__item"
                :class="{ 'is-active': item.value === value }"
                :aria-pressed="item.value === value ? 'true' : 'false'"
                @click="select(item)">
                <span class="h-tabs__label">{{ item.label }}</span>
                <span v-if="item.count" class="h-tabs__count">{{ item.count }}</span>
            </button>
        </template>
    </nav>
</template>

<script>
export default {
    name: 'h-tabs',
    props: {
        // 当前选中项的 value，支持 v-model
        value: {
            type: [String, Number],
            default: null
        },
        // [{ value, label, count, to }]，带 to 的项渲染成 router-link
        items: {
            type: Array,
            default: () => []
        },
        type: {
            type: String,
            default: 'line',
            validator: (value) => ['nav', 'line'].includes(value)
        },
        // 路由项用 replace 跳转，不留历史记录
        replace: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        select(item) {
            this.$emit('tab-click', item);
            if (item.value !== this.value) {
                this.$emit('input', item.value);
                this.$emit('change', item.value);
            }
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
