<template>
    <!-- 单选框 -->
    <div class="h-radio" :class="{ 'radio--is-selected': selected === value }" @click="selectCurrent">
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
    props: ['value', 'label', 'disabled', 'selected'],
    methods: {
        async selectCurrent () {
            if (this.disabled) return;
            await this.$nextTick();
            this.$parent.$emit('input', this.value);
        }
    }
}
</script>

<style scoped>

@import './radio.css';

</style>
