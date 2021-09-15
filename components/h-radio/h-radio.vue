<template>
    <!-- 单选框 -->
    <div class="h-radio">
        <div class="h-radio__input"></div>
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
    props: ['value', 'label']
}
</script>

<style scoped>

@import './radio.css';

</style>
