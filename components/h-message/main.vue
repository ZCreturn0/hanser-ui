<template>
    <!-- 消息弹窗 -->
    <h-modal class="h-message">
        <div>
            test
        </div>
    </h-modal>
</template>

<script>
import HModal from '../h-modal';
export default {
    name: 'h-message',
    data () {
        return {

        }
    },
    components: {
        HModal
    }
}
</script>

<style scoped>

@import './index.css';

</style>
