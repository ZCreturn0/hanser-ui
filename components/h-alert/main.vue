<template>
    <!-- alert -->
    <h-modal class="h-alert">
        {{ message }}
    </h-modal>
</template>

<script>
import HModal from '../h-modal';
export default {
    name: 'h-alert',
    data () {
        return {

        }
    },
    components: {
        HModal
    },
    props: ['type', 'message']
}
</script>

<style scoped>

@import './index.css';

</style>
