<template lang="pug">
.mmp-calculator
	template(v-if="initialized")
		.row-fluid
			.col.span6
				calculator-form(
					ref="form",
					:values="values",
					:settings="settings",
					:limits="limits",
					:counties="counties"
					:fields="fields"
					:initialized="initialized"
					@calculate="scrollToResults"
				)
			.col.span6
				results(
					ref="results",
					:fields="fields",
					:values="values",
					:products="products",
					:limits="limits",
					:settings="settings",
					:initialized="initialized"
				)
	.loading(v-else) Loading
</template>

<script>
import CalculatorForm from './CalculatorForm.vue';
import Results from './Results.vue';

import Product from '../models/Product';
import CountyLimit from '../models/CountyLimit';

import axios from "axios";
import copy from "../helpers/copy";
import {tmpl} from "../helpers/functions";

import VTooltip from 'v-tooltip';
import VueClipboard from 'vue-clipboard2';
import Vue from 'vue';

Vue.use(VTooltip);
Vue.use(VueClipboard);

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
				data:{}
			},
			products: [],
			settings: {},
			counties: [],
			limits: [],
			initialized: false,
			copy: copy
		};
	},

	created: function() {

		// lets get the google sheet
		let apiKey = this.googleApiKey;
		let sheetId = this.googleSheetId;
		let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?ranges=Products&ranges=Limits&ranges=Settings&ranges=Copy&ranges=Fields&key=${apiKey}`;

		axios.get(url).then(response => {

			this.parseProducts(response.data.valueRanges[0]);
			this.parseLimits(response.data.valueRanges[1]);
			this.parseSettings(response.data.valueRanges[2]);
			this.parseCopy(response.data.valueRanges[3]);
			this.parseFields(response.data.valueRanges[4]);
			
			// initialized
			this.initialized = true;

		}).catch(error => {

			console.log(error);

		});

		// this.loadProducts();
		// this.loadLimits();
	},
	
	mounted : function(){
		// do we have data from the url?
		if( window.location.hash ){
			try {
				let json = JSON.parse(atob(window.location.hash.replace(/^#/, '')));
				this.values.data = json;
			}
			catch(e){
				// not for us
			}
		}
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
						last.studentDebtProduct = data.studentDebtProduct;
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
		},
		
		parseCopy: function(rangeData) {
			rangeData.values.forEach(row => {
				if (row.length > 1) {
					copy.add(row[0], row[1]);
				}
			});
		},
		
		parseFields: function(rangeData) {
			this.fields = [];
			let keys = false;
			rangeData.values.forEach(row => {
				if( !keys ){
					keys = row;
					return;
				}
				let field = {};
				keys.forEach( (n,i) => {
					field[n] = row[i];
				});
				field.name = field['Variable Name'];
				field.label = tmpl(field['Label'], {}, true );
				if( field['Tooltip'] ){
					field.tooltip = tmpl(field['Tooltip'], {}, true );
				}
				if( field['Description'] ){
					field.description = tmpl(field['Description'], {} );
				}
				this.fields.push( field );
			});
		},
		
		scrollToResults : function(e){
			if( !this.$el ){
				return;
			}
			window.scrollTo( 0, this.$refs.results.$el.offsetTop - 20 );
		}
	}

};
</script>

<style lang="scss">
.mmp-calculator {
	text-align: left;
	margin: 20px 30px;
	@media( min-width: 800px ){
		margin: 20px 60px;
	}
	@media( min-width: 1200px ){
		margin: 20px auto;
		width: 80%;
	}
	line-height: 1.5;
	p {
		width: auto !important;
		padding-left: 0 !important;
	}
	.col {
		margin-bottom: 2em;
	}
	@media( min-width: 768px ){
		.sticky {
			position: sticky;
			top: 10px;
		}
	}
}
.tooltip-icon {
	display: inline-block;
	border-radius: 50%;
	width: 1.1em;
	height: 1.1em;
	text-align: center;
	vertical-align: middle;
	line-height: 1.1em;
	color: #333;
	background-color: #FFC20D;
	&:before {
		font-size: 0.8em;
		content: '?';
	}
	
}
.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: black;
    color: white;
    //border-radius: 16px;
    padding: 8px 14px 7px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: 1%;
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &.popover {
    $color: #f9f9f9;

    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, .1);
    }

    .popover-arrow {
      border-color: $color;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}
</style>
