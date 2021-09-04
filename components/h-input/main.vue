<template>
    <!-- 输入框 -->
    <div class="h-input">
        <input
            class="h-input__inner"
            :type="type"
            :value="value"
            :style="style"
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
            type: string,
            default: 'transparent'
        },
        color: {
            type: string,
            default: '#333'
        }
    },
    computed: {
        style() {
            return `background-color: ${this.bgColor}; color: ${this.color}`;
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
