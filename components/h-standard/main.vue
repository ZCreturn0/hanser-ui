<template>
    <!-- 必须含有注释 -->
    <!-- 标准模版 -->

    <!-- 类名与文件夹名一致 -->
    <div class="h-standard">
        <!-- 作为标签使用统一用 (小写字母 + '-') 形式 -->
        <!-- 事件统一用 (小写字母 + '-') 形式 -->
        <h-button @self-made-event="handleClick"></h-button>
    </div>
</template>

<script>
// 路径到文件夹级别
import HButton from '../h-button';

export default {
    // 必须含有 name,且与最外层元素类名一致
    name: 'h-standard',
    data () {
        return {
            // 小驼峰
            userInfo: null
        }
    },
    components: {
        // 类名大驼峰
        HButton
    },
    methods: {
        // 小驼峰
        handleClick () {
            console.log('event emit');
        }
    }
}
</script>

<style scoped>
/* 统一通过引入来加载css */
@import './index.css';
</style>
