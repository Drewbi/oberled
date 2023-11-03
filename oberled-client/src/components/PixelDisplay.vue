<script setup>
const props = defineProps(['selected'])
</script>

<template>
    <div class="grid-item" :selected="props.selected"></div>
</template>

<style scoped>
.grid-item {
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 4px;
    background-color: #212121;
    transition: background-color 0.1s ease;
}

.grid-item[selected='true'] {
    background-color: #f1f4f2;
}
</style>
