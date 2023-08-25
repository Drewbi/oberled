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
        // Accept our end of the WebSocket. This tells the runtime that we'll be terminating the
        // WebSocket in JavaScript, not sending it elsewhere.
        webSocket.accept();

        // Create our session and add it to the sessions list.
        // We don't send any messages to the client until it has sent us the initial user info
        // message. Until then, we will queue messages in `session.blockedMessages`.
        let session: any = { webSocket, id: this.sessions.length };
        this.sessions.push(session);

        // Load the last 100 messages from the chat history stored on disk, and send them to the
        // client.
        // let storage = await this.store.list({reverse: true, limit: 100});
        // let backlog = [...storage.values()];
        // backlog.reverse();
        // backlog.forEach(value => {
        //   session.blockedMessages.push(value);
        // });

        // Set event handlers to receive messages.
        webSocket.addEventListener('message', async msg => {
            try {
                if (session.quit) {
                    // Whoops, when trying to send to this WebSocket in the past, it threw an exception and
                    // we marked it broken. But somehow we got another message? I guess try sending a
                    // close(), which might throw, in which case we'll try to send an error, which will also
                    // throw, and whatever, at least we won't accept the message. (This probably can't
                    // actually happen. This is defensive coding.)
                    webSocket.close(1011, "WebSocket broken.");
                    return;
                }

                // I guess we'll use JSON.
                let data = JSON.parse(msg.data as string);

                // Block people from sending overly long messages. This is also enforced on the client,
                // so to trigger this the user must be bypassing the client code.
                if (!data.end && (!data.x || !data.y || data.x < 0 || data.y < 0 || data.x > 1000 || data.y > 1000)) {
                    webSocket.send(JSON.stringify({ error: "Invalid message" }));
                    return;
                }

                const { x: xDat = null, y: yDat = null } = data

                if (data.end) {
                    await this.store.delete(session.id);
                } else await this.store.put(session.id, { x: xDat, y: yDat });

                // Broadcast the message to all other WebSockets.
                const dataList = await Promise.all(this.sessions.map(session => this.store.get(session.id)))

                let dataStr = JSON.stringify(dataList);
                this.broadcast(dataStr);

            } catch (err: any) {
                // Report any exceptions directly back to the client. As with our handleErrors() this
                // probably isn't what you'd want to do in production, but it's convenient when testing.
                webSocket.send(JSON.stringify({ error: err.stack }));
            }
        });

        // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
        // a quit message.
        let closeOrErrorHandler = (evt: Event) => {
            session.quit = true;
            this.sessions = this.sessions.filter(member => member !== session);
        };
        webSocket.addEventListener("close", closeOrErrorHandler);
        webSocket.addEventListener("error", closeOrErrorHandler);
    }

    broadcast(message: any) {
        // Apply JSON if we weren't given a string to start with.
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }

        // Iterate over all the sessions sending them messages.
        let quitters: any[] = [];
        this.sessions = this.sessions.filter(session => {
            try {
                session.webSocket.send(message);
                return true;
            } catch (err) {
                // Whoops, this connection is dead. Remove it from the list and arrange to notify
                // everyone below.
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
        return await stub.fetch(request)
    }
};
