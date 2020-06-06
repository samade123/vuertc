<template>
    <div class="chat-div">
        <div class="chat-history">
          <div class="chat-msg" v-for="msg in messages" :key="msg.timestamp">
            <h4>{{typeof msg.data === 'string' ? JSON.parse(msg.data).message : msg.message}}</h4>
          </div>
        </div>
        <div class="chat-input">
            <vs-input :disabled="!showChat" v-model="currentMessage"> </vs-input>
            <vs-button @click="send">Enter</vs-button>
        </div>
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
    },
    data() {
        return {
          currentMessage: "",
        };
    },
    methods: {
        send() {
            this.$emit("send", this.currentMessage);
            console.log("comp send", this.currentMessage)
        },
    },
    created() {},
    mounted() {},
};
</script>
