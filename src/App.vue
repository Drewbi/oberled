<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import Touch from './components/Touch.vue'
    import Status from './components/Status.vue'

    const socket = ref(null);
    const data = ref(null);
    const connected = ref(false);

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
            const parsed = JSON.parse(event.data);
            data.value = parsed.filter(pos => pos && pos.x && pos.y)
        };

        socket.value.onerror = (error) => {
            console.error('WebSocket Error: ', error);
            connected.value = false;
        };
    }

    const send = (data) => {
        if (connected.value && socket.value && socket.value.readyState === WebSocket.OPEN) {
            socket.value.send(data);
        }
    }
</script>

<template>
    <div id="container">
        <Status :isConnected="connected" />
        <Touch :data="data" @send-move="send($event)" />
    </div>
</template>

<style scoped>
    #container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
