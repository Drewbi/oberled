export interface Env {
    SCREEN_STATE: DurableObjectNamespace;
}

export class ScreenState {
    store: DurableObjectStorage;

    state: DurableObjectState;

    env: Env;

    sessions: any[];

    constructor(state: DurableObjectState, env: Env) {
        this.store = state.storage;
        this.env = env;
        this.state = state;
        this.sessions = [];
    }

    async fetch(request: Request) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        await this.handleSession(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async handleSession(webSocket: WebSocket) {
        webSocket.accept();

        let session: any = { webSocket, id: this.sessions.length };
        this.sessions.push(session);

        console.log('test1')
        webSocket.addEventListener('message', async msg => {
            try {
                if (session.quit) {
                    webSocket.close(1011, "WebSocket broken.");
                    return;
                }

                console.log(msg.data)

                let data = JSON.parse(msg.data as string);

                if (!data.end && (data.x === undefined || data.y === undefined || data.x < 0 || data.y < 0 || data.x >= 16 || data.y >= 16)) {
                    throw Error('Invalid message');
                }

                const { x: xDat = null, y: yDat = null } = data

                if (data.end) {
                    await this.store.delete(session.id);
                } else await this.store.put(session.id, { x: xDat, y: yDat });

                const dataList = await Promise.all(this.sessions.map(session => this.store.get(session.id)))

                let dataStr = JSON.stringify(dataList);
                this.broadcast(dataStr);
            } catch (err: any) {
                webSocket.send(JSON.stringify({ error: 'Something went wrong: ' + err.message }));
            }
        });
        let closeOrErrorHandler = () => {
            session.quit = true;
            this.sessions = this.sessions.filter(member => member !== session);
        };
        webSocket.addEventListener("close", closeOrErrorHandler);
        webSocket.addEventListener("error", closeOrErrorHandler);
    }

    broadcast(message: any) {
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }

        let quitters: any[] = [];
        this.sessions = this.sessions.filter(session => {
            try {
                session.webSocket.send(message);
                return true;
            } catch (err) {
                session.quit = true;
                quitters.push(session);
                return false;
            }
        });
    }
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const id = env.SCREEN_STATE.idFromName('global')
        const stub = env.SCREEN_STATE.get(id);
        console.log('2')
        return await stub.fetch(request)
    }
};
