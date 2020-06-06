<template>
    <article id="page-success" class="page" :class="dark ? 'dark' : null">
        <div class="vid">
            <video class="video" autoplay width="800" height="640" ref="livestream"></video>
            <div class="label">Live</div>
            <div class="btn-div">
                <button class="btn" @click="stopCamera">Camera</button>
            </div>
        </div>
        <div class="vid">
            <video class="video" autoplay width="400" height="350" ref="chatting"></video>
            <div class="label">Your camera</div>
            <div class="btn-div">
                <button class="btn" @click="stopCamera">Camera</button>
            </div>
        </div>
    </article>
</template>

<script>
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
};

/////////////////////////////////////////////

var room = "foo";
// Could prompt for room name:
// room = prompt('Enter room name:');

var socket = io.connect();

if (room !== "") {
    socket.emit("create or join", room);
    console.log("Attempted to create or  join room", room);
}

socket.on("created", function(room) {
    console.log("Created room " + room);
    console.log("Remote stream added.", app.$refs.success);

    isInitiator = true;
});

socket.on("full", function(room) {
    console.log("Room " + room + " is full");
});

socket.on("join", function(room) {
    console.log("Another peer made a request to join room " + room);
    console.log("This peer is the initiator of room " + room + "!");
    isChannelReady = true;
});

socket.on("joined", function(room) {
    console.log("joined: " + room);
    isChannelReady = true;
});

socket.on("log", function(array) {
    console.log.apply(console, array);
});

////////////////////////////////////////////////

function sendMessage(message) {
    console.log("Client sending message: ", message);
    socket.emit("message", message);
}

// This client receives a message
socket.on("message", function(message) {
    console.log("Client received message:", message);
    if (message === "got user media") {
        maybeStart();
    } else if (message.type === "offer") {
        if (!isInitiator && !isStarted) {
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    } else if (message.type === "answer" && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === "candidate" && isStarted) {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate,
        });
        pc.addIceCandidate(candidate);
    } else if (message === "bye" && isStarted) {
        handleRemoteHangup();
    }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector("#localVideo");
var remoteVideo = document.querySelector("#remoteVideo");

navigator.mediaDevices.getUserMedia({
  audio: false,
  video: true
})
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});

function gotStream(stream) {
    console.log("Adding local stream.");
    // console.log("Remote stream added.", app.$refs.success);
    localStream = stream;
    localVideo.srcObject = stream;
    sendMessage("got user media");
    if (isInitiator) {
        maybeStart();
    }
}

var constraints = {
    video: true,
};

console.log("Getting user media with constraints", constraints);

if (location.hostname !== "localhost") { //if not on the same network
    requestTurn("https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913");
}

function maybeStart() {
    console.log(">>>>>>> maybeStart() ", isStarted, localStream, isChannelReady);
    if (!isStarted && typeof localStream !== "undefined" && isChannelReady) {
        console.log(">>>>>> creating peer connection");
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        console.log("isInitiator", isInitiator);
        if (isInitiator) {
            doCall();
        }
    }
}

window.onbeforeunload = function() {
    sendMessage("bye");
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
    try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log("Created RTCPeerConnnection");
    } catch (e) {
        console.log("Failed to create PeerConnection, exception: " + e.message);
        alert("Cannot create RTCPeerConnection object.");
        return;
    }
}

function handleIceCandidate(event) {
    console.log("icecandidate event: ", event);
    if (event.candidate) {
        sendMessage({
            type: "candidate",
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
        });
    } else {
        console.log("End of candidates.");
    }
}

function handleCreateOfferError(event) {
    console.log("createOffer() error: ", event);
}

function doCall() {
    console.log("Sending offer to peer");
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
    console.log("Sending answer to peer.");
    pc.createAnswer().then(setLocalAndSendMessage, onCreateSessionDescriptionError);
}

function setLocalAndSendMessage(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    console.log("setLocalAndSendMessage sending message", sessionDescription);
    sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
    trace("Failed to create session description: " + error.toString());
}

function requestTurn(turnURL) {
    var turnExists = false;
    for (var i in pcConfig.iceServers) {
        if (pcConfig.iceServers[i].urls.substr(0, 5) === "turn:") {
            turnExists = true;
            turnReady = true;
            break;
        }
    }
    if (!turnExists) {
        console.log("Getting TURN server from ", turnURL);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var turnServer = JSON.parse(xhr.responseText);
                console.log("Got TURN server: ", turnServer);
                pcConfig.iceServers.push({
                    urls: "turn:" + turnServer.username + "@" + turnServer.turn,
                    credential: turnServer.password,
                });
                turnReady = true;
            }
        };
        xhr.open("GET", turnURL, true);
        xhr.send();
    }
}

function handleRemoteStreamAdded(event) {
    remoteStream = event.stream;
    // remoteVideo.srcObject = remoteStream;
    // app.$refs.success.remoteStream(remoteStream);
}

function handleRemoteStreamRemoved(event) {
    console.log("Remote stream removed. Event: ", event);
}

function hangup() {
    console.log("Hanging up.");
    stop();
    sendMessage("bye");
}

function handleRemoteHangup() {
    console.log("Session terminated.");
    stop();
    isInitiator = false;
}

function stop() {
    isStarted = false;
    pc.close();
    pc = null;
}

export default {
    props: {
        currentUrl: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        allowScroll: {
            type: Boolean,
        },
        mediaStream: {
            type: Object,
        },
    },
    data() {
        return {
            production: false,
            sidebar: ["person_pin", "school", "lock", "book"],
            url: window.location.href,
            sidebarShow: true,
            // mobile: window.innerWidth > 600 ? false : true,
            dark: true,
            camera: false,
            mediaStreamConstraints: {
                video: true,
            },
            // currentUrl: "https://www.twitter.com",
            // show: false,
        };
    },
    // watch: {
    //   "mediaStream"() {
    //     this.$refs.chatting.srcObject = this.mediaStream;
    //   },
    //   deep: true,
    //
    // },
    methods: {
        remoteStream(stream) {
            console.log("streanibfsss");
            this.$refs.livestream.srcObject = stream;
        },
        
        testMedia() {
            navigator.mediaDevices
                .getUserMedia(this.mediaStreamConstraints)
                .then(this.gotLocalMediaStream)
                .catch(this.handleLocalMediaStreamError);
        },
        gotLocalMediaStream(mediaStream) {
            this.localStream = mediaStream;
            if (this.$refs.chatting) {
                this.$refs.chatting.srcObject = mediaStream;
            } else {
                // this.$refs.chatting.srcObject = mediaStream;
            }
        },
        handleLocalMediaStreamError(error) {
            console.log("navigator.getUserMedia error: ", error);
        },
        stopCamera() {
            if (this.localStream) {
                this.localStream.getTracks()[0].stop();
                this.localStream = false;
            } else {
                this.testMedia();
            }
        },
    },
    created() {},
    mounted() {
        // console.log("Remote stream added.", app.$refs.success);
        console.log("daf.ldaflad,lg");
        // this.$refs.chatting.srcObject = this.mediaStream;
        // this.testMedia();
    },
};
</script>
