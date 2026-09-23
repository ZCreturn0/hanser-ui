<template>
    <!-- 确认框：$confirm / $alert 的弹窗本体 -->
    <h-dialog
        :visible="visible"
        :title="title"
        :width="width"
        :scroll="false"
        :z-index="zIndex"
        :show-close="showClose"
        :close-on-overlay="closeOnOverlay"
        :close-on-escape="closeOnEscape"
        panel-class="h-confirm"
        @close="settle('close')"
        @closed="$emit('closed')">
        <div v-if="dangerouslyUseHTMLString" class="h-confirm__message" v-html="message"></div>
        <div v-else class="h-confirm__message">{{ message }}</div>
        <template #foot>
            <h-button v-if="showCancel" size="small" plain @click="settle('cancel')">{{ cancelButtonText }}</h-button>
            <h-button size="small" type="primary" autofocus @click="settle('confirm')">{{ confirmButtonText }}</h-button>
        </template>
    </h-dialog>
</template>

<script>
import HDialog from '../h-dialog/main.vue';
import HButton from '../h-button/main.vue';

export default {
    name: 'h-confirm',
    components: {
        HDialog,
        HButton
    },
    props: {
        message: {
            type: String,
            default: ''
        },
        title: {
            type: String,
            default: '提示'
        },
        confirmButtonText: {
            type: String,
            default: '确定'
        },
        cancelButtonText: {
            type: String,
            default: '取消'
        },
        showCancel: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        closeOnOverlay: {
            type: Boolean,
            default: true
        },
        closeOnEscape: {
            type: Boolean,
            default: true
        },
        dangerouslyUseHTMLString: {
            type: Boolean,
            default: false
        },
        width: {
            type: [Number, String],
            default: 420
        },
        zIndex: {
            type: [Number, String],
            default: 5000
        }
    },
    data() {
        return {
            visible: false,
            settled: false
        };
    },
    methods: {
        settle(action) {
            if (this.settled) return;
            this.settled = true;
            this.visible = false;
            this.$emit('action', action);
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
