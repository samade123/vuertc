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

window.Images = require("./testing/images")
var socket;
var pc;
var turnReady;


//instantiate page vue
var app = new Vue({
  el: 'main',
  data: {
    currentRoom: false,
    test: false,
    mediaStreamConstraints: {
      video: true,
    },
    messages: [{ data: '{"message":"asdsadasd","timestamp":"2020-06-06T13:10:59.326Z"}', timestamp: 341413, }],
    currentMessage: "",
    pages: {
      header: "header",
      chatting: "chatting",
    },
    currentPage: "header",
    isChannelReady: false,
    isInitiator: false,
    isStarted: false,
    pcConfig: {
      'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
      }]
    },
    sdpConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    },
    room: '',
    message: false,
    displayStream: false,
    localStream: {},
  },
  watch: {
  },
  methods: {
    testMedia() { //this checks camera lsit
      navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
        .then(this.gotLocalMediaStream).catch(this.handleLocalMediaStreamError);
    },
    gotLocalMediaStream(mediaStream) { //this sets the lcal video
      console.log('Getting user media with constraints', this.mediaStreamConstraints);

      this.localStream = mediaStream;
      // this.localStream = null;
      // this.localStream = mediaStream;
      setTimeout(() => {
        this.localVideo = document.getElementById("localVideo")
        console.log(this.localVideo)

        this.localVideo.srcObject = this.localStream;
      }, 1000);

      this.sendMessageToServer('got user media');
      if (this.isInitiator) {
        this.maybeStart();
      }
    },
    handleLocalMediaStreamError(e) {
      console.log('getUserMedia() error: ' + e.name, e);
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
        console.log('Attempted to create or  join room', this.room);
      }
    },
    sendMessageToServer(message) {
      console.log('Client sending message: ', message);
      socket.emit('message', message);
    },
    maybeStart() {
      console.log('>>>>>>> maybeStart() ', this.isStarted, this.localStream, this.isChannelReady);
      if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
        console.log('>>>>>> creating peer connection');
        this.createPeerConnection();
        pc.addStream(this.localStream);
        this.isStarted = true;
        console.log('isInitiator', this.isInitiator);
        if (this.isInitiator) {
          console.log('Creating Data Channel');
          this.dataChannel = pc.createDataChannel('photos');
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
        this.messages.push(event)
      };
    },
    createPeerConnection() {
      try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = this.handleIceCandidate;
        pc.onaddstream = this.handleRemoteStreamAdded;
        pc.onremovestream = this.handleRemoteStreamRemoved;
        pc.onnegotiationneeded = this.renegotiate;
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
      console.log("renogiating")
      // if (this.isInitiator){
      pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
      // }
    },
    setLocalAndSendMessage(sessionDescription) {
      pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.sendMessageToServer(sessionDescription);
    },
    onCreateSessionDescriptionError(error) {
      trace('Failed to create session description: ' + error.toString());
    },
    handleRemoteStreamAdded(event) {
      console.log('Remote stream added.', event);
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", this.remoteStream)
      if (this.test) {
        this.remoteScreen = event.stream;
        this.screenShare.srcObject = this.remoteScreen;
      }
      else {
        this.remoteVideo = document.getElementById("remoteVideo")
        this.remoteStream = event.stream;
        this.remoteVideo.srcObject = this.remoteStream;
      }

      this.test = true;
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
      stop();
      this.isInitiator = false;
    },
    stop() {
      console.log("stopped")
      this.isStarted = false;
      if (pc) {
        pc.close();
        pc = null;
      }
    },
    dcSendText(message) {
      console.log("sending!!!", message, this.dataChannel);
      let obj = {
        "message": message,
        "timestamp": new Date()
      }
      this.dataChannel.send(JSON.stringify(obj));
      console.log(obj)
      this.messages.push(obj);
      app.currentMessage = '';
    },
    shareScreen() {
      navigator.mediaDevices.getDisplayMedia({
        video: true
      })
        .then(mediaStream => {
          console.log(this.$refs.screenShare)
          this.$refs.screenShare.srcObject = mediaStream;
          pc.addStream(mediaStream);
        })
        .catch(err => { console.error("Error:" + err); return null; });

    },
    setRoom(room) {
      console.log()
      if (this.room.length > 0  ) {
        this.hangup()
      }
      this.currentPage = this.pages.chatting
      this.currentRoom = room;
      this.room = this.currentRoom.name;
      this.joinRoom()
      this.maybeStart()

      console.log("app js speaking", this.currentPage, this.currentRoom, this.pages.chatting)
    }
  },
  mounted() {
    socket = io.connect("http://localhost:8887");
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
});

socket.on('joined', function (room) {
  console.log('joined: ' + room);
  app.isChannelReady = true;
});

socket.on('log', function (array) {
  console.log.apply(console, array);
});


////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// This client receives a message
socket.on('message', function (message) {
  console.log('Client received message:', message);
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
  sendMessage({ type: "bye", room: app.room });
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
