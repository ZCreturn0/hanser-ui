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
/* 尽量给要写样式的元素一个类 */
.a {}
.b {}
.c {}

/* 避免写大于3层的嵌套 */
.aa .aaa .aaa {}

/* 使用 BEM 命名规范: 块__元素--修饰符 */
.search-input--active {}
.search-result__post-title--visited {}
.swiper__cart--left {}
</style>
