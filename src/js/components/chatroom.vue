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
                <div v-if="settings" class="settings">
                    {{ devices }}
                </div>
            </div>
        </div>
        <div v-if="currentState == states.video" class="chat-card">
            <div class="top">
                <div class="main-vid">
                    <video class="video" autoplay playsinline width="630" height="470" ref="remoteVideo"></video>
                    <div class="controls">
                        <!-- <button class="btn" @click="stopCamera">Test Camera</button>
                          <button class="btn" @click="shareScreen">Share Screen</button> -->
                    </div>
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
                <vs-input :disabled="!showChat" v-model="currentMessage"> </vs-input>
                <vs-button @click="send">Enter</vs-button>
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
        }
    },
    data() {
        return {
            currentMessage: "",
            chat: false,
            card: true,
        };
    },
    methods: {
        send() {
            this.$emit("send", this.currentMessage);
            console.log("comp send", this.currentMessage);
        },
    },
    created() {},
    mounted() {},
};
</script>
