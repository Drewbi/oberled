<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import Touch from './components/Touch.vue'
    import Status from './components/Status.vue'

    const socket = ref(null);
    const data = ref(null);
    const connected = ref(false);
    const debug = ref('')
    const debug2 = ref('')

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
        // socket.value = new WebSocket('ws://localhost:8787');

        socket.value.onopen = () => {
            console.log('Connection opened');
            connected.value = true;
        };

        socket.value.onmessage = (event) => {
            debug2.value = ''
            const parsed = JSON.parse(event.data);
            debug2.value = parsed
            if(parsed.error) {
                debug.value = parsed.error
                console.error('WebSocket Error: ', parsed.error);
            }
            else data.value = parsed.filter(pos => pos && pos.x !== undefined && pos.y !== undefined)
        };

        socket.value.onerror = (error) => {
            console.error('WebSocket Error: ', error);
            connected.value = false;
        };
    }

    const send = (data) => {
        debug.value = ''
        if (connected.value && socket.value && socket.value.readyState === WebSocket.OPEN) {
            debug.value = data
            console.log(decodeURIComponent(data))
            socket.value.send(decodeURIComponent(data));
        }
    }
</script>

<template>
    <div id="container">
        debug {{ debug }}
        debug2 {{ debug2 }}
        data {{ data }}
        <Touch :data="data" @send-move="send($event)" />
        <Status :isConnected="connected" />
    </div>
</template>

<style scoped>
    #container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }
</style>
