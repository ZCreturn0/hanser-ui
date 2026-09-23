<template>
    <span class="h-popover" :class="{ 'h-popover--disabled': disabled }">
        <span
            ref="reference"
            class="h-popover__reference"
            :aria-controls="popoverId"
            :aria-describedby="role === 'tooltip' && isVisible ? popoverId : null"
            :aria-expanded="String(isVisible)"
            :aria-haspopup="ariaHaspopup"
            @click="handleReferenceClick"
            @mouseenter="handleReferenceMouseenter"
            @mouseleave="handleReferenceMouseleave"
            @focusin="handleReferenceFocusin"
            @focusout="handleReferenceFocusout">
            <slot name="reference" />
        </span>
        <transition name="h-popover-fade" @after-enter="$emit('after-show')" @after-leave="handleAfterLeave">
            <div
                v-show="isVisible"
                :id="popoverId"
                ref="panel"
                class="h-popover__panel"
                :class="panelClass"
                :style="panelStyle"
                :role="role"
                @click="handlePanelClick"
                @mouseenter="handlePanelMouseenter"
                @mouseleave="handlePanelMouseleave"
                @focusin="handlePanelMouseenter"
                @focusout="handlePanelMouseleave">
                <slot />
                <span v-if="showArrow" ref="arrow" class="h-popover__arrow" data-popper-arrow></span>
            </div>
        </transition>
    </span>
</template>

<script>
import { createPopper } from '@popperjs/core';

const validTriggers = ['click', 'hover', 'manual'];

export default {
    name: 'h-popover',
    props: {
        value: {
            type: Boolean,
            default: undefined
        },
        visible: {
            type: Boolean,
            default: undefined
        },
        trigger: {
            type: String,
            default: 'click',
            validator(value) {
                return validTriggers.indexOf(value) > -1;
            }
        },
        placement: {
            type: String,
            default: 'bottom'
        },
        width: {
            type: [Number, String],
            default: null
        },
        minWidth: {
            type: [Number, String],
            default: 120
        },
        offset: {
            type: Number,
            default: 8
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        closeOnOutside: {
            type: Boolean,
            default: true
        },
        closeOnEscape: {
            type: Boolean,
            default: true
        },
        closeOnContentClick: {
            type: Boolean,
            default: false
        },
        showArrow: {
            type: Boolean,
            default: false
        },
        panelClass: {
            type: [String, Array, Object],
            default: ''
        },
        openDelay: {
            type: Number,
            default: 0
        },
        closeDelay: {
            type: Number,
            default: 100
        },
        zIndex: {
            type: [Number, String],
            default: 4000
        },
        role: {
            type: String,
            default: 'tooltip'
        }
    },
    data() {
        const initialValue = this.visible !== undefined ? this.visible : this.value;
        return {
            innerVisible: Boolean(initialValue),
            popperInstance: null,
            showTimer: null,
            hideTimer: null
        };
    },
    computed: {
        isVisible() {
            if (this.visible !== undefined) return this.visible;
            if (this.value !== undefined) return this.value;
            return this.innerVisible;
        },
        popoverId() {
            return `h-popover-${this._uid}`;
        },
        ariaHaspopup() {
            return this.role === 'tooltip' ? null : this.role;
        },
        panelStyle() {
            const width = this.toCssSize(this.width);
            const minWidth = this.toCssSize(this.width !== null ? this.width : this.minWidth);
            const zIndex = typeof this.zIndex === 'number' ? String(this.zIndex) : this.zIndex;
            return {
                width,
                minWidth,
                zIndex
            };
        }
    },
    watch: {
        isVisible(value, previousValue) {
            if (value === previousValue) return;
            this.handleVisibilityChange(value);
        },
        disabled(value) {
            if (value) this.hide();
        },
        placement() {
            this.recreatePopper();
        },
        offset() {
            this.recreatePopper();
        },
        showArrow() {
            this.recreatePopper();
        }
    },
    mounted() {
        if (this.appendToBody) {
            document.body.appendChild(this.$refs.panel);
        }
        if (this.isVisible) {
            this.handleVisibilityChange(true);
        }
    },
    beforeDestroy() {
        this.clearTimers();
        this.removeDocumentListeners();
        this.destroyPopper();
        if (this.appendToBody) {
            const panel = this.$refs.panel;
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
        }
    },
    methods: {
        toCssSize(value) {
            if (value === null || value === undefined || value === '') return null;
            if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) {
                return `${value}px`;
            }
            return value;
        },
        setVisible(value) {
            if (value && this.disabled) return;
            if (this.isVisible === value) return;
            if (this.visible === undefined && this.value === undefined) {
                this.innerVisible = value;
            }
            this.$emit('input', value);
            this.$emit('update:visible', value);
        },
        show() {
            this.clearHideTimer();
            this.setVisible(true);
        },
        hide() {
            this.clearShowTimer();
            this.setVisible(false);
        },
        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        },
        scheduleShow() {
            this.clearHideTimer();
            this.clearShowTimer();
            this.showTimer = window.setTimeout(() => this.show(), this.openDelay);
        },
        scheduleHide() {
            this.clearShowTimer();
            this.clearHideTimer();
            this.hideTimer = window.setTimeout(() => this.hide(), this.closeDelay);
        },
        clearShowTimer() {
            if (this.showTimer !== null) {
                window.clearTimeout(this.showTimer);
                this.showTimer = null;
            }
        },
        clearHideTimer() {
            if (this.hideTimer !== null) {
                window.clearTimeout(this.hideTimer);
                this.hideTimer = null;
            }
        },
        clearTimers() {
            this.clearShowTimer();
            this.clearHideTimer();
        },
        handleReferenceClick() {
            if (this.trigger === 'click') this.toggle();
        },
        handleReferenceMouseenter() {
            if (this.trigger === 'hover') this.scheduleShow();
        },
        handleReferenceMouseleave() {
            if (this.trigger === 'hover') this.scheduleHide();
        },
        handleReferenceFocusin() {
            if (this.trigger === 'hover') this.scheduleShow();
        },
        handleReferenceFocusout() {
            if (this.trigger === 'hover') this.scheduleHide();
        },
        handlePanelMouseenter() {
            if (this.trigger === 'hover') this.clearHideTimer();
        },
        handlePanelClick() {
            if (this.trigger === 'click' && this.closeOnContentClick) {
                this.hide();
            }
        },
        handlePanelMouseleave() {
            if (this.trigger === 'hover') this.scheduleHide();
        },
        handleVisibilityChange(value) {
            this.clearTimers();
            if (value) {
                this.addDocumentListeners();
                this.$nextTick(() => {
                    if (!this.isVisible) return;
                    this.createPopper();
                    this.updatePosition();
                    this.$emit('show');
                });
            } else {
                this.removeDocumentListeners();
                this.$emit('hide');
            }
        },
        handleAfterLeave() {
            if (this.isVisible) return;
            this.destroyPopper();
            this.$emit('after-hide');
        },
        handleDocumentPointerdown(event) {
            if (!this.closeOnOutside || !this.isVisible) return;
            const reference = this.$refs.reference;
            const panel = this.$refs.panel;
            if ((reference && reference.contains(event.target)) || (panel && panel.contains(event.target))) return;
            this.hide();
        },
        handleDocumentKeydown(event) {
            if (event.key === 'Escape' && this.closeOnEscape && this.isVisible) {
                event.preventDefault();
                this.hide();
            }
        },
        addDocumentListeners() {
            document.addEventListener('mousedown', this.handleDocumentPointerdown, true);
            document.addEventListener('touchstart', this.handleDocumentPointerdown, true);
            document.addEventListener('keydown', this.handleDocumentKeydown);
        },
        removeDocumentListeners() {
            document.removeEventListener('mousedown', this.handleDocumentPointerdown, true);
            document.removeEventListener('touchstart', this.handleDocumentPointerdown, true);
            document.removeEventListener('keydown', this.handleDocumentKeydown);
        },
        createPopper() {
            if (this.popperInstance || !this.$refs.reference || !this.$refs.panel) return;
            const modifiers = [
                {
                    name: 'offset',
                    options: { offset: [0, this.offset] }
                },
                {
                    name: 'preventOverflow',
                    options: { padding: 8 }
                },
                {
                    name: 'flip',
                    options: { padding: 8 }
                }
            ];
            if (this.showArrow) {
                modifiers.push({
                    name: 'arrow',
                    options: { element: this.$refs.arrow, padding: 8 }
                });
            }
            this.popperInstance = createPopper(this.$refs.reference, this.$refs.panel, {
                placement: this.placement,
                modifiers
            });
        },
        recreatePopper() {
            if (!this.isVisible) return;
            this.destroyPopper();
            this.$nextTick(() => {
                this.createPopper();
                this.updatePosition();
            });
        },
        updatePosition() {
            if (this.popperInstance) {
                return this.popperInstance.update();
            }
            return Promise.resolve();
        },
        focusPanel(selector, options = { preventScroll: true }) {
            const panel = this.$refs.panel;
            const target = selector && panel ? panel.querySelector(selector) : panel;
            if (!target || typeof target.focus !== 'function') return false;
            target.focus(options);
            return true;
        },
        destroyPopper() {
            if (!this.popperInstance) return;
            this.popperInstance.destroy();
            this.popperInstance = null;
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
