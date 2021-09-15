<template>
    <!-- 单选框组 -->
    <div class="h-radio-group">
        <slot :selected="currentValue" />
    </div>
</template>

<script>
export default {
    name: 'h-radio-group',
    data () {
        return {
            currentValue: ''
        }
    },
    props: ['value'],
    computed: {

    },
    mounted () {
        this.currentValue = this.value;
    }
}
</script>

<style scoped>

@import './radio-group.css';

</style>
