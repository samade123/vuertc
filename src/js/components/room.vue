<template>
<div class="room-strip">
  <header class="room-header">
    <!-- <i class="material-icons">meeting_room</i> -->
    <span class="header-text">Rooms</span>
  </header>
  <div v-for="room in rooms" :key="room.name" @click="setRoom(room)" :style="{background: room == currentRoom ? '#0000000f' : false}" class="room-space">
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
      currentRoom: {},
      rooms: [{
          name: "John",
          desc: "Hi!!"
        },
        {
          name: "Phill",
          desc: "Hi!!"
        },
        {
          name: "YAsmin",
          desc: "Hi!!"
        },
        {
          name: "Richard",
          desc: "Hi!!"
        },
        {
          name: "Liam",
          desc: "Hi!!"
        },
      ],
    };
  },
  methods: {
    setRoom(room) {
      this.currentRoom = room;
      this.$emit("room", room);
      console.log("room: ", room);
      return room
    },
  },
  created() {},
  mounted() {},
};
</script>
