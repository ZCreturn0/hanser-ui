<template>
    <div
        v-show="visible"
        ref="root"
        class="h-dialog"
        :style="rootStyle"
        @click.self="handleOverlayClick">
        <div
            ref="panel"
            class="h-dialog__panel"
            :class="panelClass"
            :style="panelStyle"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="hasLabel ? titleId : null"
            :aria-label="hasLabel ? null : ariaLabel"
            tabindex="-1">
            <div class="h-dialog__main">
                <div v-if="showHeader" class="h-dialog__head">
                    <div v-if="hasLabel" :id="titleId" class="h-dialog__head-content">
                        <slot name="head">
                            <span class="h-dialog__title">{{ title }}</span>
                        </slot>
                    </div>
                    <button
                        v-if="showClose"
                        type="button"
                        class="h-dialog__close"
                        aria-label="关闭"
                        @click="close"></button>
                </div>
                <div class="h-dialog__body" :class="[bodyClass, { 'h-dialog__body--scroll': scroll }]">
                    <slot />
                </div>
                <div v-if="$slots.foot" class="h-dialog__foot">
                    <slot name="foot" />
                </div>
            </div>
            <slot name="aside" />
        </div>
    </div>
</template>

<script>
const openedStack = [];
const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

let originalBodyOverflow = null;

export default {
    name: 'h-dialog',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        ariaLabel: {
            type: String,
            default: '弹窗'
        },
        width: {
            type: [Number, String],
            default: 480
        },
        scroll: {
            type: Boolean,
            default: true
        },
        maxHeight: {
            type: [Number, String],
            default: 'calc(100vh - 24px)'
        },
        closeOnOverlay: {
            type: Boolean,
            default: true
        },
        closeOnEscape: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        lockScroll: {
            type: Boolean,
            default: true
        },
        zIndex: {
            type: [Number, String],
            default: 3000
        },
        panelClass: {
            type: [String, Array, Object],
            default: ''
        },
        bodyClass: {
            type: [String, Array, Object],
            default: ''
        },
        row: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        hasLabel() {
            return Boolean(this.title || this.$slots.head);
        },
        showHeader() {
            return this.hasLabel || this.showClose;
        },
        titleId() {
            return `h-dialog-title-${this._uid}`;
        },
        rootStyle() {
            const zIndex = typeof this.zIndex === 'number' ? String(this.zIndex) : this.zIndex;
            return { zIndex };
        },
        panelStyle() {
            const width = this.toCssSize(this.width);
            const maxHeight = this.toCssSize(this.maxHeight);
            return {
                width,
                maxHeight,
                flexDirection: this.row ? 'row' : 'column'
            };
        }
    },
    watch: {
        visible(value) {
            if (value) {
                this.activate();
            } else {
                this.release();
            }
        }
    },
    mounted() {
        if (this.appendToBody) {
            document.body.appendChild(this.$refs.root);
        }
        document.addEventListener('keydown', this.handleKeydown);
        if (this.visible) {
            this.activate();
        }
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.handleKeydown);
        this.release(false);
        if (this.appendToBody) {
            const root = this.$refs.root;
            if (root && root.parentNode) {
                root.parentNode.removeChild(root);
            }
        }
    },
    methods: {
        toCssSize(value) {
            return typeof value === 'number' ? `${value}px` : value;
        },
        close() {
            this.$emit('update:visible', false);
            this.$emit('close');
        },
        handleOverlayClick() {
            if (this.closeOnOverlay) {
                this.close();
            }
        },
        handleKeydown(event) {
            if (!this.visible || openedStack[openedStack.length - 1] !== this) return;
            if (event.key === 'Escape' && this.closeOnEscape) {
                event.preventDefault();
                this.close();
            } else if (event.key === 'Tab') {
                this.trapFocus(event);
            }
        },
        trapFocus(event) {
            const panel = this.$refs.panel;
            if (!panel) return;
            const focusable = Array.from(panel.querySelectorAll(focusableSelector)).filter(
                (element) => element.getClientRects().length > 0
            );
            if (!focusable.length) {
                event.preventDefault();
                panel.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        },
        activate() {
            const currentIndex = openedStack.indexOf(this);
            if (currentIndex > -1) {
                openedStack.splice(currentIndex, 1);
            }
            openedStack.push(this);
            this.lastActiveElement = document.activeElement;

            if (this.appendToBody) {
                document.body.appendChild(this.$refs.root);
            }
            if (this.lockScroll && originalBodyOverflow === null) {
                originalBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
            }

            this.$nextTick(() => {
                const panel = this.$refs.panel;
                if (!panel || panel.contains(document.activeElement)) return;
                const autofocus = panel.querySelector('[autofocus]');
                (autofocus || panel).focus();
            });
        },
        release(restoreFocus = true) {
            const index = openedStack.indexOf(this);
            const wasTopmost = index === openedStack.length - 1;
            if (index > -1) {
                openedStack.splice(index, 1);
            }
            if (originalBodyOverflow !== null && !openedStack.some((dialog) => dialog.lockScroll)) {
                document.body.style.overflow = originalBodyOverflow;
                originalBodyOverflow = null;
            }
            const lastActiveElement = this.lastActiveElement;
            if (restoreFocus && wasTopmost && lastActiveElement && document.contains(lastActiveElement)) {
                this.$nextTick(() => lastActiveElement.focus());
            }
            this.lastActiveElement = null;
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
