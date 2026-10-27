<template>
    <!-- 数字步进：只给加减两个按钮，不让直接输入，数字始终落在 min 到 max 之间 -->
    <span class="h-stepper" :class="{ 'h-stepper--disabled': disabled }">
        <button
            ref="minus"
            type="button"
            class="h-stepper__btn"
            :aria-label="minusLabel"
            :disabled="disabled || value <= min"
            @click="stepBy(-1)">
            <i class="h-stepper__minus" aria-hidden="true"></i>
        </button>
        <span class="h-stepper__value" aria-live="polite">
            <slot :value="value">{{ value }}</slot>
        </span>
        <button
            ref="plus"
            type="button"
            class="h-stepper__btn"
            :aria-label="plusLabel"
            :disabled="disabled || value >= max"
            @click="stepBy(1)">
            <i class="h-stepper__plus" aria-hidden="true"></i>
        </button>
    </span>
</template>

<script>
// 0.1 + 0.2 这类小数相加会多出尾数，按值和步长里位数多的那个取整
const decimals = (n) => (String(n).split('.')[1] || '').length;

export default {
    name: 'h-stepper',
    props: {
        value: { type: Number, default: 0 },
        min: { type: Number, default: -Infinity },
        max: { type: Number, default: Infinity },
        step: { type: Number, default: 1 },
        disabled: { type: Boolean, default: false },
        // 两个按钮只有图形没有字，调用方漏传时读屏至少能念出是减还是加
        minusLabel: { type: String, default: '减少' },
        plusLabel: { type: String, default: '增加' }
    },
    methods: {
        // 到头那一侧的按钮是禁用的，聚焦不上，就落到另一侧；整体禁用时两个都聚焦不上，什么也不做
        focus() {
            const btn = [this.$refs.minus, this.$refs.plus].find((b) => b && !b.disabled);
            if (btn) btn.focus();
        },
        stepBy(dir) {
            const old = this.value;
            const raw = old + dir * this.step;
            const next = Math.min(
                this.max,
                Math.max(this.min, Number(raw.toFixed(Math.max(decimals(old), decimals(this.step)))))
            );
            if (next === old) return;
            this.$emit('input', next);
            this.$emit('change', next, old);
            // 到头的按钮会藏起来，焦点挪到另一个按钮上，不掉回页面开头
            const [from, to] = dir < 0 ? ['minus', 'plus'] : ['plus', 'minus'];
            this.$nextTick(() => {
                const a = document.activeElement;
                const { [from]: gone, [to]: other } = this.$refs;
                if (!gone || !other) return;
                const lost = !a || a === document.body || a === gone;
                if (lost && gone.disabled && !other.disabled) other.focus();
            });
        }
    }
};
</script>

<style scoped>
@import './index.css';
</style>
