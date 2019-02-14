<template lang="pug">
.mmp-calculator__results
	ul.mmp-calculator__results-products
		li(v-for="product in recommendedProducts")
			h4 {{ product.name }}
			p {{ product.description }}
			table.mmp-calculator__results-types
				thead
					tr
						th
						th.t-right Interest rate
						th.t-right Maximum Loan
				tbody
					tr(v-for="type in product.types")
						td.type {{ type.type }}
						td.rate.t-right {{ type.interestRate }}
						td.loanAmount.t-right ${{ getLoanAmount( type.interestRate) }}
</template>

<script>

import axios from "axios";

function num( v ){
	if( typeof v === 'string' ){
		v = v.replace(/[^\d\.]/g, '');
	}
	return Number.parseFloat( v );
}

function round( v, places ){
	var exp = Math.pow(10, places);
	return Math.round( v * exp ) / exp;
}

function addCommas( num ){
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

module.exports = {

	props: [
		'values',
		'googleSheetId',
		'googleApiKey',
		'products'
	],

	data: function() {
		return {

		};
	},

	computed : {
		recommendedProducts : function(){

			this.products.filter( product => {

				// decide if this should be included in the list
				console.log( product.firstTimeBuyer, this.values.isFirstTimeBuyer );
				if( product.firstTimeBuyer !== this.values.isFirstTimeBuyer ){
					return false;
				}
				return true;

			}).map( product => {

				return product;
			});
			return this.products;
		},

		monthlyPayment: function(){
			if( !this.values.householdIncome ){
				return false;
			}
			let income = num(this.values.householdIncome);
			let monthlyIncome = income / 12;

			// the recommended amount
			let payment = monthlyIncome * 0.28;
			return round(payment,2);

		}
	},

	methods : {

		getLoanAmount : function( interestRate ){
			var rate = num(interestRate) / 1200.0;
			var power = 1.0;
			for (var i=0; ++i<=( this.values.term * 12 ); power *= (1+rate) ) ;
			return addCommas(Math.round( this.monthlyPayment / (rate/(1-(1/power))) ));
		}

	}
};
</script>

<style lang="scss" scoped>
.mmp-calculator {

	&__results {
		text-align: left;

		ul {
			text-align: left;
			margin: 0;
			padding: 0;
			li {
				padding: 10px;
				list-style: none;
				padding: 0;
				margin: 0;
				text-align: left;
				border: 1px solid #ccc;
				box-shadow: 0 5px 15px rgba(0,0,0,0.1);
				h4 {
					width: auto;
					padding: 0 20px;
					font-size: 18px;
				}
				p {
					width: auto !important;
					padding: 0 20px !important;
					font-size: 13px;
				}
				+ li {
					margin-top: 20px;
				}
			}
		}
	}

	&__results-types {
		text-align: left;
		font-size: 14px;
		width: 100%;
		border-collapse: collapse;
		th {
			text-align: left;
		}
		thead {
			background: #f2f2f2;
		}
		tbody {
			tr {
				border-bottom: 1px solid #f6f6f6;
				&:last-child {
					border-bottom-width: 0;
				}
				&:nth-child(even){
					background: #f8f8f8;
				}
			}
		}
		td,th {
			text-align: left;
			padding: 2px 20px;
			&.t-right{
				text-align: right;
			}
		}
	}

}
</style>
