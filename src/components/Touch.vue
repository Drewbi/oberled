<script setup>
    import { ref, computed } from 'vue';

    const isMouseDown = ref(false);
    const touchElem = ref(null)
    const offsetX = computed(() => touchElem.value.getBoundingClientRect().left)
    const offsetY = computed(() => touchElem.value.getBoundingClientRect().top)

    const props = defineProps(['data']);

    const emit = defineEmits(['sendMove']);

    const mouseDown = (event) => {
        isMouseDown.value = true;
        sendCoordinates(event);
    };

    const mouseMove = (event) => {
        if (isMouseDown.value) {
            sendCoordinates(event);
        }
    };

    const mouseUp = () => {
        isMouseDown.value = false;
        sendEnd();
    };

    const sendCoordinates = (event) => {
        const coordinates = {
            x: event.clientX - event.currentTarget.offsetLeft,
            y: event.clientY - event.currentTarget.offsetTop,
        };

        emit('sendMove', JSON.stringify(coordinates));
    };

    const sendEnd = () => {
        emit('sendMove', JSON.stringify({ end: true }));
    }

</script>

<template>
    <div ref="touchElem" id="input" @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp" @mouseleave="mouseUp">
        <div class="grid-item" v-for="n in 256" :key="n"></div>
        <div
            v-for="position in props.data"
            :key="position.x + '-' + position.y"
            :style="{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#f1f4f2',
                position: 'absolute',
                left: offsetX + position.x + 'px',
                top: offsetY + position.y + 'px',
                visibility: position.x === null || position.y === null ? 'hidden' : 'visible'
            }"
        ></div>
  </div>
</template>

<style scoped>
    #input {
        width: 350px;
        height: 500px;
        border: 2px solid #f1f4f2;
        border-radius: 10px;
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        grid-template-rows: repeat(16, 1fr);
        gap: 12px 2px;
        padding: 10px;
    }

    .grid-item {
        width: 100%;
        height: 100%;
        border-radius: 2px;
        background-color: #212121;
        transition: background-color 0.1s ease;
    }

    .grid-item:hover {
        background-color: #f1f4f2;
    }
</style>
