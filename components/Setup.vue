<template>
  <div id="setup" class="box">
    <div v-if="!created">
      <button v-on:click="createSheet">Create a new Record</button>
      <p>or</p>
      <form v-on:submit.prevent="setSheet(existingSheet)">
        <input type="text" placeholder="Use an existing one" v-model="existingSheet" />
        <input type="submit" value="use" />
      </form>
    </div>

    <div v-else>
      <p>Add some exercises</p>
      <form v-on:submit.prevent="addExercise">
        <input type="text" v-model="newExercise" />
        <input type="submit" value="add" />
      </form>

      <ul>
        <li v-for="(exercise, i) in exercises" v-bind:key="i">
          <span>{{ exercise }}</span>
          <button class="delete-btn" v-on:click="removeExercise(i)">x</button>
        </li>
      </ul>

      <hr />

      <p>Add some other measurements you want to record</p>
      <form v-on:submit.prevent="addMeasurement">
        <input type="text" v-model="newMeasurement" />
        <input type="submit" value="add" />
      </form>

      <ul>
        <li v-for="(measurement, i) in measurements" v-bind:key="i">
          <span>{{ measurement }}</span>
          <button v-on:click="removeMeasurement(i)">x</button>
        </li>
      </ul>

      <button class="submission-btn" v-on:click="saveAndFinish">Finished</button>
      <p class="sub-text">Don't worry, you can always add more later</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newSheet: true,
      created: false,
      existingSheet: "",
      exercises: [],
      measurements: [],
      newExercise: "",
      newMeasurement: ""
    };
  },
  methods: {
    createSheet() {
      let self = this;
      gapi.client.sheets.spreadsheets
        .create({
          properties: {
            title: "My RepRoll Record"
          }
        })
        .then(response => {
          self.setSheet(response.result.spreadsheetId);
        });
    },
    setSheet(spreadsheetId) {
      window.localStorage.setItem(this.$sheetKey, spreadsheetId);
      this.created = true;
    },
    addExercise() {
      this.exercises.push(this.newExercise);
      this.newExercise = "";
    },
    removeExercise(i) {
      this.exercises.splice(i, 1);
    },
    addMeasurement() {
      this.measurements.push(this.newMeasurement);
      this.newMeasurement = "";
    },
    removeMeasurement(i) {
      this.measurements.splice(i, 1);
    },
    saveAndFinish() {
      this.formatSheet();
      this.$emit("finished");
    },
    async formatSheet() {
      let spreadsheetId = window.localStorage.getItem(this.$sheetKey);
      let self = this;
      var requests = [];
      // Change the spreadsheet's title.
      requests.push({
        updateSheetProperties: {
          properties: {
            title: "Exercises"
          },
          fields: "title"
        }
      });

      try {
        let measurements = await gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: "Measurements"
        });

        let names = await gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: "DataTypes"
        });

        if (measurements && names) this.newSheet = false;
      } catch (err) {
        // Add sheet
        requests.push({
          addSheet: {
            properties: {
              sheetId: 2,
              title: "Measurements"
            }
          }
        });

        // Add sheet
        requests.push({
          addSheet: {
            properties: {
              sheetId: 3,
              title: "DataTypes"
            }
          }
        });
      }

      if (this.newSheet) {
        let batchUpdateRequest = { requests: requests };
        await gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          resource: batchUpdateRequest
        });

        // Set column headers
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: "Exercises!1:1",
          valueInputOption: "RAW",
          resource: {
            majorDimension: "ROWS",
            values: [["Date", "Exercise", "Weight", "Sets"]]
          }
        });

        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: "Measurements!1:1",
          valueInputOption: "RAW",
          resource: {
            majorDimension: "ROWS",
            values: [["Date", "Measurement", "Value"]]
          }
        });
      }

      // Set Exercise/Measurement Names
      let exerciseValues = ["Exercises"].concat(self.exercises);
      let exerciseData = {
        range: "DataTypes!A:A",
        majorDimension: "COLUMNS",
        values: [exerciseValues]
      };
      let measurementValues = ["Measurements"].concat(self.measurements);
      let measurementData = {
        range: "DataTypes!B:B",
        majorDimension: "COLUMNS",
        values: [measurementValues]
      };

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: exerciseData.range,
        valueInputOption: "RAW",
        resource: exerciseData
      });

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: measurementData.range,
        valueInputOption: "RAW",
        resource: measurementData
      });
    }
  }
};
</script>