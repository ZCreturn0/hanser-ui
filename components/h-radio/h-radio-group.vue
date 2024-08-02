<template>
    <!-- 单选框组 -->
    <div class="h-radio-group" :class="{ 'column-direction': column }">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'h-radio-group',
    data () {
        return {

        }
    },
    props: ['value', 'column']
}
</script>

<style scoped>

@import './radio-group.css';

</style>
