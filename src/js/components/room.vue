<template>
    <div class="room-strip">
        <header class="room-header">
            <!-- <i class="material-icons">meeting_room</i> -->
            <span class="header-text">Rooms</span>
        </header>
        <div v-for="room in rooms" :key="room.name" @click="setRoom(room)" :style="{ background: room == currentRoom ? '#0000000f' : 'transparent' }" class="room-space">
            <vs-avatar icon="meeting_room" :color="room.color" :badge="room == currentRoom && messages.length > 0" />
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
            currentRoom: {},
            rooms: [
                {
                    name: "John",
                    desc: "Hi!!",
                    color: ""
                },
                {
                    name: "Phill",
                    desc: "Hi!!",
                    color: ""
                },
                {
                    name: "YAsmin",
                    desc: "Hi!!",
                    color: ""
                },
                {
                    name: "Richard",
                    desc: "Hi!!",
                    color: ""
                },
                {
                    name: "Liam",
                    desc: "Hi!!",
                    color: ""
                },
            ],
        };
    },
    methods: {
        setRoom(room) {
            this.currentRoom = room;
            this.$emit("room", room);
            // console.log("room: ", room);
            return room;
        },
        // ranHexGen(room) {
        //     const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        //     room.color='#'+randomColor;
        //     return '#'+randomColor
        // },
    },
    created() {
        this.rooms.forEach((room)=> {
            const randomColor = Math.floor(Math.random() * 16777215).toString(16);
            room.color ='#'+randomColor;

        })
    },
    mounted() {},
};
</script>
