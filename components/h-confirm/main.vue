<template>
    <!-- 确认框：$confirm / $alert / $prompt 的弹窗本体。
         选项做成 data 而不是 props：beforeClose 里可以直接改 instance.confirmButtonText 等字段，即时生效 -->
    <h-dialog
        :visible="visible"
        :title="title"
        :width="width"
        :scroll="false"
        :z-index="zIndex"
        :show-close="showClose"
        :close-on-click-modal="closeOnClickModal"
        :close-on-press-escape="closeOnPressEscape"
        :custom-class="['h-confirm', customClass]"
        role="alertdialog"
        @close="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
        @closed="$emit('closed')">
        <div class="h-confirm__body">
            <svg
                v-if="iconType"
                class="h-confirm__icon"
                :class="`h-confirm__icon--${iconType}`"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <template v-if="iconType === 'warning'">
                    <path d="M12 3.5 21 19.5H3Z" />
                    <path d="M12 10v4.5" />
                    <circle cx="12" cy="17" r="0.6" />
                </template>
                <template v-else>
                    <circle cx="12" cy="12" r="9" />
                    <path v-if="iconType === 'success'" d="M8 12.5 11 15.5 16.5 9.5" />
                    <path v-else-if="iconType === 'danger'" d="M9 9l6 6M15 9l-6 6" />
                    <template v-else>
                        <path d="M12 11v5.5" />
                        <circle cx="12" cy="7.8" r="0.6" />
                    </template>
                </template>
            </svg>
            <div class="h-confirm__content">
                <div v-if="dangerouslyUseHTMLString" class="h-confirm__message" v-html="message"></div>
                <div v-else class="h-confirm__message">{{ message }}</div>
                <div v-if="showInput" class="h-confirm__input">
                    <h-input
                        ref="input"
                        v-model="inputValue"
                        size="small"
                        :type="inputType"
                        :placeholder="inputPlaceholder"
                        @enter-press="handleAction('confirm')" />
                    <div v-if="editorErrorMessage" class="h-confirm__error">{{ editorErrorMessage }}</div>
                </div>
            </div>
        </div>
        <template #foot>
            <h-button v-if="showCancelButton" size="small" plain @click="handleAction('cancel')">
                {{ cancelButtonText }}
            </h-button>
            <h-button
                v-if="showConfirmButton"
                size="small"
                :type="confirmType"
                :loading="confirmButtonLoading"
                :autofocus="!showInput"
                @click="handleAction('confirm')">
                {{ confirmButtonText }}
            </h-button>
        </template>
    </h-dialog>
</template>

<script>
import HDialog from '../h-dialog/main.vue';
import HButton from '../h-button/main.vue';
import HInput from '../h-input/main.vue';

const ICON_TYPES = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger',
    danger: 'danger'
};

export default {
    name: 'h-confirm',
    components: {
        HDialog,
        HButton,
        HInput
    },
    data() {
        return {
            visible: false,
            settled: false,
            confirmButtonLoading: false,
            editorErrorMessage: '',
            title: '提示',
            message: '',
            type: '',
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: '',
            showConfirmButton: true,
            showCancelButton: true,
            showClose: true,
            closeOnClickModal: true,
            closeOnPressEscape: true,
            distinguishCancelAndClose: false,
            dangerouslyUseHTMLString: false,
            customClass: '',
            width: 420,
            zIndex: 5000,
            beforeClose: null,
            showInput: false,
            inputValue: '',
            inputType: 'text',
            inputPlaceholder: '',
            inputPattern: null,
            inputValidator: null,
            inputErrorMessage: ''
        };
    },
    computed: {
        iconType() {
            return ICON_TYPES[this.type] || '';
        },
        confirmType() {
            return this.confirmButtonType || (this.type === 'danger' ? 'danger' : 'primary');
        }
    },
    watch: {
        visible(value) {
            if (value && this.showInput) {
                // 赶在 h-dialog 把焦点放到面板上之前，先聚焦输入框
                this.$nextTick(() => {
                    const input = this.$refs.input && this.$refs.input.$el.querySelector('input');
                    if (input) input.focus();
                });
            }
        }
    },
    methods: {
        validate() {
            if (!this.showInput) return true;
            const value = this.inputValue;
            let message = '';
            if (this.inputPattern && !this.inputPattern.test(value || '')) {
                message = this.inputErrorMessage || '输入的数据不合法!';
            } else if (typeof this.inputValidator === 'function') {
                const result = this.inputValidator(value);
                if (result === false) message = this.inputErrorMessage || '输入的数据不合法!';
                if (typeof result === 'string') message = result;
            }
            this.editorErrorMessage = message;
            return !message;
        },
        handleAction(action) {
            if (this.settled) return;
            if (action === 'confirm' && !this.validate()) return;
            const done = () => this.close(action);
            if (typeof this.beforeClose !== 'function') {
                done();
                return;
            }
            // beforeClose(action, instance, done)：调用 done 才关；返回 Promise 时 resolve 才关，确认按钮转圈
            const result = this.beforeClose(action, this, done);
            if (result && typeof result.then === 'function') {
                if (action === 'confirm') this.confirmButtonLoading = true;
                result.then(done, () => {
                    this.confirmButtonLoading = false;
                });
            }
        },
        close(action) {
            if (this.settled) return;
            this.settled = true;
            this.confirmButtonLoading = false;
            this.visible = false;
            this.$emit('action', action);
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
