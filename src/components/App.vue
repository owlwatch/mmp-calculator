<template lang="pug">
.mmp-calculator
	.row-fluid
		.col.span6.sticky
			calculator-form(
				ref="form",
				v-bind:values="values"
			)
		.col.span6
			results(
				ref="results",
				v-bind:products="products",
				v-bind:values="values",
				v-bind:googleApiKey="googleApiKey",
				v-bind:googleSheetId="googleSheetId"
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
				borrowerIncome: '60,000',
				householdIncome: '100,000',
				householdSize: "1",
				isFirstTimeBuyer: 'N',
				hasRealEstateAgent: 0,
				isVeteran: 0,
				targeted: 0,
				term: 30,
				isPrimaryResidence: 0,
				location: ''
			},
			products: [],
			counties: []
		};
	},

	created : function(){

		// lets get the google sheet
		let apiKey = this.googleApiKey;
		let sheetId = this.googleSheetId;
		let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?ranges=Products&ranges=Limits&ranges=Settings&key=${apiKey}`;

		axios.get(url).then( response => {

			this.parseProducts( response.data.valueRanges[0] );
			this.parseLimits( response.data.valueRanges[1] );

		}).catch( error => {

			console.log( error );

		});

		// this.loadProducts();
		// this.loadLimits();
	},

	methods : {
		parseProducts: function( rangeData ){

			let keys = null;
			let last = null;
			this.products = [];

			rangeData.values.forEach( row => {
				if( !keys ){
					keys = row;
				}
				else{
					let data = {};
					keys.forEach( (k, i) => {
						data[k] = row[i];
					});
					if( data.name && data.name !== '' && (!last || last.name !== data.name ) ){
						last = new Product( data.name );
						last.description = data.description;
						last.firstTimeBuyer = data.firstTimeBuyer;
						this.products.push( last );
					}
					if( last ){
						last.addType({
							type: data.type,
							interestRate: data.interestRate
						});
					}
				}
			});
		},

		loadLimits: function( rangeData ){

			let keys = null;
			let last = null;
			this.limits = [];

			rangeData.values.forEach( row => {
				if( !keys ){
					keys = row;
				}
				else{
					let data = {};
					keys.forEach( (k, i) => {
						data[k] = row[i];
					});
					if( data.county && data.county !== '' && (!last || last.county !== data.county ) ){
						last = new CountyLimit( data.county );
						last.note = data.note;
						this.limits.push( last );
					}
					if( last ){
						last.addHousehold(
							data.householdSize,
							data
						);
					}
				}
			});

			window.limits = this.limits;

		}
	}

};
</script>

<style lang="scss" scoped>
.mmp-calculator {
    margin: 20px auto;
    width: 80%;
    p {
        width: auto !important;
        padding-left: 0 !important;
    }
		.sticky {
			position: sticky;
			top: 10px;
		}
}
</style>
