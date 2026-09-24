<template>
    <!-- 切换栏：只管这一排项，不管下面的内容面板。
         nav 是页面顶部的主题色导航条，line 是卡片里的下划线筛选。
         项带 to 时按导航处理（链接 + aria-current），否则按页内切换处理（tablist + 方向键） -->
    <component
        :is="isNav ? 'nav' : 'div'"
        class="h-tabs"
        :class="[`h-tabs--${type}`, { 'h-tabs--fill-on-mobile': fillOnMobile }]"
        :role="isNav ? null : 'tablist'"
        @keydown="handleKeydown">
        <template v-for="(item, index) in items">
            <router-link
                v-if="item.to"
                :key="item.value"
                class="h-tabs__item"
                :class="itemClass(item)"
                :to="item.to"
                :replace="item.replace !== undefined ? item.replace : replace"
                :event="item.disabled ? '' : 'click'"
                :aria-current="isActive(item) ? 'page' : null"
                :aria-disabled="item.disabled ? 'true' : null"
                :tabindex="item.disabled ? -1 : null"
                @click.native="select(item)">
                <span class="h-tabs__label"><slot name="label" :item="item" :active="isActive(item)">{{
                    item.label
                }}</slot></span>
                <span v-if="item.count" class="h-tabs__count">{{ item.count }}</span>
            </router-link>
            <button
                v-else
                :key="item.value"
                ref="tabs"
                type="button"
                role="tab"
                class="h-tabs__item"
                :class="itemClass(item)"
                :data-index="index"
                :disabled="item.disabled"
                :aria-selected="isActive(item) ? 'true' : 'false'"
                :tabindex="index === focusIndex ? 0 : -1"
                @click="select(item)">
                <span class="h-tabs__label"><slot name="label" :item="item" :active="isActive(item)">{{
                    item.label
                }}</slot></span>
                <span v-if="item.count" class="h-tabs__count">{{ item.count }}</span>
            </button>
        </template>
        <slot name="extra" />
    </component>
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
        // [{ value, label, count, to, replace, disabled }]，带 to 的项渲染成 router-link
        items: {
            type: Array,
            default: () => []
        },
        type: {
            type: String,
            default: 'line',
            validator: (value) => ['nav', 'line'].includes(value)
        },
        // 路由项用 replace 跳转，不留历史记录；单项的 replace 优先
        replace: {
            type: Boolean,
            default: false
        },
        // 屏宽 750px 以下 nav 的项等分铺满
        fillOnMobile: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        isNav() {
            return this.items.some((item) => item.to);
        },
        // 页内切换时只有一项能被 Tab 键选中：当前项，没有当前项就是第一个可用项
        focusIndex() {
            const active = this.items.findIndex((item) => this.isActive(item) && !item.disabled);
            return active > -1 ? active : this.items.findIndex((item) => !item.disabled);
        }
    },
    methods: {
        isActive(item) {
            return item.value === this.value;
        },
        itemClass(item) {
            return { 'h-tabs__item--active': this.isActive(item), 'h-tabs__item--disabled': item.disabled };
        },
        select(item) {
            if (item.disabled) return;
            this.$emit('tab-click', item);
            if (item.value !== this.value) {
                this.$emit('input', item.value);
                this.$emit('change', item.value);
            }
        },
        // 页内切换按 WAI-ARIA tabs：左右方向键、Home、End 在可用项之间移动并直接选中
        handleKeydown(event) {
            if (this.isNav) return;
            const tabs = (this.$refs.tabs || []).filter((tab) => !tab.disabled);
            const current = tabs.indexOf(document.activeElement);
            if (current === -1) return;
            const last = tabs.length - 1;
            const target = {
                ArrowRight: current === last ? 0 : current + 1,
                ArrowLeft: current === 0 ? last : current - 1,
                Home: 0,
                End: last
            }[event.key];
            if (target === undefined) return;
            event.preventDefault();
            const tab = tabs[target];
            tab.focus();
            this.select(this.items[Number(tab.dataset.index)]);
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
