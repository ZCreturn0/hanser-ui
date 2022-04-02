<template>
    <!-- 输入框 -->
    <div class="h-input" :size="size" :round="round">
        <div class="preffix">
            <slot name="preffix" class="preffix" />
        </div>
        <input
            :class="{ 'h-input__inner': true, 'show-suffix': !!$slots.suffix, 'show-preffix': !!$slots.preffix, 'show-maxlength': maxlength }"
            :style="inputStyle"
            :type="type"
            :value="value"
            :disabled="disabled"
            :maxlength="maxlength"
            :placeholder="placeholder"
            @keydown="keydown"
            @keyup="keyup"
            @keypress="keypress"
            @keypress.enter="enterPress"
            @blur="blur"
            @input="input" />
        <!-- maxlength 与 suffix 不能共存，maxlength 优先级高 -->
        <div class="suffix" v-if="!maxlength">
            <slot name="suffix" />
        </div>
        <div v-if="maxlength" class="words-counter">
            {{ words }}/{{ maxlength }}
        </div>
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
        disabled: {
            type: Boolean,
            default: false
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
        },
        maxlength: {
            type: Number | '',
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
            let bgColor = this.bgColor;
            let color = this.color;
            if (this.disabled) {
                bgColor = '#ccc';
                color = '#909090';
            }
            return `
                background-color: ${bgColor};
                color: ${color};
                ${this.borderStyle}
            `;
        },
        words() {
            return this.value.length;
        }
    },
    methods: {
        input($event) {
            this.$emit('input', $event.target.value);
        },
        keydown($event) {
            this.$emit('keydown', $event.target.value);
        },
        keyup($event) {
            this.$emit('keyup', $event.target.value);
        },
        keypress($event) {
            this.$emit('keypress', $event.target.value);
        },
        enterPress($event) {
            this.$emit('enter-press', $event.target.value);
        },
        blur($event) {
            this.$emit('blur', $event.target.value);
        }
    }
}
</script>

<style scoped>

@import './index.css';

</style>
