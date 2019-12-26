<template>
  <div class="box">
    <form v-on:submit.prevent="saveMeasurement">
      <div class="form-field">
        <label for="measurement-names">Measurement</label>
        <select name="measurement-names" id="measurement-names" v-model="measurement">
          <option
            v-for="(measurement, i) in measurements"
            v-bind:value="measurement"
            v-bind:key="i"
          >{{ measurement }}</option>
        </select>
      </div>

      <div class="form-field">
        <label for="measurement-value">Value</label>
        <input id="measurement-value" type="number" v-model="value" min="0" />        
      </div>
      <input class="submission-btn"  type="submit" value="Save Measurement" />
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      measurements: [],
      measurement: "",
      value: ""
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
          range: "DataTypes!B2:B"
        })
        .then(response => {
          response.result.values.forEach(val => {
            this.measurements.push(val[0]);
          });
          this.measurement = this.measurements[0];
        });
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
    saveMeasurement() {
      let date = this.getDate();
      let values = [[date, this.measurement, this.value]];
      gapi.client.sheets.spreadsheets.values
        .append({
          spreadsheetId: this.spreadsheetId,
          range: "Measurements",
          valueInputOption: "RAW",
          resource: { values: values }
        })
        .then(response => {
          this.measurement = this.measurements[0];
          this.value = "";
        });
    }
  }
};
</script>