<template>
  <div>
    <h1>RepRoll</h1>

    <button v-if="spreadsheetId" v-on:click="clear">Clear</button>
    <div>{{ spreadsheetId }}</div>

    <div v-if="signedIn !== null">
       <!--Add buttons to initiate auth sequence and sign out-->
      <button v-on:click="authorize" v-if="!signedIn">Authorize</button>
      <button v-on:click="signout" v-if="signedIn">Sign Out</button>
    </div>   

    <setup v-if="signedIn && !spreadsheetId" v-on:finished="retrieveSheet"></setup>

    <div v-if="signedIn && spreadsheetId">      
      <exercise-recorder v-bind:spreadsheetId="spreadsheetId"></exercise-recorder>
      <hr>
      <measurement-recorder v-bind:spreadsheetId="spreadsheetId"></measurement-recorder>
    </div>
  </div>
</template>

<script>
import Setup from './Setup'
import ExerciseRecorder from "./ExerciseRecorder";
import MeasurementRecorder from "./MeasurementRecorder";
// Client ID and API key from the Developer Console
const CLIENT_ID = process.env.CLIENT_ID;
const API_KEY = process.env.API_KEY;

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

export default {
  components: {
    Setup,
    ExerciseRecorder,
    MeasurementRecorder
  },
  
  data() {
    return {
      spreadsheetId: '',
      signedIn: null,
      workout: ''
    }
  },

  mounted() {
    this.initiateGoogleApi();
  },

  methods: {
    clear(){
      window.localStorage.clear();
      this.retrieveSheet();
    },
    loadGoogleApi() {
      return new Promise((resolve, reject) => {
        let script = document.createElement("script");
        script.setAttribute("src", "https://apis.google.com/js/api.js");
        script.async = true;

        script.onload = () => {
          resolve();
        };

        document.head.appendChild(script);
      });
    },

    async initiateGoogleApi() {
      try {
        await this.loadGoogleApi();
        this.handleClientLoad();
      } catch (err) {
        console.log(err);
      }
    },

    handleClientLoad() {
      gapi.load("client:auth2", this.initClient);
    },

    initClient() {
      let self = this
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        })
        .then(
          function() {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(self.updateSigninStatus);

            // Handle the initial sign-in state.
            self.updateSigninStatus(
              gapi.auth2.getAuthInstance().isSignedIn.get()
            );
          },
          function(error) {
            console.log(error)
          }
        );
    },

    updateSigninStatus(isSignedIn) {
      this.signedIn = !!isSignedIn
      if(isSignedIn) this.retrieveSheet()
    },

    authorize(event) {
      gapi.auth2.getAuthInstance().signIn();
    },

    signout(event) {
      gapi.auth2.getAuthInstance().signOut();
    },   
    
    retrieveSheet() {
      this.spreadsheetId = window.localStorage.getItem(this.$sheetKey)
    }
  }
};
</script>