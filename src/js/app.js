import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css' //Vuesax styles
import VueWindowSize from 'vue-window-size';
require('../scss/app.scss');



window.Vue = require('vue');
Vue.config.devtools = true

Vue.use(VueWindowSize);
Vue.use(Vuesax, {
  // options here
})

//pull in all vue components
require('./components');
var parse = require('url-parse');

window.addEventListener('load', function () {
  if (sessionStorage.getItem('scrollPosition') !== null)
    document.getElementsByClassName("main-body")[0].scrollTo({
      top: sessionStorage.getItem('scrollPosition'),
      left: 0,
      behavior: 'smooth',
    });
}, false);

var VideoStreamMerger = require('video-stream-merger')

var socket;
var pc;
var turnReady;


//instantiate page vue
var app = new Vue({
  el: 'main',
  data: {
    currentRoom: {}, //room object
    shareRemoteScreen: false,
    mediaStreamConstraints: { //constraint settigns for camera
      video: true,
    },
    messages: [],
    currentMessage: "",
    pages: {
      home: "home",
      chatting: "chatting",
    },
    currentPage: "home",
    isChannelReady: false, //deos the room have more than one user in it?
    isInitiator: false, // is this the first peer in the room
    isStarted: false,
    pcConfig: { // stun server configuration
      'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
      }]
    },
    sdpConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    },
    room: '',
    message: false, //room name that's passed to server
    displayStream: false,
    localStream: {},
    showVideo: false,
    dataChannel: false,
    isNegotiating: false,
  },
  watch: {},
  methods: {
    testMedia() { //this checks camera lsit
      navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
        .then(this.gotLocalMediaStream).catch(this.handleLocalMediaStreamError);
    },
    gotLocalMediaStream(mediaStream) { //this sets the local video
      console.log('Getting user media with constraints', this.mediaStreamConstraints);

      this.localStream = mediaStream;
      if (this.dataChannel) { //dtachannel shoudve been created by now but if not create data channel first
        console.log("data channnellijdqpijfopqekf[rpqe]pfqe#[f;#qe]]#")
        this.dcSendText("none", "video")
      } else {
        console.log("dc", this.dataChannel, "peer connection", pc)
      }
      this.localVideo = document.getElementById("localVideo")

      this.localVideo.srcObject = this.localStream;

      this.sendMessageToServer('got user media');
      if (this.isInitiator) {
        if (this.isStarted) { //only add stream to peer connection if peerconnection available
          pc.addStream(this.localStream);
        } else {
          this.maybeStart(true);
        }
      } else if (this.isStarted) {
        pc.addStream(this.localStream); //sends local sream to other peer 
      }
    },
    handleLocalMediaStreamError(e) {
      console.error('getUserMedia() error: ' + e.name, e);
    },
    stopCamera() {
      if (this.localStream) {
        this.localStream.getTracks()[0].stop();
        this.localStream = false;
      } else {
        this.testMedia()
      }
    },
    joinRoom() {
      if (this.room !== '') {
        socket.emit('create or join', this.room);
        console.debug('Attempted to create or  join room', this.room);
        this.maybeStart();
      }
    },
    sendMessageToServer(message) {
      // console.debug('Client sending message: ', message);
      socket.emit('message', message);
    },
    maybeStart(media = false) {
      console.debug('>>>>>>> maybeStart() this.isStarted: ', this.isStarted, "localStream: ", this.localStream, "channelReady: ", this.isChannelReady);
      if (!this.isStarted && this.isChannelReady) {
        console.debug('>>>>>> creating peer connection');
        this.createPeerConnection();                        //This example detaches the adding of the local stream from creating a peer connection unlike most examples
        // if (typeof this.localStream !== 'undefined') {
        //   console.log("localstream", this.localStream)
        //   pc.addStream(this.localStream);
        // }
        if (media) {
          console.log("localstream", this.localStream)
          pc.addStream(this.localStream);
        }
        this.isStarted = true;
        console.log('isInitiator', this.isInitiator);
        if (this.isInitiator) {
          console.log('Creating Data Channel');
          this.dataChannel = pc.createDataChannel('photos'); //"create data channel then set functions to happen on datachannel events 
          this.onDataChannelCreated();
          this.doCall();
        } else {
          pc.ondatachannel = (event) => {
            console.log('ondatachannel:', event.channel);
            this.dataChannel = event.channel;
            this.onDataChannelCreated();
          };
        }
      }
    },
    onDataChannelCreated() {
      console.log('onDataChannelCreated:', this.dataChannel);
      this.dataChannel.onopen = () => {
        console.log('CHANNEL opened!!!');
        this.message = true;
      };
      this.dataChannel.onclose = () => {
        console.log('CHANNEL closed!!!');
        this.message = false;
      };
      this.dataChannel.onmessage = (event) => {
        console.log('CHANNEL message!!!', event);
        // this.currentMessage = event.data;
        console.log("recieved", event.type, event.type == "video")
        if (event.type == "video") {
          console.log("message!!!!!")
          this.showVideo = true;
        } else {
          this.messages.push(event)
        }
      };
    },
    createPeerConnection() {
      try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = this.handleIceCandidate;
        pc.onaddstream = this.handleRemoteStreamAdded;
        pc.onremovestream = this.handleRemoteStreamRemoved;
        pc.onnegotiationneeded = this.renegotiate;
        pc.onsignalingstatechange = (e) => {  // Workaround for Chrome: skip nested negotiations
          this.isNegotiating = (pc.signalingState != "stable");
        }

        console.log('Created RTCPeerConnnection');
      } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
      }
    },
    handleIceCandidate(event) {
      console.log('icecandidate event: ', event);
      if (event.candidate) {
        this.sendMessageToServer({
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      } else {
        console.log('End of candidates.');
      }
    },
    handleCreateOfferError(event) {
      console.log('createOffer() error: ', event);
    },
    doCall() {
      console.log('Sending offer to peer');
      pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
    },
    doAnswer() {
      console.log('Sending answer to peer.');
      pc.createAnswer().then(
        this.setLocalAndSendMessage,
        this.onCreateSessionDescriptionError
      );
    },
    renegotiate() {
      if(this.isNegotiating){
        console.log("skip nested negotiation")
        return
      }
      console.log("renogiating") //this is needed for when user changes camera or audio device
      pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError)
      .catch((e) => {console.error("eroorrring", e)});
    },
    setLocalAndSendMessage(sessionDescription) {
      pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.sendMessageToServer(sessionDescription);
    },
    onCreateSessionDescriptionError(error) {
      console.debug('Failed to create session description: ' + error.toString());
    },
    handleRemoteStreamAdded(event) {
      console.log('Remote stream added.', event);
      this.showVideo = true;
      console.log("showing videoooo")

      if (this.shareRemoteScreen) {
        this.remoteScreen = event.stream;
        // this.screenShare = document.getElementById("screenShare")
        // this.screenShare.srcObject = this.remoteScreen;
        this.remoteVideo.srcObject = this.remoteScreen;

      } else {
        this.remoteStream = event.stream;
        setTimeout(() => {
          this.remoteVideo = document.getElementById("remoteVideo") //give time for vue video elemnt to render
        });
        setTimeout(() => {
          this.remoteVideo.srcObject = this.remoteStream;
        }, 1000);
      }

      this.shareRemoteScreen = true;
    },
    handleRemoteStreamRemoved(event) {
      console.log('Remote stream removed. Event: ', event);
    },
    hangup() {
      console.log('Hanging up.');
      this.stop();
      this.sendMessageToServer('bye');
    },
    handleRemoteHangup() {
      console.log('Session terminated.');
      this.stop();
      this.isInitiator = false;
    },
    stop() {
      console.log("stopped")
      this.isStarted = false;
      socket.emit('bye', this.room);

      if (pc) {
        pc.close();
        pc = null;
      }
    },
    dcSendText(message, type) {
      console.log("sending!!!", message, this.dataChannel);
      let obj = {
        "message": message,
        "type": type,
        "timestamp": new Date()
      }
      this.dataChannel.send(JSON.stringify(obj));
      console.log(obj)
      obj.right = true
      this.messages.push(obj);
      app.currentMessage = '';
    },
    shareScreen() {
      console.log("media devices!!!!!")
      navigator.mediaDevices.getDisplayMedia({
        video: true
      })
        .then(mediaStream => {
          // console.log(this.$refs.screenShare)
          // this.$refs.screenShare.srcObject = mediaStream;
          this.screenStream = mediaStream;
          this.screenShare = document.getElementById("screenShare")
          this.screenShare.srcObject = mediaStream;
          // pc.addStream(mediaStream); // tis would add just the screenshare to the remote stream
          this.mergeScreens(); // merge streams as only one stream can be added to the peer connection at a time
        })
        .catch(err => {
          console.error("Error:" + err);
          return null;
        });

    },
    mergeScreens() {
      var merger = new VideoStreamMerger({
        width: this.windowWidth,   // Width of the output video
        height: this.windowHeight,  // Height of the output video
        fps: 30,       // Video capture frames per second
        clearRect: false, // Clear the canvas every frame
        audioContext: null, // Supply an external AudioContext (for audio effects)
      })

      // Add the screen capture. Position it to fill the whole stream (the default)
      merger.addStream(this.screenStream, {
        x: 0, // position of the topleft corner
        y: 0,
        width: merger.width,
        height: merger.height,
        mute: true // we don't want sound from the screen (if there is any)
      })
      // Add the webcam stream. Position it on the bottom left and resize it to 100x100.
      merger.addStream(this.localStream, {
        x: 0,
        y: merger.height - 300,
        width: 300,
        height: 300,
        mute: true
      })
      merger.start()

      pc.addStream(merger.result)

    },
    setRoom(room) {
      console.log()
      if (this.room.length > 0) {
        this.hangup()
      }
      this.currentPage = this.pages.chatting
      this.currentRoom = room;
      this.room = this.currentRoom.name;
      this.joinRoom()
      // if (!this.currentRoom) {
      // this.maybeStart()
      // }

      console.log("app js speaking", this.currentPage, this.currentRoom, this.pages.chatting)
    },
    start() {
      console.log("startingasdasd")
      if (!this.isStarted) {
        this.maybeStart();
      }
    }
  },
  mounted() {
    socket = io.connect();
    // this.room = prompt('Enter room name:');

    // this.joinRoom()
    this.localVideo = this.$refs.localVideo
    this.remoteVideo = this.$refs.remoteVideo
    this.screenShare = this.$refs.screenShare
    // this.testMedia()
    // if (location.hostname !== 'localhost') {
    //   requestTurn(
    //     'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    //   );
    // }
  }
});

//////////////////////////////////////////////Socket io turn server client stuff////////////////////////////////////////////////////////////////////////////////

socket.on('created', function (room) {
  console.log('Created room ' + room);
  app.isInitiator = true;
  console.log(app.isInitiator);

});

socket.on('full', function (room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room) {
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  app.isChannelReady = true;
  // app.maybeStart()
});

socket.on('joined', function (room) {
  console.log('joined: ' + room);
  app.isChannelReady = true;
});

socket.on('log', function (array) {
  // console.log.apply(console, array);
});


////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// This client receives a message
socket.on('message', function (message) {
  // console.log('Client received message:', message);
  if (message === 'got user media') {
    app.maybeStart();
  } else if (message.type === 'offer') {
    if (!app.isInitiator && !app.isStarted) {
      app.maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    app.doAnswer();
  } else if (message.type === 'answer' && app.isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && app.isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message.type === 'bye' && message.room === app.room && app.isStarted) {
    app.handleRemoteHangup();
  }
});

window.onbeforeunload = () => {
  sendMessage({
    type: "bye",
    room: app.room
  });
};


function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in app.pcConfig.iceServers) {
    if (app.pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        app.pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}
