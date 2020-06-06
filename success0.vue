<template>
<article id="page-success" class="page" :class="dark ? 'dark' : null">

  <div v-if="sidebarShow" class="sidebar" :class="dark ? 'dark' : null">

    <div v-if="!mobile" class="icons">
      <i class="material-icons" @click="sidebarShow=false">menu</i>
    </div>
    <div class="icons" v-for="nav in sidebar" :key="nav">
      <i class="material-icons">{{ nav }}</i> {{nav.replace("_", " ")}}
    </div>

  </div>

  <div class="main-bit">
    <header>
      <i class="material-icons solo" :class="dark ? 'dark' : null" @click="sidebarShow=!sidebarShow">menu</i>
      <div class="header-title" :class="dark ? 'dark' : null">
        <i class="material-icons">book</i>
        <span class="title" @click="dark=!dark" style="font-weight: bold; margin-left: 10px;">My digital CV</span>
      </div>
    </header>
    <div class="section-wrapper">
      <div class="main-body" onscroll="logScrollPos()">
        <vs-card v-if="windowWidth < 601" class="section intro animated fadeInUpBig" :class="dark ? 'dark' : null" style="">
          <vs-row class="card-wrapper " vs-align="space-between" vs-justify="space-around">
            <vs-card class="card-image">
              <div class="" slot="media" vs-justify="center" vs-align="center">
                <img :src='getLink("/images/profile.jpeg")'alt="">
              </div>
            </vs-card>
            <vs-card class="remain last">
              <vs-row vs-justify="space-between" vs-align="space-between">

                <vs-row slot="header">
                  <h2>Welcome to my cv</h2>
                </vs-row>

                <vs-row vs-justify="space-between" vs-align="space-between">

                  <vs-card class="wow text empty">
                    <vs-col>
                      <!-- <div>Full Name: Samuel Ademola</div>
                      <div>Email: samuel.ademola43@gmail.com</div> -->
                      <vs-list>
                        <vs-list-header title="My details"></vs-list-header>
                        <vs-list-item title="Full Name:">
                          <div>Samuel Ademola</div>
                        </vs-list-item>
                        <vs-list-item title="Address:">
                          <vs-col vs-align="flex-end" vs-justify="flex-end" style="max-width: 250px; text-align: end;">2 Edenbridge Close, Orpington, Kent, BR5 3SL</vs-col>
                        </vs-list-item>
                        <vs-list-item title="Email:">
                          <div>samuel.ademola43@gmail.com</div>
                        </vs-list-item>
                        <vs-list-item title="Personal No:">
                          <div>074 274 76 129</div>
                        </vs-list-item>
                        <vs-list-item title="Home No:">
                          <div>01684 873 204</div>
                        </vs-list-item>
                      </vs-list>
                    </vs-col>

                  </vs-card>

                </vs-row>
              </vs-row>

            </vs-card>
          </vs-row>
        </vs-card>

        <vs-card class="section empty">

          <vs-row slot="header">
            <h3>About Me</h3>
          </vs-row>
          I am a responsible hard worker who is keen in a career in computing. During my days in education I
          have acquired hard work and perseverance to further myself, which have helped me not just in
          education but also in everyday life.
          <br><br>

          I have learnt how to work with others in group projects and have gained invaluable communication
          skills as well as some useful leadership qualities; I always work in an organised manner and I always
          get work done with plenty of time and I never leave anything to the last minute.
          <br><br>
          I am a keen learner and I am always willing to learn new skills while gaining practical experience.

        </vs-card>


        <vs-card class="section empty my-work">

          <vs-row slot="header">
            <h2>Education</h2>
          </vs-row>

          <vs-card class="education "><h4>Uni degree</h4></vs-card>
          <vs-card class="education "><h4> A Levels</h4></vs-card>
          <vs-card class="education "><h4>GCSE</h4></vs-card>


        </vs-card>


        <vs-card class="section empty my-work">

          <vs-row slot="header">
            <h2>Skills</h2>
          </vs-row>
        </vs-card>
        <vs-card class="section empty my-work">

          <vs-row slot="header">
            <h2>Hobbies</h2>
          </vs-row>

        </vs-card>

        <vs-card class="section empty my-work">

          <vs-row slot="header">
            <h2>Future Prospects</h2>
          </vs-row>
        </vs-card>
        <vs-card class="section empty my-work">

          <vs-row slot="header">
            <h2>My Work</h2>
          </vs-row>
        </vs-card>

        <vs-card class="section employees">

          <vs-row slot="header">
            <h2>Previous Employers</h2>
          </vs-row>


          <div class="img-wrapper">
            <img class="company-img" :src='getLink("/images/event_engineering.png")'alt="">
            <img class="company-img" :src='getLink("/images/carlisle.png")' alt="">
            <img class="company-img" :src='getLink("/images/ays.png")' alt="">
            <img class="company-img" :src='getLink("/images/explore_learning.png")' alt="">
            <img class="company-img" :src='getLink("/images/the-fa.svg")' alt="">
            <img class="company-img" :src='getLink("/images/virocom.png")' alt="">
          </div>
        </vs-card>

        <vs-card class=" section share" :class="dark ? 'dark' : null" style="">
          <vs-row>
            <vs-card class="remain social">

              <vs-row slot="header">
                <i class="material-icons">share</i>
                <h2>Social</h2>
              </vs-row>

              <vs-card class="text empty">
                <vs-col>
                  <vs-list>
                    <vs-list-header title="Contact Me"></vs-list-header>
                    <vs-list-item title="Email:">
                      <div>samuel.ademola43@gmail.com</div>
                    </vs-list-item>
                    <vs-list-item title="LinkedIn:">
                      <div>
                        <vs-chip color="#0073b1">
                          <a href="https://www.linkedin.com/in/samuel-ademola-31b32a76/" target="_blank">@samade123</a>
                        </vs-chip>
                      </div>
                    </vs-list-item>
                    <vs-list-item title="Personal No:">
                      <div>074 274 76 129</div>
                    </vs-list-item>
                  </vs-list>
                </vs-col>
              </vs-card>

            </vs-card>
            <vs-card class="card-image last">
              <vs-row slot="header" style="width: 100%; height: 100%">
                <i class="material-icons">share</i> <span>
                  <h2>Share this page</h2>
                </span>
              </vs-row>
              <!-- <div class="wow animated bounceIn" slot="media"> -->
              <div class="" slot="media">
                <img :src='getLink("/img/qrSvg")' alt="">
              </div>
              <vs-card slot="footer" actionable @click="copyUrl">
                <vs-row slot="header" vs-type="flex" vs-justify="space-between" @click="copyUrl">
                  <div @click="copyUrl">{{url}}</div> <i @click="copyUrl" class="material-icons">file_copy</i>
                </vs-row>
              </vs-card>
            </vs-card>
          </vs-row>
        </vs-card>
      </div>
      <div v-if="windowWidth > 600" class="sidebar left" :class="dark ? 'dark' : null">

        <div class="card">
          <img :src='getLink("/images/profile.jpeg")' alt="">

          <vs-list>
            <vs-list-header title="Contact Me"></vs-list-header>
            <vs-list-item title="Email:">
              <div>samuel.ademola43@gmail.com</div>
            </vs-list-item>
            <vs-list-item title="Address:">
              <vs-col vs-align="flex-end" vs-justify="flex-end" style="max-width: 250px; text-align: end;">2 Edenbridge Close, Orpington, Kent, BR5 3SL</vs-col>
            </vs-list-item>
            <vs-list-item title="LinkedIn:">
              <div>
                <vs-chip color="#0073b1">
                  <a href="https://www.linkedin.com/in/samuel-ademola-31b32a76/" target="_blank">@samade123</a>
                </vs-chip>
              </div>
            </vs-list-item>
            <vs-list-item title="Personal No:">
              <div>074 274 76 129</div>
            </vs-list-item>
          </vs-list>

          <!-- <vs-divider></vs-divider> -->

          <button class="btn btn-primary active">Message Me</button>

        </div>
      </div>
    </div>
  </div>

</article>
</template>

<script>
// import pdf from 'pdfvuer';
import copy from 'copy-to-clipboard';

var qr = require('qr-image')

var parse = require('url-parse')
var http = require('http');

export default {
  data() {
    return {
      production: false,
      sidebar: ['person_pin', 'school', 'lock', 'book'],
      url: window.location.href,
      sidebarShow: true,
      // mobile: window.innerWidth > 600 ? false : true,
      dark: true,
    }
  },
  methods: {
    getLink(request) {

      return this.production ? request : "http://192.168.0.22:3000" + request;

    },
    copyUrl() {
      console.log("copying")
      copy(this.url)
    },
    mobile() {
      console.log(this.windowWidth);
      return this.windowWidth > 600 ? false : true;
    },
    logScrollPos() {
      console.log(document.getElementsByClassName("main-body").scrollTop)
    }
  },
  created() {
    if (this.windowWidth < 601) {
      this.sidebarShow = false;
    }
  },
  mounted() {},
}
</script>
