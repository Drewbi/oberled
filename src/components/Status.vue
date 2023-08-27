<template>
    <div id="connection"><span>Status: </span><div :style="circleStyle"></div></div>
</template>
  
<script setup>
    import { toRefs, computed } from 'vue';

    const props = defineProps(['isConnected']);

    const circleStyle = computed(() => ({
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: props.isConnected ? '#a8dadc' : '#e63946'
    }));
</script>

<style scoped>
    #connection {
        font-size: 16px;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        line-height: 1;
        margin-top: 20px;
    }
</style>