<template>
    <!-- 底部抽屉。外层留在原处只占位，真正的弹层挂到 body：父组件在它前面插节点时还能找到参照位置 -->
    <div class="h-drawer">
        <transition name="h-drawer" appear @enter="onEnter" @after-enter="onAfterEnter" @after-leave="$emit('closed')">
            <div
                v-if="visible"
                ref="mask"
                class="h-drawer__mask"
                :class="`h-drawer__mask--${direction}`"
                :style="{ zIndex }"
                @mousedown.self.prevent="onMaskDown"
                @touchmove.self.prevent>
                <div
                    ref="panel"
                    class="h-drawer__panel"
                    role="dialog"
                    aria-modal="true"
                    :aria-label="ariaLabel || null"
                    :aria-labelledby="!ariaLabel && (title || $slots.head) ? headId : null"
                    tabindex="-1">
                    <div v-if="title || $slots.head" :id="headId" class="h-drawer__head">
                        <slot name="head">
                            <span class="h-drawer__title">{{ title }}</span>
                        </slot>
                    </div>
                    <div class="h-drawer__body">
                        <slot />
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
// 叠着开的抽屉只让最上面那个响应键盘
const openedStack = [];
const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

const isShown = (el) => el.isConnected && el.getClientRects().length > 0;
// 从近到远记下入口外面的各层，入口被换掉时好退到原来那片区域里；body 太大不算
function areasOf(el) {
    const areas = [];
    for (let node = el && el.parentElement; node && node !== document.body; node = node.parentElement) {
        areas.push(node);
    }
    return areas;
}
function firstFocusable(areas) {
    for (const area of areas) {
        const el = area.isConnected && Array.from(area.querySelectorAll(focusableSelector)).find(isShown);
        if (el) return el;
    }
    return null;
}

// 锁滚动挂类名而不改行内样式，和别的弹窗各自记下的原值互不覆盖
const LOCK_CLASS = 'h-drawer-lock';
let lockCount = 0;
function lockBody() {
    if (lockCount++ === 0) document.body.classList.add(LOCK_CLASS);
}
function unlockBody() {
    if (lockCount > 0 && --lockCount === 0) document.body.classList.remove(LOCK_CLASS);
}

export default {
    name: 'h-drawer',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        // 别的方向还没有用处，先只做从底部弹出
        direction: {
            type: String,
            default: 'btt',
            validator: (value) => value === 'btt'
        },
        title: {
            type: String,
            default: ''
        },
        ariaLabel: {
            type: String,
            default: ''
        },
        closeOnClickModal: {
            type: Boolean,
            default: true
        },
        closeOnPressEscape: {
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
            default: 2200
        }
    },
    computed: {
        headId() {
            return `h-drawer-head-${this._uid}`;
        }
    },
    watch: {
        visible(value) {
            if (value) this.activate();
            else this.release(true);
        }
    },
    created() {
        this.active = false;
        this.locked = false;
        this.lastActive = null;
        this.lastAreas = [];
    },
    mounted() {
        if (this.visible) this.activate();
    },
    beforeDestroy() {
        this.release(false);
        // 挂到 body 上的那层不随父节点一起摘掉，得自己收
        const mask = this.$refs.mask;
        if (mask && mask.parentNode && mask.parentNode !== this.$el) mask.parentNode.removeChild(mask);
    },
    methods: {
        activate() {
            if (!this.active) {
                this.active = true;
                this.lastActive = document.activeElement;
                this.lastAreas = areasOf(this.lastActive);
                openedStack.push(this);
                document.addEventListener('keydown', this.onKeydown);
                if (this.lockScroll) {
                    lockBody();
                    this.locked = true;
                }
            }
            this.$emit('open');
        },
        release(restoreFocus) {
            if (!this.active) return;
            this.active = false;
            const index = openedStack.indexOf(this);
            if (index > -1) openedStack.splice(index, 1);
            document.removeEventListener('keydown', this.onKeydown);
            if (this.locked) {
                unlockBody();
                this.locked = false;
            }
            const back = this.lastActive;
            const areas = this.lastAreas;
            this.lastActive = null;
            this.lastAreas = [];
            if (!restoreFocus || !back || typeof back.focus !== 'function') return;
            const panel = this.$refs.panel;
            this.$nextTick(() => {
                const current = document.activeElement;
                // 关的同时焦点已被别处接走（比如校验没过聚焦到输入框），就不抢回来
                const lost = !current || current === document.body || (panel && panel.contains(current));
                if (!lost) return;
                // 入口在弹层开着时被换掉了（比如选了话题，入口变成标签），退到它原来那片区域里第一个能聚焦的
                const target = isShown(back) ? back : firstFocusable(areas);
                if (target) target.focus({ preventScroll: true });
            });
        },
        // close 只表示自己请求关闭，外面改 visible 不发，和弹窗同一个意思
        requestClose(reason) {
            this.$emit('update:visible', false);
            this.$emit('close', reason);
        },
        // 拦住按下的默认动作：不然焦点刚还回入口，又被这次按下挪到 body
        onMaskDown() {
            if (this.closeOnClickModal) this.requestClose('overlay');
        },
        // 挪到 body 会把里面所有滚动位置清零（滚轮、时间列开场已经滚到选中项），挪完照原样滚回去
        onEnter(el) {
            if (!this.appendToBody || el.parentNode === document.body) return;
            const kept = [...el.querySelectorAll('*')]
                .filter((node) => node.scrollTop || node.scrollLeft)
                .map((node) => [node, node.scrollTop, node.scrollLeft]);
            document.body.appendChild(el);
            kept.forEach(([node, top, left]) => {
                node.scrollTop = top;
                node.scrollLeft = left;
            });
        },
        onAfterEnter() {
            if (!this.visible) return;
            const panel = this.$refs.panel;
            if (panel && !panel.contains(document.activeElement)) {
                const target = panel.querySelector('[autofocus], [data-autofocus]') || panel;
                target.focus({ preventScroll: true });
            }
            this.$emit('opened');
        },
        onKeydown(event) {
            if (openedStack[openedStack.length - 1] !== this) return;
            const panel = this.$refs.panel;
            const target = event.target;
            // 焦点在从这里弹出的确认框这类别的层里时，键盘归那一层
            const owned =
                panel && (panel.contains(target) || target === document.body || target === document.documentElement);
            if (!owned) return;
            // 旧浏览器报的键名是 Esc；Safari 组字时 isComposing 不可靠，要靠 keyCode 229 认出来
            if (event.key === 'Escape' || event.key === 'Esc') {
                const composing = event.isComposing || event.keyCode === 229;
                if (!this.closeOnPressEscape || event.defaultPrevented || composing) return;
                event.preventDefault();
                this.requestClose('escape');
            } else if (event.key === 'Tab') {
                this.trapFocus(event, panel);
            }
        },
        trapFocus(event, panel) {
            const focusable = Array.from(panel.querySelectorAll(focusableSelector)).filter(
                (el) => el.getClientRects().length > 0
            );
            if (!focusable.length) {
                event.preventDefault();
                panel.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const current = document.activeElement;
            const outside = !panel.contains(current);
            if (event.shiftKey && (current === first || current === panel || outside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (current === last || outside)) {
                event.preventDefault();
                first.focus();
            }
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>

<style>
/* 锁滚动的类挂在 body 上，body 不在组件里，scoped 样式加不上，只能单独写成全局的 */
body.h-drawer-lock {
    overflow: hidden;
}
</style>
