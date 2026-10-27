<template>
    <!-- 月历：固定 6 行，可翻月；相邻那个月一天都选不了时，那边的翻页按钮隐去 -->
    <div class="h-calendar">
        <div class="h-calendar__head">
            <button type="button" class="h-calendar__nav" aria-label="上个月" :disabled="!prevOk" @click="shift(-1)">
                <svg class="h-calendar__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <span class="h-calendar__title">{{ title }}</span>
            <button type="button" class="h-calendar__nav" aria-label="下个月" :disabled="!nextOk" @click="shift(1)">
                <svg class="h-calendar__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
        </div>
        <div class="h-calendar__grid" @keydown="onKeydown">
            <span v-for="w in weekdays" :key="'w' + w" class="h-calendar__weekday">{{ w }}</span>
            <template v-for="(cell, i) in cells">
                <button
                    v-if="cell"
                    :key="i"
                    type="button"
                    class="h-calendar__day"
                    :class="{ 'h-calendar__day--today': cell.today, 'h-calendar__day--selected': cell.selected }"
                    :disabled="cell.disabled"
                    :data-day="cell.d"
                    :tabindex="cell.d === focusDay ? 0 : -1"
                    :aria-label="`${view.m + 1}月${cell.d}日`"
                    :aria-pressed="cell.selected"
                    :aria-current="cell.today ? 'date' : null"
                    @click="pick(cell.date)">
                    <span class="h-calendar__day-label">{{ cell.d }}</span>
                </button>
                <span v-else :key="i" class="h-calendar__blank"></span>
            </template>
        </div>
    </div>
</template>

<script>
const WEEK = '日一二三四五六';

const sameDay = (a, b) =>
    !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default {
    name: 'h-calendar',
    props: {
        // 选中的那天，只看年月日，支持 v-model
        value: {
            type: Date,
            default: null
        },
        // 传入某天，返回 true 表示这天不能选
        disabledDate: {
            type: Function,
            default: null
        },
        // 每周从周几开始，取 1 到 7、7 是周日，沿用通行写法；下面按 7 取余，周日不用单独算
        firstDayOfWeek: {
            type: Number,
            default: 7,
            validator: (value) => value >= 1 && value <= 7
        },
        // 哪天算今天：看的人不在本机时区（比如按别的时区展示）时由外面给
        today: {
            type: Date,
            default: () => new Date()
        }
    },
    data() {
        const at = this.value || this.today;
        return { view: { y: at.getFullYear(), m: at.getMonth() } };
    },
    computed: {
        weekdays() {
            return Array.from({ length: 7 }, (_, i) => WEEK[(i + this.firstDayOfWeek) % 7]);
        },
        // 不是今年才带年份
        title() {
            const { y, m } = this.view;
            return `${y !== this.today.getFullYear() ? y + ' 年 ' : ''}${m + 1} 月`;
        },
        cells() {
            const { y, m } = this.view;
            const lead = (new Date(y, m, 1).getDay() - this.firstDayOfWeek + 7) % 7;
            const count = new Date(y, m + 1, 0).getDate();
            // 固定排满 6 行，面板高度不随月份跳
            return Array.from({ length: 42 }, (_, i) => {
                const d = i - lead + 1;
                if (d < 1 || d > count) return null;
                const date = new Date(y, m, d);
                return {
                    d,
                    date,
                    today: sameDay(date, this.today),
                    selected: sameDay(date, this.value),
                    disabled: this.isDisabled(date)
                };
            });
        },
        prevOk() {
            return this.hasEnabled(this.view.y, this.view.m - 1);
        },
        nextOk() {
            return this.hasEnabled(this.view.y, this.view.m + 1);
        },
        // 方向键在格子间移动，Tab 只停一格：选中的那天，不在本月就是第一个能选的
        focusDay() {
            const days = this.cells.filter((cell) => cell && !cell.disabled);
            const selected = days.find((cell) => cell.selected);
            return (selected || days[0] || {}).d || 0;
        }
    },
    watch: {
        // 外面每次给新的选中日期都翻到那个月，用户翻走后改了别的也会回来
        value(date) {
            if (date) this.view = { y: date.getFullYear(), m: date.getMonth() };
        }
    },
    methods: {
        isDisabled(date) {
            return this.disabledDate ? !!this.disabledDate(date) : false;
        },
        hasEnabled(y, m) {
            const count = new Date(y, m + 1, 0).getDate();
            for (let d = 1; d <= count; d++) {
                if (!this.isDisabled(new Date(y, m, d))) return true;
            }
            return false;
        },
        shift(step) {
            const d = new Date(this.view.y, this.view.m + step, 1);
            this.view = { y: d.getFullYear(), m: d.getMonth() };
        },
        pick(date, focus) {
            this.view = { y: date.getFullYear(), m: date.getMonth() };
            if (!sameDay(date, this.value)) {
                this.$emit('input', date);
                this.$emit('change', date);
            }
            if (!focus) return;
            this.$nextTick(() => {
                const el = this.$el.querySelector(`[data-day="${date.getDate()}"]`);
                if (el) el.focus();
            });
        },
        // 左右差一天、上下差一周，跳过不能选的日子，跨月时跟着翻页；选中跟着焦点走
        onKeydown(event) {
            const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
            const from = Number(event.target.dataset && event.target.dataset.day);
            if (!step || !from) return;
            event.preventDefault();
            const date = new Date(this.view.y, this.view.m, from);
            // 往一个方向连着都不能选时，走两个月还没找到就不动
            for (let n = 0; n < 62; n++) {
                date.setDate(date.getDate() + step);
                if (!this.isDisabled(date)) {
                    this.pick(new Date(date.getFullYear(), date.getMonth(), date.getDate()), true);
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
