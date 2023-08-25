<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';

    const socket = ref(null);
    const data = ref(null);
    const connected = ref(false);

    const isMouseDown = ref(false);

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
        if (connected.value && socket.value && socket.value.readyState === WebSocket.OPEN) {
            const coordinates = {
                x: event.clientX - event.currentTarget.offsetLeft,
                y: event.clientY - event.currentTarget.offsetTop,
            };

            socket.value.send(JSON.stringify(coordinates));
        }
    };

    const sendEnd = () => {
        if (connected.value && socket.value && socket.value.readyState === WebSocket.OPEN) {
            socket.value.send(JSON.stringify({ end: true }));
        }
    }

    onMounted(() => {
        connect()
    })

    onUnmounted(() => {
        if (socket.value) {
            socket.value.close();
            connected.value = false;
        }
    });

    const connect = () => {
        socket.value = new WebSocket('wss://oberled-socket.drub.workers.dev');

        socket.value.onopen = () => {
            console.log('Connection opened');
            connected.value = true;
        };

        socket.value.onmessage = (event) => {
            console.log(event.data)
            const parsed = JSON.parse(event.data);
            data.value = parsed.filter(pos => pos && pos.x && pos.y)
        };

        socket.value.onerror = (error) => {
            console.error('WebSocket Error: ', error);
            connected.value = false;
        };
    }

</script>

<template>
    <div id="input" @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp" @mouseleave="mouseUp">
        <div
            v-for="position in data"
            :key="position.x + '-' + position.y"
            :style="{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'red',
                position: 'absolute',
                left: 20 + position.x + 'px',
                top: 20 + position.y + 'px',
                visibility: position.x === null || position.y === null ? 'hidden' : 'visible'
            }"
        ></div>
  </div>
</template>

<style scoped>
    #input {
        width: 80%;
        height: 80%;
        border: 2px solid white;
        border-radius: 10px;
    }
</style>
