<template>
    <!-- alert -->
    <h-modal class="h-alert">
        {{ message }}
    </h-modal>
</template>

<script>
export default {
    name: 'h-alert',
    data () {
        return {

        }
    },
    props: ['type', 'message']
}
</script>

<style scoped>

@import './index.css';

</style>
