<template>
    <div class="room-strip">
        <div v-for="room in rooms" :key="room.name" @click="setRoom(room)" class="room-space">
            <vs-avatar color="primary" />
            <div class="room-sub-space">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-desc">{{ room.desc }}</div>
            </div>
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
            rooms: [{ name: "John" , desc: "Hi!!"}, { name: "Phill",  desc: "Hi!!" }, { name: "YAsmin",  desc: "Hi!!" }, { name: "Richard",  desc: "Hi!!" }, { name: "Liam",  desc: "Hi!!" }],
        };
    },
    methods: {
        setRoom(room) {
            this.$emit("setRoom", room);
            console.log("comp send",room);
        },
    },
    created() {},
    mounted() {},
};
</script>
