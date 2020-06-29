<template>
    <div class="chat-div" @click="log($event)">
        <div v-if="currentState == states.card" class="chat-card">
            <div class="top">
                <div class="profile">
                    <i class="material-icons">meeting_room</i>
                </div>
            </div>
            <div class="bottom">
                <div class="room-func">
                    <div class="room-name">{{ currentRoom.name }}</div>
                    <div class="chip" v-if="!roomOpen"><vs-chip color="danger">Waiting on users to join ...</vs-chip></div>
                    <div class="chip" v-else><vs-chip color="success">Room available</vs-chip></div>
                    <!-- <div class="functions" :style="{opacity: roomOpen ? '1': '0'}"> -->
                    <div class="functions">
                        <div @click="settings = !settings">
                            <i class="material-icons">settings</i>
                        </div>
                        <div @click="changeState(states.video, true)">
                            <i class="material-icons">call</i>
                        </div>
                        <div clas="wow bounceInUp" v-if="roomOpen" @click="changeState(states.video)">
                            <i class="material-icons">videocam</i>
                        </div>
                        <div @click="changeState(states.chat)">
                            <i class="material-icons">message</i>
                        </div>
                    </div>
                </div>
                <transition name="height-drop">
                    <div v-if="settings" class="settings">
                        <div class="video">
                            <video class="video" autoplay playsinline width="250" id="testVideo" ref="testVideo"></video>
                        </div>
                        <vs-list>
                            <vs-list-header title="Media Settings"></vs-list-header>
                            <vs-list-item title="Video Devices">
                                <vs-select v-if="devices.length > 0" class="selectExample" width="220px" v-model="constraints.video">
                                    <vs-select-item :key="index" :value="item.id" :text="item.label" v-for="(item, index) in devices.filter((device) => device.kind == 'video' || device.kind == 'videoinput')" />
                                </vs-select>
                            </vs-list-item>
                            <vs-list-item title="Audio Devices">
                                <vs-select v-if="devices.length > 0" class="selectExample" width="220px" v-model="constraints.audio">
                                    <vs-select-item :key="index" :value="item.id" :text="item.label" v-for="(item, index) in devices.filter((device) => device.kind == 'audio' || device.kind == 'audioinput')" />
                                </vs-select>
                            </vs-list-item>
                        </vs-list>
                    </div>
                </transition>
            </div>
        </div>
        <div v-if="currentState == states.video" class="chat-card">
            <div class="top video-wrapper">
                <div class="main-vid">
                    <video class="video" autoplay playsinline height="100%" id="remoteVideo" ref="remoteVideo"></video>
                </div>
                <div class="quick-glance">
                    <div class="localCam">
                        <video id="localVideo" class="video" autoplay playsinline width="100%" ref="localVideo"></video>
                        <slot></slot>
                        <!-- <div @click="stopCamera">Local Camera</div> -->
                    </div>
                    <div class="localCam">
                        <!-- <video class="video" :src="displayStream ? URL.createObjectURL(displayStream) : false;"  autoplay playsinline height="150px" ref="screenShare"></video> -->
                        <video class="video" autoplay playsinline width="100%" id="screenShare" ref="screenShare"></video>
                        <!-- <div @click="stopCamera">Your Screen</div> -->
                    </div>
                    <!-- </div> -->
                </div>
                <div class="controls">
                    <div class="icons">
                        <button @click="changeState(states.video, true)" class="btn">
                            <i v-if="!noVideo" class="material-icons">videocam</i>
                            <i v-else class="material-icons">videocam_off</i>
                        </button>
                    </div>
                    <div class="icons">
                        <button class="btn" v-if="windowWidth > 600" @click="sharing">Share Screen</button>
                    </div>
                    <!-- <button class="btn" @click="stopCamera">Test Camera</button>
                          <button class="btn" @click="shareScreen">Share Screen</button> -->
                </div>
            </div>
            <div class="bottom">
                <vs-popup title="Accept call?" :active.sync="popUp">
                    <div>Someone is calling you. Do you want to accept</div>
                    <vs-button @click="popUp = false">yes</vs-button>
                </vs-popup>
                <div class="room-func">
                    <div class="room-name">{{ currentRoom.name }}</div>
                    <div class="functions">
                        <i class="material-icons">videocam</i>
                        <i @click="currentState == states.chat" class="material-icons">message</i>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="currentState == states.chat" class="chatting">
            <div class="chat-header">
                <i class="material-icons" @click="changeState(states.card)">arrow_back</i> <vs-avatar color="primary" />
                <div class="chat-title">{{ currentRoom.name }}</div>
            </div>
            <div class="chat-history">
                <div class="chat-wrapper">
                    <div class="chat-msg" v-for="msg in messages" :class="msg.right ? 'right' : false" :key="msg.timestamp">
                        <vs-avatar v-if="!msg.right" :color="currentRoom.color"></vs-avatar>
                        <div class="chat-body" :class="msg.right ? 'right' : false" :style="{ backgroundColor: msg.right ? false : currentRoom.color }">
                            <h4>{{ typeof msg.data === "string" ? JSON.parse(msg.data).message : msg.message }}</h4>
                        </div>
                        <vs-avatar v-if="msg.right" color="#5d5dbf"></vs-avatar>
                    </div>
                </div>
            </div>
            <div class="chat-input">
                <vs-input icon="message" @keyup.enter="send" autofocus :disabled="!showChat" v-model="currentMessage"> </vs-input>
                <vs-button size="small" @click="send">Enter</vs-button>
            </div>
        </div>
        <div class="waiting" v-if="currentState == states.empty" style='background-image: url("site/images/messaging.svg")'></div>
    </div>
</template>

<script>
export default {
    props: {
        messages: {
            type: Array,
        },
        showChat: {
            type: Boolean,
        },
        card: {
            type: Boolean,
        },
        localCamera: {
            type: Object,
        },
        currentRoom: {
            type: Object,
        },
        roomOpen: {
            type: Boolean,
        },
        showVideo: {
            type: Boolean,
        },
    },
    data() {
        return {
            currentMessage: "",
            // chat: false,
            // card: true,
            states: {
                chat: "chatting",
                card: "card",
                empty: "empty",
                video: "video",
            },
            currentState: "empty",
            settings: false,
            devices: [],
            popUp: false,
            constraints: {
                audio: false,
                video: false,
            },
            noVideo: false,
        };
    },
    watch: {
        constraints: {
            deep: true,
            immediate: true,
            handler: "setCamera",
        },
        card() {
            if (this.card) {
                console.log(this.card);
                this.changeState(this.states.card);
            }
        },
        localCamera() {
            console.log("asldpskdpaskopkaspoko");

            if (this.localCamera) {
                console.log(this.localCamera);
                this.$refs.localVideo.srcObject = this.localCamera;
            }
        },
        showVideo() {
            if (this.showVideo) {
                this.changeState(this.states.video);
                // this.popUp=true;
            }
        },
        //   deep: true,
    },
    methods: {
        setCamera() {
            navigator.mediaDevices
                .getUserMedia({
                    video: this.constraints.video ? { deviceId: this.constraints.video } : true,
                    audio: this.constraints.audio ? { deviceId: this.constraints.audio } : true,
                })
                .then((mediaStream) => {
                    if (this.constraints.video == false || this.constraints.video.length == "0") {
                        this.enumerateDevices();
                    }

                    this.testStream = mediaStream;

                    if (this.currentState == this.states.card) {
                        setTimeout(() => {
                            document.getElementById("testVideo").srcObject = mediaStream;
                        }, 500);
                    }
                })
                .catch((e) => {
                    console.error("getUserMedia() error: " + e.name, e);
                });
        },
        log(event) {
            console.debug(event.target);
        },
        send() {
            this.$emit("send", this.currentMessage);
            // this.currentState = this.states.card;
            console.debug("comp send", this.currentMessage);
            setTimeout(() => {
                this.currentMessage = "";
            }, 500);
        },
        changeState(state, switchVideo = false) {
            console.debug("change state: ", state);
            this.currentState = state;
            if (state == this.states.video) {
                if (switchVideo) {
                    this.noVideo = !this.noVideo;
                    console.log("Video stream: ", { video: this.noVideo ? false : this.constraints.video, audio: this.constraints.audio });
                    this.$emit("local", { video: this.noVideo ? false : this.constraints.video, audio: this.constraints.audio });
                } else {
                    this.$emit("local", this.constraints);
                }

                // console.log("kicking off camera");

                // if (this.localCamera) {
                //     console.log(this.localCamera);
                //     this.$refs.localVideo.srcObject = this.localCamera;
                // }
            } else if (state == this.states.chat) {
                console.log("messaging from chatroom");

                this.$emit("message");
            } else if (state == this.states.card) {
                this.settings = true;
                setTimeout(() => {
                    document.getElementById("testVideo").srcObject = this.testStream;

                    this.setCamera();
                }, 2000);
            }
        },
        sharing() {
            this.$emit("sharing");
        },
        enumerateDevices() {
            this.devices = [];
            navigator.mediaDevices
                .enumerateDevices()
                .then((deviceInfos) => {
                    deviceInfos.forEach((deviceInfo) => {
                        console.debug(deviceInfo);
                        this.devices.push({ label: deviceInfo.label, id: deviceInfo.id ? deviceInfo.id : deviceInfo.deviceId, kind: deviceInfo.kind });
                    });
                    this.devices.length > 0 ? (this.constraints.video = this.devices.filter((device) => device.kind == "video" || device.kind == "videoinput")[0].id) : false;
                    this.devices.length > 0 ? (this.constraints.audio = this.devices.filter((device) => device.kind == "audio" || device.kind == "audioinput")[0].id) : false;
                })
                .catch((err) => console.error("Issue with devices", err));
        },
    },
    created() {},
    mounted() {
        this.enumerateDevices();
        if (this.card) {
            console.debug(this.card);
            this.changeState(this.states.card);
        }
        // this.setCamera()
    },
};
</script>
