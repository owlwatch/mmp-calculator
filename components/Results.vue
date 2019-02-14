<template lang="pug">
.mmp-calculator__results
	ul
		li(v-for="product in recommendedProducts")
			h4 {{ product.name }} ({{ product.type }})
			.rate {{ product.interestRate }}
			.loanAmount {{ product.loanAmount }}
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
				return true;

			}).map( product => {
				product.loanAmount = this.getLoanAmount( product.interestRate );
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

</style>
