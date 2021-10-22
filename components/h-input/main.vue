<template>
    <!-- 输入框 -->
    <div class="h-input" :size="size">
        <input
            class="h-input__inner"
            :style="inputStyle"
            :type="type"
            :value="value"
            :placeholder="placeholder"
            @input="input" />
    </div>
</template>

<script>
import { INPUT_BG_COLOR, INPUT_TEXT_COLOR, BORDER_COLOR } from '../../theme/var';
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
            default: INPUT_BG_COLOR
        },
        color: {
            type: String,
            default: INPUT_TEXT_COLOR
        },
        // 边框颜色
        border: {
            type: String,
            default: BORDER_COLOR
        },
        placeholder: {
            type: String,
            default: ''
        },
        round: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            // ''   'small'   'mini'
            default: ''
        }
    },
    computed: {
        inputStyle() {
            let borderStyle = '';
            if (this.border === 'none') {
                borderStyle = '';
            } else if (!this.border) {
                borderStyle = `1px solid ${BORDER_COLOR}`;
            } else {
                borderStyle = `1px solid ${this.border}`;
            }
            return `
                background-color: ${this.bgColor};
                color: ${this.color};
                ${this.borderStyle}
            `;
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
