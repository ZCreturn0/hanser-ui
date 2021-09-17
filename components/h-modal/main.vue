<template>
    <!-- 悬浮层 -->
    <div class="h-modal">
        <div class="content">
            <template v-if="content">
                <component :is="content" />
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: 'h-modal',
    data () {
        return {
            resolve: null,
            reject: null,
            content: null
        }
    },
    methods: {
        show() {
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        }
    }
}
</script>

<style scoped>

@import './index.css';

</style>
