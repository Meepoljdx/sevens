// ==================== NETWORK ====================
class Network {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.onState = null;
        this.onJoined = null;
        this.onEvent = null;
        this.messageQueue = [];
    }

    connect() {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${location.host}/ws`;
        console.log('Connecting to', url);

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.connected = true;
            // Flush queued messages
            for (const msg of this.messageQueue) {
                this.ws.send(JSON.stringify(msg));
            }
            this.messageQueue = [];
        };

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                switch (msg.type) {
                    case 'state':
                        if (this.onState) this.onState(msg);
                        break;
                    case 'joined':
                        if (this.onJoined) this.onJoined(msg);
                        break;
                    case 'event':
                        if (this.onEvent) this.onEvent(msg);
                        break;
                    case 'pickup_ok':
                        if (this.onPickup) this.onPickup(msg);
                        break;
                }
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.connected = false;
            // Attempt reconnect
            setTimeout(() => this.connect(), 2000);
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };
    }

    send(msg) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        } else {
            this.messageQueue.push(msg);
        }
    }

    sendInput(keys) {
        this.send({
            type: 'input',
            keys: keys,
        });
    }

    sendCast(skillID, targetX, targetY) {
        this.send({
            type: 'cast',
            skill_id: skillID,
            target_x: targetX,
            target_y: targetY,
        });
    }

    sendJoin(hero, name) {
        this.send({
            type: 'join',
            hero: hero,
            name: name,
        });
    }
}
