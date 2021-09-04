<template>
    <!-- 输入框 -->
    <div class="h-input">
        <input class="h-input__inner" :type="type" />
    </div>
</template>

<script>
export default {
    name: 'h-input',
    data () {
        return {

        }
    },
    props: {
        type: {
            default: 'text'
        }
    }
}
</script>

<style scoped>

@import './index.css';

</style>
