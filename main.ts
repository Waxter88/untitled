//% weight=100 color=#0fbc11 icon="\uf233" block="LAN Multiplayer"
namespace lanmultiplayer {
    // Internal handler for received messages
    let onMessageReceivedHandler: (msg: string) => void = null;

    /**
     * Start a LAN multiplayer session.
     * This function initializes the connection logic (e.g. WebRTC signaling).
     */
    //% blockId=lanmultiplayer_startServer block="start LAN multiplayer server"
    export function startServer(): void {
        console.log("Starting LAN multiplayer server...");
        // TODO: Initialize server or signaling mechanism here.
    }

    /**
     * Connect to a LAN peer using the specified IP address.
     * @param ip the IP address of the peer (e.g. "192.168.1.100")
     */
    //% blockId=lanmultiplayer_connectToPeer block="connect to LAN peer at IP %ip"
    export function connectToPeer(ip: string): void {
        console.log("Connecting to LAN peer at " + ip);
        // TODO: Implement peer connection logic (e.g. using WebRTC signaling).
    }

    /**
     * Send a LAN message to connected peers.
     * @param message the message to send
     */
    //% blockId=lanmultiplayer_sendMessage block="send LAN message %message"
    export function sendMessage(message: string): void {
        console.log("Sending LAN message: " + message);
        // TODO: Use a data channel or appropriate API to send the message.
    }

    /**
     * Register an event handler for when a LAN message is received.
     * @param handler the callback function to run when a message is received
     */
    //% blockId=lanmultiplayer_onMessageReceived block="on LAN message received"
    export function onMessageReceived(handler: (message: string) => void): void {
        onMessageReceivedHandler = handler;
    }

    // A helper function to simulate an incoming message.
    // This is for testing purposes in the simulator.
    export function simulateIncomingMessage(message: string): void {
        if (onMessageReceivedHandler) {
            onMessageReceivedHandler(message);
        }
    }
}
