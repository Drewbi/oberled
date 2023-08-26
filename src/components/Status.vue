<template>
    <div id="connection"><span>Status: </span><div :style="circleStyle"></div></div>
</template>
  
<script setup>
    import { toRefs, computed } from 'vue';

    const props = defineProps(['isConnected']);

    const circleStyle = computed(() => ({
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: props.isConnected ? '#a8dadc' : '#e63946'
    }));
</script>

<style scoped>
    #connection {
        font-size: 10px;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        line-height: 1;
        margin-bottom: 5px;
    }
</style>