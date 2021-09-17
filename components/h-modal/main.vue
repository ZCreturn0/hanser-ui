<template>
    <!-- 悬浮层 -->
    <div class="h-modal">
        <div class="content">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: 'h-modal',
    data () {
        return {

        }
    }
}
</script>

<style scoped>

@import './index.css';

</style>
