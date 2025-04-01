// Minimal ambient declarations for missing globals

interface PromiseLike<T> {
    then<TResult>(
        onfulfilled?: (value: T) => TResult | PromiseLike<TResult>,
        onrejected?: (reason: any) => any
    ): PromiseLike<TResult>;
}

declare class Promise<T> {
    constructor(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void);
    then<U>(onfulfilled?: (value: T) => U | PromiseLike<U>, onrejected?: (reason: any) => any): Promise<U>;
    catch<U>(onrejected?: (reason: any) => U | PromiseLike<U>): Promise<U>;
}

declare class Event { }

declare class MessageEvent extends Event {
    data: any;
}

interface RTCIceCandidate {
    candidate: string;
    sdpMid?: string;
    sdpMLineIndex?: number;
}

class RTCPeerConnectionIceEvent extends Event {
    candidate: RTCIceCandidate | null;
}

interface RTCConfiguration {
    iceServers: any[];
}

interface RTCSessionDescriptionInit {
    type: string;
    sdp: string;
}

declare class RTCPeerConnection {
    constructor(configuration: RTCConfiguration);
    createDataChannel(label: string): RTCDataChannel;
    createOffer(): Promise<RTCSessionDescriptionInit>;
    createAnswer(): Promise<RTCSessionDescriptionInit>;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
    ondatachannel: ((event: RTCDataChannelEvent) => void) | null;
    localDescription: RTCSessionDescriptionInit | null;
}

interface RTCDataChannel {
    readyState: string;
    send(data: string): void;
    onopen: ((this: RTCDataChannel, ev: Event) => void) | null;
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => void) | null;
}

declare class RTCSessionDescription implements RTCSessionDescriptionInit {
    constructor(descriptionInitDict: RTCSessionDescriptionInit);
    type: string;
    sdp: string;
}

class RTCDataChannelEvent extends Event {
    channel: RTCDataChannel;
}

// Extension implementation

//% color=#0099CC weight=100 icon="\uf1eb"
//% block="LAN Multiplayer (P2P)"
namespace lanMultiplayer {
    let peerConnection: RTCPeerConnection;
    let dataChannel: RTCDataChannel;
    let onDataHandler: (data: string) => void = (data: string): void => {
        //console.log("Received:", data);
    };

    // For a LAN environment, no ICE servers are needed.
    const rtcConfig: RTCConfiguration = { iceServers: [] };

    /**
     * Host: Starts the connection process and creates a data channel.
     * Returns a Promise that resolves to the SDP offer as a string.
     */
    //% block="start hosting and get offer"
    export function startHost(): Promise<string> {
        peerConnection = new RTCPeerConnection(rtcConfig);
        dataChannel = peerConnection.createDataChannel("gameChannel");

        dataChannel.onopen = (ev: Event): void => {
            console.log("Data channel open");
        };
        dataChannel.onmessage = (event: MessageEvent): void => {
            onDataHandler(event.data);
        };

        return new Promise<string>((resolve, reject) => {
            peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
                peerConnection.setLocalDescription(offer).then(() => {
                    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent): void => {
                        if (event.candidate === null) {
                            // ICE gathering complete
                            resolve(JSON.stringify(peerConnection.localDescription));
                        }
                    };
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Host: Sets the answer received from the joining peer.
     */
    //% block="set answer %answer"
    export function setAnswer(answer: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let answerDesc: RTCSessionDescription = new RTCSessionDescription(JSON.parse(answer));
            peerConnection.setRemoteDescription(answerDesc as RTCSessionDescriptionInit).then(() => {
                resolve(undefined);
            }).catch(reject);
        });
    }

    /**
     * Joiner: Uses the host's offer to create a connection and data channel.
     * Returns a Promise that resolves to the SDP answer as a string.
     */
    //% block="join host with offer %offer"
    export function joinHost(offer: string): Promise<string> {
        peerConnection = new RTCPeerConnection(rtcConfig);

        peerConnection.ondatachannel = (event: RTCDataChannelEvent): void => {
            dataChannel = event.channel;
            dataChannel.onopen = (ev: Event): void => {
                console.log("Data channel open");
            };
            dataChannel.onmessage = (event: MessageEvent): void => {
                onDataHandler(event.data);
            };
        };

        return new Promise<string>((resolve, reject) => {
            let offerDesc: RTCSessionDescription = new RTCSessionDescription(JSON.parse(offer));
            peerConnection.setRemoteDescription(offerDesc as RTCSessionDescriptionInit).then(() => {
                return peerConnection.createAnswer();
            }).then((answerObj: RTCSessionDescriptionInit) => {
                return peerConnection.setLocalDescription(answerObj).then(() => {
                    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent): void => {
                        if (event.candidate === null) {
                            resolve(JSON.stringify(peerConnection.localDescription));
                        }
                    };
                });
            }).catch(reject);
        });
    }

    /**
     * Sends a string message over the data channel.
     */
    //% block="send data %data"
    export function sendData(data: string): void {
        if (dataChannel && dataChannel.readyState === "open") {
            dataChannel.send(data);
        } else {
            console.error("Data channel is not open.");
        }
    }

    /**
     * Registers a handler function to be called when data is received.
     */
    //% block="on data received"
    export function onDataReceived(handler: (data: string) => void): void {
        onDataHandler = handler;
    }
}
