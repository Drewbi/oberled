<script setup>
import { ref, watch, computed } from 'vue'
import PixelDisplay from './PixelDisplay.vue'

const isInputDown = ref(false)
const touchElem = ref(null)
const selectedX = ref(null)
const selectedY = ref(null)

const props = defineProps(['data'])

const selectedIndexes = computed(() => props.data?.map((pos) => pos.y * 16 + pos.x) ?? [])

const emit = defineEmits(['sendMove'])

watch(selectedX, (newVal, oldVal) => {
    if (newVal !== oldVal) sendCoordinates(selectedX.value, selectedY.value)
})

watch(selectedY, (newVal, oldVal) => {
    if (newVal !== oldVal) sendCoordinates(selectedX.value, selectedY.value)
})

const inputStart = (event) => {
    isInputDown.value = true
    setCoordinates(event)
}

const inputMove = (event) => {
    if (isInputDown.value) {
        setCoordinates(event)
    }
}

const inputStop = () => {
    isInputDown.value = false
    sendEnd()
}

const setCoordinates = (event) => {
    const inputX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX
    const inputY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY
    const coordinates = {
        x: inputX - touchElem.value.offsetLeft - 20,
        y: inputY - touchElem.value.offsetTop - 20
    }
    if (coordinates.x < 0 || coordinates.y < 0) return

    const pixelX = Math.round((coordinates.x / (touchElem.value.clientWidth - 40)) * 15)
    const pixelY = Math.round((coordinates.y / (touchElem.value.clientHeight - 40)) * 15)

    selectedX.value = pixelX
    selectedY.value = pixelY
}

const sendCoordinates = (x, y) => {
    emit('sendMove', JSON.stringify({ x, y }))
}

const sendEnd = () => {
    emit('sendMove', JSON.stringify({ end: true }))
}
</script>

<template>
    <div
        ref="touchElem"
        id="input"
        @mousedown="inputStart"
        @mousemove="inputMove"
        @mouseup="inputStop"
        @mouseleave="inputStop"
        @touchstart="inputStart"
        @touchmove="inputMove"
        @touchend="inputStop"
        @touchcancel="inputStop"
    >
        <PixelDisplay
            v-for="n in 256"
            :key="n"
            :selected="selectedIndexes?.includes(n - 1)"
        ></PixelDisplay>
    </div>
</template>

<style scoped>
#input {
    height: 60vh;
    width: 40vh;
    border: 2px solid #f1f4f2;
    border-radius: 8px;
    display: grid;
    grid-template-columns: repeat(16, 1fr);
    grid-template-rows: repeat(16, 1fr);
    align-items: center;
    gap: 0 3px;
    padding: 10px;
    user-select: none;
    -webkit-user-drag: none;
    -moz-user-select: none;
    -ms-user-select: none;
}
</style>
