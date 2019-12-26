<template>
  <div>
    <select name="exercise-names" id="exercise-names" v-model="exercise">
      <option v-for="(exercise, i) in exercises" v-bind:value="exercise" v-bind:key="i">{{ exercise }}</option>
    </select>

    <label for="weight">Weight</label>
    <input id="weight" type="number" v-model="weight" min="0" />

    <p>Sets</p>

    <form v-on:submit.prevent="addSet">
      <input type="text" v-model="newSet" />
      <input type="submit" value="add" />
    </form>

    <ul>
      <li v-for="(set, i) in sets" v-bind:key="i">
        <span>{{ set }}</span>
        <button v-on:click="removeSet(i)">x</button>
      </li>
    </ul>

    <button v-on:click="saveExercise">Save Exercise</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      exercises: [],
      exercise: "",
      weight: 0,
      sets: [],
      newSet: "",
    };
  },
  props: {
    spreadsheetId: String
  },
  mounted() {
    this.retrieveValues();
  },
  methods: {
    retrieveValues() {
      gapi.client.sheets.spreadsheets.values
        .get({
          spreadsheetId: this.spreadsheetId,
          range: "DataTypes!A2:A"
        })
        .then(response => {
          response.result.values.forEach(val => {
            this.exercises.push(val[0]);
          });
          this.exercise = this.exercises[0]
        });
    },
    addSet() {
      this.sets.push(this.newSet);
      this.newSet = "";
    },
    removeSet(i) {
      this.sets.splice(i, 1);
    },
    getDate() {
      var today = new Date();
      var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      var time = today.getHours() + ":" + today.getMinutes();
      return date + " " + time;
    },
    saveExercise() {
      let date = this.getDate();
      let values = [[date, this.exercise, this.weight, this.sets.toString()]]
      gapi.client.sheets.spreadsheets.values
        .append({
          spreadsheetId: this.spreadsheetId,
          range: "Exercises",
          valueInputOption: "RAW",
          resource: {values: values}
        })
        .then(response => {
          this.exercise = this.exercises[0]
          this.weight = ''
          this.sets = []
        });
    }
  }
};
</script>