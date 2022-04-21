<template>
    <!-- 按钮 -->
    <button class="h-button" :plain="plain" :disabled="btnDisabled || loading" @click="handleClick" :class="buttonClass">
        <slot v-if="!loading" />
        <div v-else class="loading-cover">
            <i class="fa fa-spinner" aria-hidden="true"></i>
        </div>
    </button>
</template>

<script>
export default {
    name: 'h-button',
    data () {
        return {
            loadingStatus: false,
            debonusing: false
        }
    },
    /**
     * debonus 指定每次点击按钮后按钮禁用持续时间
     * loading 由调用指定加载状态
     */
    props: ['size', 'loading', 'round', 'debonus', 'plain', 'disabled', 'type'],
    computed: {
        buttonClass() {
            const classes = [];
            const size = ['medium', 'small', 'mini'];
            if (this.size && size.includes(this.size)) {
                classes.push(`h-button--${this.size}`);
            }
            const type = ['primary', 'success', 'warning', 'message', 'danger'];
            if (this.type && type.includes(this.type)) {
                classes.push(`h-button--${this.type}`);
            }
            return classes;
        },
        btnDisabled() {
            return this.disabled || this.debonusing;
        }
    },
    methods: {
        handleClick (event) {
            if (this.debonus) {
                this.debonusing = true;
            }
            setTimeout(() => {
                this.debonusing = false;
            }, this.debonus);
            // 事件名使用 '-' 连接
            this.$emit('click', event);
        }
    }
}
</script>

<style scoped>
@import './index.css';
</style>
