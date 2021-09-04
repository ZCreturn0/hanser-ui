<template>
    <!-- 输入框 -->
    <div class="h-input">
        <input class="h-input__inner" :type="type" :value="value" @input="input" />
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
        }
    },
    mounted() {
        console.log('aaaa', this.value);
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
