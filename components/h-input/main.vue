<template>
    <!-- 输入框 -->
    <div class="h-input">
        <input
            class="h-input__inner"
            :type="type"
            :value="value"
            :placeholder="placeholder"
            @input="input" />
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
        },
        value: {
            type: String,
            default: ''
        },
        bgColor: {
            type: String,
            default: 'transparent'
        },
        color: {
            type: String,
            default: '#333'
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    methods: {
        input($event) {
            this.$emit('input', $event.target.value);
        }
    }
}
</script>

<style scoped>

@import './index.css';

</style>
