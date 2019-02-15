<template lang="pug">
.mmp-calculator
	.row-fluid
		.col.span6.sticky
			calculator-form(
				ref="form",
				:values="values",
				:settings="settings",
				:limits="limits",
				:counties="counties"
			)
		.col.span6
			results(
				ref="results",
				:values="values",
				:products="products",
				:limits="limits",
				:settings="settings",
			)
</template>

<script>
import CalculatorForm from './CalculatorForm.vue';
import Results from './Results.vue';

import Product from '../models/Product';
import CountyLimit from '../models/CountyLimit';

import axios from "axios";

module.exports = {

	components: {
		CalculatorForm,
		Results
	},

	props: [
		"googleApiKey",
		"googleSheetId"
	],

	data: function() {
		return {
			name: "MMP Mortgage Calculator",
			values: {
				householdIncome: "100,000",
				householdSize: "1",
				purchasePrice: "300,000",
				downPayment: "60,000",
				isFirstTimeBuyer: "Y",
				isVeteran: "N",
				hasStudentDebt: "N",
				targeted: "N",
				term: 30,
				isPrimaryResidence: "Y",
				location: ""
			},
			products: [],
			settings: {},
			counties: [],
			limits: []
		};
	},

	created: function() {

		// lets get the google sheet
		let apiKey = this.googleApiKey;
		let sheetId = this.googleSheetId;
		let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?ranges=Products&ranges=Limits&ranges=Settings&key=${apiKey}`;

		axios.get(url).then(response => {

			this.parseProducts(response.data.valueRanges[0]);
			this.parseLimits(response.data.valueRanges[1]);
			this.parseSettings(response.data.valueRanges[2]);

		}).catch(error => {

			console.log(error);

		});

		// this.loadProducts();
		// this.loadLimits();
	},

	methods: {
		parseProducts: function(rangeData) {

			let keys = null;
			let last = null;
			this.products = [];

			rangeData.values.forEach(row => {
				if (!keys) {
					keys = row;
				} else {
					let data = {};
					keys.forEach((k, i) => {
						data[k] = row[i];
					});
					if (data.name && data.name !== '' && (!last || last.name !== data.name)) {
						last = new Product(data.name);
						last.description = data.description;
						last.firstTimeBuyer = data.firstTimeBuyer;
						this.products.push(last);
					}
					if (last) {
						last.addType({
							type: data.type,
							interestRate: data.interestRate
						});
					}
				}
			});
		},

		parseLimits: function(rangeData) {

			let keys = null;
			let last = null;
			this.limits = [];
			this.counties = [];

			rangeData.values.forEach(row => {
				if (!keys) {
					keys = row;
				} else {
					let data = {};
					keys.forEach((k, i) => {
						data[k] = row[i];
					});
					if (data.county && data.county !== '' && (!last || last.county !== data.county)) {
						last = new CountyLimit(data.county);
						last.note = data.note;
						this.limits.push(last);
						this.counties.push(data.county);
					}
					if (last) {
						last.addHousehold(
							data.householdSize,
							data
						);
					}
				}
			});
		},

		parseSettings: function(rangeData) {
			this.settings = {};
			rangeData.values.forEach(row => {
				if (row.length > 1) {
					this.settings[row[0]] = row[1];
				}
			});
		}
	}

};
</script>

<style lang="scss" scoped>
.mmp-calculator {
	margin: 20px auto;
	width: 80%;
	line-height: 1.5;
	p {
		width: auto !important;
		padding-left: 0 !important;
	}
	.col {
		margin-bottom: 2em;
	}
	@min-width(768px) {
		.sticky {
			position: sticky;
			top: 10px;
		}
	}
}
</style>
