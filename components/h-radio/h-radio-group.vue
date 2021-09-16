<template>
    <!-- 单选框组 -->
    <div class="h-radio-group">
        <slot :selected="value" />
    </div>
</template>

<script>
export default {
    name: 'h-radio-group',
    data () {
        return {

        }
    },
    props: ['value']
}
</script>

<style scoped>

@import './radio-group.css';

</style>
