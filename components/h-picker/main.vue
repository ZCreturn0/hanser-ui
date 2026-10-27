<template>
    <!-- 滚轮选择：几列并排，中间那条底色是选中位，停下时吸到最近的可选项 -->
    <div class="h-picker" :style="rootStyle">
        <div class="h-picker__band" :style="{ top: pad + 'px' }"></div>
        <template v-for="(column, ci) in columns">
            <div
                :key="'column' + ci"
                ref="column"
                class="h-picker__column"
                :style="{ flex: columnFlex[ci] || 1, padding: pad + 'px 0' }"
                tabindex="0"
                role="spinbutton"
                aria-valuemin="0"
                :aria-valuemax="column.length - 1"
                :aria-valuenow="indexes[ci]"
                :aria-valuetext="column[indexes[ci]] ? column[indexes[ci]].label : null"
                @scroll.passive="onScroll(ci)"
                @touchstart.passive="onTouch(ci, true)"
                @touchend.passive="onTouch(ci, false)"
                @touchcancel.passive="onTouch(ci, false)"
                @keydown="onKeydown($event, ci)">
                <!-- 选项全量渲染：只渲染可视附近的项时，快速甩动的落点算不到还没渲染的项上，会停在半路 -->
                <div
                    v-for="(item, i) in column"
                    :key="i"
                    class="h-picker__item"
                    :class="{
                        'h-picker__item--selected': i === indexes[ci],
                        'h-picker__item--disabled': item.disabled
                    }"
                    aria-hidden="true"
                    @click="scrollToIndex(ci, i, true)">
                    {{ item.label }}
                </div>
            </div>
            <slot v-if="ci < columns.length - 1" name="divider" :index="ci" />
        </template>
    </div>
</template>

<script>
// 停止滚动多久算停下
const SETTLE_DELAY = 110;

export default {
    name: 'h-picker',
    props: {
        // 每列一组选项：[[{ label, value, disabled }]]
        columns: {
            type: Array,
            default: () => []
        },
        // 每列选中项的 value，支持 v-model
        value: {
            type: Array,
            default: () => []
        },
        itemHeight: {
            type: Number,
            default: 44
        },
        // 一屏露出几项：选中项总在正中，双数时上下边缘各露出半项
        visibleItemCount: {
            type: Number,
            default: 6
        },
        // 各列宽度的比例，不给就等分
        columnFlex: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        // 首尾各留这么高的空白，第一项和最后一项也能滚到正中
        pad() {
            return ((this.visibleItemCount - 1) / 2) * this.itemHeight;
        },
        rootStyle() {
            return {
                height: this.itemHeight * this.visibleItemCount + 'px',
                '--h-picker-item-height': this.itemHeight + 'px'
            };
        },
        indexes() {
            return this.columns.map((column, ci) =>
                Math.max(
                    0,
                    column.findIndex((item) => item.value === this.value[ci])
                )
            );
        }
    },
    watch: {
        // 外面改了选中项，或者选项增减让选中项挪了位置，都要滚过去
        indexes(next, prev) {
            if (String(next) !== String(prev)) this.$nextTick(() => this.sync(true));
        }
    },
    created() {
        // 计时器和按住状态只在事件里用，不需要响应式
        this.timers = [];
        this.touching = [];
        this.thawFrame = 0;
    },
    mounted() {
        this.sync(false);
    },
    beforeDestroy() {
        this.timers.forEach((timer) => clearTimeout(timer));
        cancelAnimationFrame(this.thawFrame);
    },
    methods: {
        sync(smooth) {
            this.columns.forEach((column, ci) => {
                // 手指还按着的那列不抢，松手后会自己停到位
                if (!this.touching[ci]) this.scrollToIndex(ci, this.indexes[ci], smooth);
            });
        },
        scrollToIndex(ci, index, smooth) {
            const el = this.$refs.column && this.$refs.column[ci];
            if (!el) return;
            const top = index * this.itemHeight;
            if (Math.abs(el.scrollTop - top) > 1) el.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
        },
        onScroll(ci) {
            clearTimeout(this.timers[ci]);
            this.timers[ci] = setTimeout(() => this.settle(ci), SETTLE_DELAY);
        },
        onTouch(ci, down) {
            this.touching[ci] = down;
            // 松手时没有惯性滚动就不会再有滚动事件，这里补一次
            if (down) clearTimeout(this.timers[ci]);
            else this.onScroll(ci);
        },
        settle(ci) {
            const el = this.$refs.column && this.$refs.column[ci];
            if (!el || this.touching[ci]) return;
            const index = this.nearest(ci, Math.round(el.scrollTop / this.itemHeight));
            if (index < 0) return;
            this.pick(ci, index);
            // 外面没采纳（比如超出范围被拉回）时，滚回实际选中的那项
            this.$nextTick(() => this.scrollToIndex(ci, this.indexes[ci], true));
        },
        // 落在不可选的项上：从近到远找，同样近时先往后
        nearest(ci, index) {
            const column = this.columns[ci];
            const at = Math.max(0, Math.min(column.length - 1, index));
            for (let k = 0; k < column.length; k++) {
                if (at + k < column.length && !column[at + k].disabled) return at + k;
                if (at - k >= 0 && !column[at - k].disabled) return at - k;
            }
            return -1;
        },
        // 惯性没停时点确定，等停下再发 change 就晚了：立刻停住，按当前位置落定各列
        confirm() {
            let values = this.columns.map((column, ci) => this.value[ci]);
            const els = this.$refs.column || [];
            this.columns.forEach((column, ci) => {
                const el = els[ci];
                if (!el) return;
                clearTimeout(this.timers[ci]);
                // 惯性滚动没有接口能叫停，临时禁止滚动能打断它
                el.style.overflowY = 'hidden';
                const item = column[this.nearest(ci, Math.round(el.scrollTop / this.itemHeight))];
                if (!item || item.value === values[ci]) return;
                // 多列一起落定时，后一列要带上前一列刚定的值，不能等外面把 value 传回来
                values = values.map((value, k) => (k === ci ? item.value : value));
                this.$emit('input', values);
                this.$emit('change', values, ci);
            });
            // 隔一帧再放开：同一帧里放开，浏览器还没处理到禁止滚动，惯性不会断
            cancelAnimationFrame(this.thawFrame);
            this.thawFrame = requestAnimationFrame(() => {
                this.thawFrame = requestAnimationFrame(() => {
                    els.forEach((el) => {
                        el.style.overflowY = '';
                    });
                });
            });
            // 停住的位置可能在两项之间，吸到选中项上
            this.$nextTick(() => this.sync(false));
        },
        pick(ci, index) {
            const item = this.columns[ci][index];
            if (!item || item.value === this.value[ci]) return;
            const values = this.columns.map((column, k) => (k === ci ? item.value : this.value[k]));
            this.$emit('input', values);
            this.$emit('change', values, ci);
        },
        // 上下方向键在可选项之间挪一格
        onKeydown(event, ci) {
            const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
            if (!step) return;
            event.preventDefault();
            const column = this.columns[ci];
            for (let i = this.indexes[ci] + step; i >= 0 && i < column.length; i += step) {
                if (!column[i].disabled) {
                    this.pick(ci, i);
                    return;
                }
            }
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
