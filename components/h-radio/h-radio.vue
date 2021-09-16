<template>
    <!-- 单选框 -->
    <div class="h-radio"
        :class="{
            'radio--is-selected': parentValue === value,
            'radio--is-disabled': disabled
        }"
        @click="selectCurrent">
        <div class="h-radio__input">
            <div class="h-radio__input--inner"></div>
        </div>
        {{ label }}
    </div>
</template>

<script>
export default {
    name: 'h-radio',
    data () {
        return {

        }
    },
    props: ['value', 'label', 'disabled'],
    computed: {
        parentValue() {
            return this.$parent.value;
        }
    },
    methods: {
        async selectCurrent () {
            // 禁用或已选中的情况不触发事件
            if (this.disabled || this.parentValue === this.value) return;
            await this.$nextTick();
            this.$parent.$emit('input', this.value);
            this.$parent.$emit('change', this.value);
        }
    }
}
</script>

<style scoped>

@import './radio.css';

</style>
