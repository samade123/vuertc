<template>
    <div class="chat-div" @click="log($event)">
        <div v-if="currentState == states.card" class="chat-card">
            <div class="top">
                <div class="profile">
                    <i class="material-icons">face</i>
                </div>
            </div>
            <div class="bottom">
                <div class="room-func">
                    <div class="room-name">Room Name</div>
                    <div class="functions">
                        <div @click="settings = !settings">
                            <i class="material-icons">settings</i>
                        </div>
                        <div>
                            <i class="material-icons">call</i>
                        </div>
                        <div @click="changeState(states.video)">
                            <i class="material-icons">videocam</i>
                        </div>
                        <div @click="changeState(states.chat)">
                            <i class="material-icons">message</i>
                        </div>
                    </div>
                </div>
                <transition name="height-drop">
                    <div v-if="settings" class="settings">
                        <vs-list>
                            <vs-list-header title="Video devices"></vs-list-header>
                            <vs-list-item v-for="device in devices" v-if="device.kind == 'video'" :key="device.id" :title="device.label">
                                <vs-radio v-model="settings"></vs-radio>
                            </vs-list-item>
                            <vs-list-header title="Audio devices"></vs-list-header>
                            <vs-list-item v-for="device in devices" v-if="device.kind == 'audio'" :key="device.id" :title="device.label">
                                <vs-radio v-model="settings"></vs-radio>
                            </vs-list-item>
                        </vs-list>
                    </div>
                </transition>
            </div>
        </div>
        <div v-if="currentState == states.video" class="chat-card">
            <div class="top">
                <div class="main-vid">
                            

                    <video class="video" autoplay playsinline width="75%" id="remoteVideo" ref="remoteVideo"></video>
                    <div class="controls">
                        <!-- <button class="btn" @click="stopCamera">Test Camera</button>
                          <button class="btn" @click="shareScreen">Share Screen</button> -->
                    </div>
                </div>
                <div class="quick-glance">
                    <div class="localCam">
                        <video id="localVideo" class="video" autoplay playsinline height="75px" ref="localVideo"></video>
                        <slot></slot>
                        <!-- <div @click="stopCamera">Local Camera</div> -->
                    </div>
                    <div class="localCam">
                        <!-- <video class="video" :src="displayStream ? URL.createObjectURL(displayStream) : false;"  autoplay playsinline height="150px" ref="screenShare"></video> -->
                        <video class="video" autoplay playsinline height="75px" ref="screenShare"></video>
                        <!-- <div @click="stopCamera">Your Screen</div> -->
                    </div>
                    <!-- </div> -->
                </div>
            </div>
            <div class="bottom">
                <div class="room-func">
                    <div class="room-name">Room Name</div>
                    <div class="functions">
                        <i class="material-icons">videocam</i>
                        <i @click="currentState == states.chat" class="material-icons">message</i>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="currentState == states.chat" class="chatting">
            <div class="chat-header"><i class="material-icons" @click="changeState(states.card)">arrow_back</i> <vs-avatar color="primary" /></div>
            <div class="chat-history">
                <div class="chat-msg" v-for="msg in messages" :key="msg.timestamp">
                    <h4>{{ typeof msg.data === "string" ? JSON.parse(msg.data).message : msg.message }}</h4>
                </div>
            </div>
            <div class="chat-input">
                <vs-input icon="message" :disabled="!showChat" v-model="currentMessage"> </vs-input>
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
        };
    },
    watch: {
        card() {
            if (this.card) {
                console.log(this.card);
                this.currentState = this.states.card;
            }
        },
        "localCamera"() {
            console.log("asldpskdpaskopkaspoko");

            if (this.localCamera) {
                console.log(this.localCamera);
                this.$refs.localVideo.srcObject = this.localCamera;
            }
        },
        //   deep: true,
    },
    methods: {
        log(event) {
            console.log(event.target);
        },
        send() {
            this.$emit("send", this.currentMessage);
            // this.currentState = this.states.card;
            console.log("comp send", this.currentMessage);
        },
        changeState(state) {
            console.log("change state: ", state);
            this.currentState = state;
            if (state == this.states.video) {
                this.$emit("local");
                        console.log("kicking off camera");

                setTimeout(() => {
                    if (this.localCamera) {
                        console.log(this.localCamera);
                        this.$refs.localVideo.srcObject = this.localCamera;
                    }
                }, 1000);
            }
        },
    },
    created() {},
    mounted() {
        if (this.card) {
            console.log(this.card);
            this.currentState = this.states.card;
        }
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                console.log(mediaStream.getVideoTracks(), mediaStream.getAudioTracks());
                let devices = [];
                mediaStream.getVideoTracks().forEach((track) => {
                    this.devices.push({ label: track.label, id: track.id, kind: track.kind });
                });
                mediaStream.getAudioTracks().forEach((track) => {
                    this.devices.push({ label: track.label, id: track.id, kind: track.kind });
                });
                console.log(this.devices);

                // this.devices = mediaStream.getVideoTracks();
            })
            .catch((error) => {
                console.log("Issue with devices", error);
            });
    },
};
</script>
