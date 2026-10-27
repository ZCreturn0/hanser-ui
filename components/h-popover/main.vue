<template>
    <span class="h-popover" :class="{ 'h-popover--disabled': disabled, 'h-popover--detached': !hasTrigger() }">
        <span
            ref="reference"
            class="h-popover__reference"
            v-bind="referenceAttrs()"
            @click="handleReferenceClick"
            @mouseenter="handleReferenceMouseenter"
            @mouseleave="handleReferenceMouseleave"
            @focusin="handleReferenceFocusin"
            @focusout="handleReferenceFocusout">
            <slot name="reference" />
        </span>
        <transition :name="transition" @after-enter="$emit('after-enter')" @after-leave="handleAfterLeave">
            <!-- destroy-on-close 时面板随开关增删，里面的内容每次重建；否则面板一直留着，只切显示 -->
            <div
                v-if="destroyOnClose && isVisible"
                ref="panel"
                class="h-popover__panel"
                :class="panelClass"
                :style="panelStyle"
                v-bind="panelAttrs"
                v-on="panelListeners">
                <slot />
                <span v-if="visibleArrow" ref="arrow" class="h-popover__arrow" data-popper-arrow></span>
            </div>
            <div
                v-else-if="!destroyOnClose"
                v-show="isVisible"
                ref="panel"
                class="h-popover__panel"
                :class="panelClass"
                :style="panelStyle"
                v-bind="panelAttrs"
                v-on="panelListeners">
                <slot />
                <span v-if="visibleArrow" ref="arrow" class="h-popover__arrow" data-popper-arrow></span>
            </div>
        </transition>
    </span>
</template>

<script>
import { createPopper } from '@popperjs/core';

const validTriggers = ['click', 'hover', 'manual'];

// 旧浏览器的 key 是 'Esc'
function isEscapeKey(event) {
    return event.key === 'Escape' || event.key === 'Esc';
}

// 输入法组字时的 Esc 是取消候选词；Safari 组字时 isComposing 不可靠，要再看 keyCode 229
function isComposing(event) {
    return event.isComposing || event.keyCode === 229;
}

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
        closeOnPressEscape: {
            type: Boolean,
            default: true
        },
        closeOnContentClick: {
            type: Boolean,
            default: false
        },
        visibleArrow: {
            type: Boolean,
            default: false
        },
        popperClass: {
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
        },
        // 不传时锚在插槽里的触发元素上；传了就锚在它上面，还没有参照物时传 null 也算传了，外层照样不占位
        reference: {
            default: undefined,
            validator: (value) =>
                value === null ||
                (typeof value === 'object' && (typeof value.getBoundingClientRect === 'function' || 'top' in value))
        },
        // 内容要每次打开都从头初始化时用：关上连面板带内容一起销毁
        destroyOnClose: {
            type: Boolean,
            default: false
        },
        transition: {
            type: String,
            default: 'h-popover-fade'
        },
        // 默认不开：悬停提示、操作菜单打开时焦点留在原处
        autofocus: {
            type: Boolean,
            default: false
        },
        // 不传时跟着 autofocus 走：焦点移进去了，关上就该还回来
        returnFocus: {
            type: Boolean,
            default: undefined
        },
        ariaLabel: {
            type: String,
            default: ''
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
        // 传了 reference（哪怕暂时是 null）就锚在外部参照物上
        isExternal() {
            return this.reference !== undefined;
        },
        popoverId() {
            return `h-popover-${this._uid}`;
        },
        ariaHaspopup() {
            return this.role === 'tooltip' ? null : this.role;
        },
        shouldReturnFocus() {
            return this.returnFocus !== undefined ? this.returnFocus : this.autofocus;
        },
        panelClass() {
            return [this.popperClass, { 'h-popover__panel--fixed': this.isExternal }];
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
        },
        // 面板能接住焦点才给 tabindex，免得改变不移焦点的气泡里点空白处的焦点去向
        panelAttrs() {
            return {
                id: this.popoverId,
                role: this.role,
                'aria-label': this.ariaLabel || null,
                tabindex: this.autofocus ? -1 : null
            };
        },
        panelListeners() {
            return {
                click: this.handlePanelClick,
                mouseenter: this.handlePanelMouseenter,
                mouseleave: this.handlePanelMouseleave,
                focusin: this.handlePanelMouseenter,
                focusout: this.handlePanelMouseleave,
                keydown: this.handlePanelKeydown
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
        visibleArrow() {
            this.recreatePopper();
        },
        reference() {
            this.recreatePopper();
        }
    },
    created() {
        // 只在内部用，不放进 data，免得变成响应式
        this.closeReason = '';
        this.focusBeforeOpen = null;
        this.resizeObserver = null;
        this.followBound = false;
    },
    mounted() {
        this.moveToBody();
        if (this.isVisible) {
            this.handleVisibilityChange(true);
        }
    },
    beforeDestroy() {
        this.clearTimers();
        this.removeDocumentListeners();
        this.unfollowReference();
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
        // 只靠外部参照物定位、插槽里又没放触发元素时，触发层是空的：不占位，也不挂读屏属性
        hasTrigger() {
            return !this.isExternal || Boolean(this.$slots.reference);
        },
        referenceAttrs() {
            if (!this.hasTrigger()) return {};
            return {
                'aria-controls': this.popoverId,
                'aria-describedby': this.role === 'tooltip' && this.isVisible ? this.popoverId : null,
                'aria-expanded': String(this.isVisible),
                'aria-haspopup': this.ariaHaspopup
            };
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
        // 焦点在面板里：只关自己并截住这次 Esc，开在弹窗、抽屉里时外层不跟着关
        handlePanelKeydown(event) {
            if (!isEscapeKey(event) || isComposing(event) || !this.closeOnPressEscape || !this.isVisible) return;
            event.stopPropagation();
            event.preventDefault();
            this.closeReason = 'escape';
            this.hide();
        },
        handleVisibilityChange(value) {
            this.clearTimers();
            if (value) {
                this.closeReason = '';
                this.focusBeforeOpen = document.activeElement;
                this.addDocumentListeners();
                this.$nextTick(() => {
                    if (!this.isVisible) return;
                    this.openPopper();
                    this.focusOnOpen();
                    this.$emit('show');
                });
            } else {
                const before = this.focusBeforeOpen;
                this.focusBeforeOpen = null;
                this.removeDocumentListeners();
                this.unfollowReference();
                if (this.shouldReturnFocus && this.closeReason !== 'outside') {
                    this.restoreFocus(this.$refs.panel, before);
                }
                this.$emit('hide');
            }
        },
        handleAfterLeave(el) {
            if (this.isVisible) {
                // destroy-on-close 时淡出中又打开，旧面板会被新面板顶掉，它的 popper 跟着收
                const instance = this.popperInstance;
                if (instance && instance.state.elements.popper === el && el !== this.$refs.panel) this.destroyPopper();
                return;
            }
            this.destroyPopper();
            this.$emit('after-leave');
        },
        handleDocumentPointerdown(event) {
            if (!this.closeOnOutside || !this.isVisible) return;
            const reference = this.$refs.reference;
            const panel = this.$refs.panel;
            if ((reference && reference.contains(event.target)) || (panel && panel.contains(event.target))) return;
            if (this.reference instanceof Element && this.reference.contains(event.target)) return;
            this.closeReason = 'outside';
            this.hide();
        },
        // 焦点不在面板里：页面上按 Esc 也关，鼠标点开的菜单焦点多半还在 body 上；里面已经拦下的不关
        handleDocumentKeydown(event) {
            if (!isEscapeKey(event) || isComposing(event) || event.defaultPrevented) return;
            if (!this.closeOnPressEscape || !this.isVisible) return;
            this.closeReason = 'escape';
            this.hide();
        },
        // Esc 挂在 html 上且不拦默认动作：先于 document 上的弹窗、抽屉跑完又不影响它们，开在里面时照旧一起关
        addDocumentListeners() {
            document.addEventListener('mousedown', this.handleDocumentPointerdown, true);
            document.addEventListener('touchstart', this.handleDocumentPointerdown, true);
            document.documentElement.addEventListener('keydown', this.handleDocumentKeydown);
        },
        removeDocumentListeners() {
            document.removeEventListener('mousedown', this.handleDocumentPointerdown, true);
            document.removeEventListener('touchstart', this.handleDocumentPointerdown, true);
            document.documentElement.removeEventListener('keydown', this.handleDocumentKeydown);
        },
        // 打开、换参照物、改位置参数都走这里，重复调用没有副作用
        openPopper() {
            this.moveToBody();
            this.createPopper();
            this.followReference();
            this.updatePosition();
        },
        // 挪到 body 会把面板里所有滚动位置清零（比如开场就滚到选中项的时间列），挪完照原样滚回去；藏着的面板不用量
        moveToBody() {
            const panel = this.$refs.panel;
            if (!this.appendToBody || !panel || panel.parentNode === document.body) return;
            const kept = this.isVisible
                ? Array.from(panel.querySelectorAll('*'))
                    .filter((node) => node.scrollTop || node.scrollLeft)
                    .map((node) => [node, node.scrollTop, node.scrollLeft])
                : [];
            document.body.appendChild(panel);
            kept.forEach(([node, top, left]) => {
                node.scrollTop = top;
                node.scrollLeft = left;
            });
        },
        createPopper() {
            const panel = this.$refs.panel;
            if (!this.$refs.reference || !panel) return;
            if (this.popperInstance) {
                if (this.popperInstance.state.elements.popper === panel) return;
                this.destroyPopper();
            }
            if (this.isExternal && !this.reference) return;
            const reference = this.isExternal ? this.virtualReference() : this.referenceElement();
            this.popperInstance = createPopper(reference, panel, this.popperOptions());
        },
        // 两种锚法都交给 popper 翻转、收进视口，离视口边 8px；位置一律不写 transform，自定义过渡要用它
        popperOptions() {
            const external = this.isExternal;
            const modifiers = [
                { name: 'offset', options: { offset: [0, this.offset] } },
                // 外部参照物首选那侧只要放得下就不翻，离视口边不够 8px 的部分由下面收进视口时让出来
                { name: 'flip', options: { padding: external ? 0 : 8 } },
                // altAxis：上下都放不下时也收进视口，不然会伸出视口。外部参照物被滚出视口时面板停在视口边上，不跟着出去
                { name: 'preventOverflow', options: { padding: 8, altAxis: true, tether: !external } },
                {
                    name: 'computeStyles',
                    // 外部参照物的坐标原样写成 left/top、不取整：改从右下角起算要用可视视口的尺寸，页面被双指缩放时会偏
                    options: external
                        ? { gpuAcceleration: false, adaptive: false, roundOffsets: false }
                        : { gpuAcceleration: false }
                }
            ];
            if (this.visibleArrow) {
                modifiers.push({
                    name: 'arrow',
                    options: { element: this.$refs.arrow, padding: 8 }
                });
            }
            if (!external) {
                return { placement: this.placement, modifiers };
            }
            // 外部参照物按视口定位，滚动、缩放时的跟随交给 followReference
            modifiers.push({ name: 'eventListeners', enabled: false });
            return { placement: this.placement, strategy: 'fixed', modifiers };
        },
        // 锚在插槽里用户实际点的那个元素上，而不是外面这层 span。插槽内容被绝对定位挪走时，
        // span 会塌成 0x0 留在原地，锚在它上面浮层就飞到别处去了（帖子楼层和消息气泡旁的 ⋮）
        referenceElement() {
            const wrapper = this.$refs.reference;
            return (wrapper && wrapper.firstElementChild) || wrapper;
        },
        // 不是元素时包成 popper 的虚拟元素、每次现读；只给四边的矩形补上宽高，popper 算位置要用
        virtualReference() {
            const reference = this.reference;
            if (reference instanceof Element) return reference;
            return {
                getBoundingClientRect() {
                    const rect =
                        typeof reference.getBoundingClientRect === 'function' ? reference.getBoundingClientRect() : reference;
                    const { top, right, bottom, left } = rect;
                    return { top, right, bottom, left, width: right - left, height: bottom - top, x: left, y: top };
                }
            };
        },
        // 还焦点、盯尺寸用的参照元素；外部参照物是矩形时没有
        anchorElement() {
            if (!this.isExternal) return this.referenceElement();
            return this.reference instanceof Element ? this.reference : null;
        },
        // 外部参照物的跟随照发帖框原来的做法：页面任何一处滚动、窗口缩放、面板或参照物（连同它所在的块）变尺寸都重新摆，关上就停
        followReference() {
            this.unfollowReference();
            const panel = this.$refs.panel;
            if (!this.isExternal || !this.isVisible || !panel) return;
            this.followBound = true;
            window.addEventListener('resize', this.updatePosition);
            window.addEventListener('scroll', this.updatePosition, true);
            if (typeof ResizeObserver === 'undefined') return;
            const anchor = this.anchorElement();
            this.resizeObserver = new ResizeObserver(() => this.updatePosition());
            this.resizeObserver.observe(panel);
            if (anchor) {
                this.resizeObserver.observe(anchor);
                if (anchor.offsetParent) this.resizeObserver.observe(anchor.offsetParent);
            }
        },
        unfollowReference() {
            if (!this.followBound) return;
            this.followBound = false;
            window.removeEventListener('resize', this.updatePosition);
            window.removeEventListener('scroll', this.updatePosition, true);
            if (this.resizeObserver) this.resizeObserver.disconnect();
            this.resizeObserver = null;
        },
        recreatePopper() {
            if (!this.isVisible) return;
            this.destroyPopper();
            this.$nextTick(() => this.openPopper());
        },
        updatePosition() {
            if (this.popperInstance) {
                return this.popperInstance.update();
            }
            return Promise.resolve();
        },
        // 先找带 autofocus 或 data-autofocus 的元素，没有就落在面板上；不滚页面
        focusOnOpen() {
            const panel = this.$refs.panel;
            if (!this.autofocus || !panel || panel.contains(document.activeElement)) return;
            const target = panel.querySelector('[autofocus], [data-autofocus]') || panel;
            target.focus({ preventScroll: true });
        },
        // 焦点还在面板里或已经丢到 body 才还，用户自己挪走的不管。还给打开前有焦点的元素，
        // 它不在了或本来就在 body 上才退到参照元素：参照物常是包着入口的外层，聚焦不了
        restoreFocus(panel, before) {
            const anchor = this.anchorElement();
            this.$nextTick(() => {
                const current = document.activeElement;
                const lost = !current || current === document.body || (panel && panel.contains(current));
                if (!lost) return;
                const usable =
                    before && before !== document.body && before.isConnected && !(panel && panel.contains(before));
                const target = usable ? before : anchor;
                if (target && target.isConnected) target.focus({ preventScroll: true });
            });
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
