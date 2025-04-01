//% weight=100 color=#0fbc11 icon="\uf233" block="LAN Multiplayer"
namespace lanmultiplayer {
    let peerConnection: RTCPeerConnection = null;
    let dataChannel: RTCDataChannel = null;
    let onMessageReceivedHandler: (msg: string) => void = null;
    
    // Variables to hold the SDP strings for manual signaling
    let localOffer: string = "";
    let localAnswer: string = "";

    // Use a public STUN server configuration
    const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

    /**
     * Client-side: Create a local SDP offer.
     * Call this block and then use "get local offer" to retrieve the offer text.
     */
    //% blockId=lanmultiplayer_createLocalOffer block="create local offer"
    export function createLocalOffer(): void {
        peerConnection = new RTCPeerConnection(configuration);
        // Create a data channel for sending messages
        dataChannel = peerConnection.createDataChannel("lanmultiplayer");
        setupDataChannel();

        // Handle ICE candidates; when ICE gathering is finished, store the local offer.
        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (!event.candidate) { // ICE gathering complete
                localOffer = JSON.stringify(peerConnection.localDescription);
                console.log("Local Offer ready:", localOffer);
            } else {
                console.log("Client ICE candidate:", JSON.stringify(event.candidate));
            }
        };

        peerConnection.createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .catch((error) => console.error("Error creating offer:", error));
    }

    /**
     * Get the local SDP offer string.
     */
    //% blockId=lanmultiplayer_getLocalOffer block="get local offer"
    export function getLocalOffer(): string {
        return localOffer;
    }

    /**
     * Client-side: Accept a remote SDP answer.
     * Paste the answer (as text) into this block.
     * @param sdp the remote answer SDP text
     */
    //% blockId=lanmultiplayer_acceptRemoteAnswer block="accept remote answer %sdp"
    export function acceptRemoteAnswer(sdp: string): void {
        if (!peerConnection) {
            console.error("Peer connection not initialized");
            return;
        }
        let answerDesc = new RTCSessionDescription(JSON.parse(sdp));
        peerConnection.setRemoteDescription(answerDesc)
            .then(() => console.log("Remote answer accepted"))
            .catch((error) => console.error("Error setting remote answer:", error));
    }

    /**
     * Server-side: Accept a remote SDP offer (from the client) and create an answer.
     * Paste the client's offer (as text) into this block.
     */
    //% blockId=lanmultiplayer_acceptRemoteOffer block="accept remote offer %sdp and create answer"
    export function acceptRemoteOffer(sdp: string): void {
        peerConnection = new RTCPeerConnection(configuration);
        // When a data channel is received, set it up.
        peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            dataChannel = event.channel;
            setupDataChannel();
        };

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (!event.candidate) { // ICE gathering complete
                localAnswer = JSON.stringify(peerConnection.localDescription);
                console.log("Local Answer ready:", localAnswer);
            } else {
                console.log("Server ICE candidate:", JSON.stringify(event.candidate));
            }
        };

        let offerDesc = new RTCSessionDescription(JSON.parse(sdp));
        peerConnection.setRemoteDescription(offerDesc)
            .then(() => peerConnection.createAnswer())
            .then((answer) => peerConnection.setLocalDescription(answer))
            .catch((error) => console.error("Error processing remote offer:", error));
    }

    /**
     * Get the local SDP answer string.
     * Use this block to copy the answer and send it back to the client.
     */
    //% blockId=lanmultiplayer_getLocalAnswer block="get local answer"
    export function getLocalAnswer(): string {
        return localAnswer;
    }

    /**
     * Setup data channel event handlers.
     */
    function setupDataChannel(): void {
        if (dataChannel) {
            dataChannel.onopen = () => console.log("Data channel opened.");
            dataChannel.onmessage = (e: MessageEvent) => {
                if (onMessageReceivedHandler) {
                    onMessageReceivedHandler(e.data);
                }
            };
            dataChannel.onerror = (error) => console.error("Data channel error:", error);
        }
    }

    /**
     * Send a LAN message over the established data channel.
     * @param message the message to send
     */
    //% blockId=lanmultiplayer_sendMessage block="send LAN message %message"
    export function sendMessage(message: string): void {
        if (dataChannel && dataChannel.readyState === "open") {
            dataChannel.send(message);
            console.log("Sent message:", message);
        } else {
            console.error("Data channel is not open. Cannot send message.");
        }
    }

    /**
     * Register an event handler for received LAN messages.
     * @param handler the callback function to run when a message is received
     */
    //% blockId=lanmultiplayer_onMessageReceived block="on LAN message received"
    export function onMessageReceived(handler: (message: string) => void): void {
        onMessageReceivedHandler = handler;
    }

    // Helper function to simulate receiving a message (for testing).
    export function simulateIncomingMessage(message: string): void {
        if (onMessageReceivedHandler) {
            onMessageReceivedHandler(message);
        }
    }
}
