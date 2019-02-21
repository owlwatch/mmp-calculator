<template lang="pug">
.mmp-calculator__results
	template(v-if="hasEnoughInformation")
		h2 {{ settings["Eligibility Heading"] }}

		.mmp-calculator__results-eligible(v-if="isEligible")
			.mmp-calculator__results-message.-eligible
				p.mmp-calculator__message
					|  {{ settings["Eligible Message"] }} For your
					|  household size, #[strong {{ values.location }}] has a
					|  limit of #[strong ${{ householdLimit.getIncomeLimit( values.targeted, true ) }}]
					|  and a loan limit of #[strong ${{ householdLimit.getMaxMortgageAmount( values.targeted, true ) }}].

		.mmp-calculator__results-ineligible(v-else)
			.mmp-calculator__results-message.-ineligible
			p {{ settings["Ineligible Message"] }}

			p.mmp-calculator__message.-error(v-for="reason in ineligibleReasons") {{ reason }}

		template(v-if="isEligible")
			h2.-sticky {{ settings["Products Heading"] }}
			ul.mmp-calculator__results-products
				li(v-for="product in recommendedProducts")
					h4 {{ product.name }}
					p {{ product.description }}
					table.mmp-calculator__results-types
						thead
							tr
								th
								th.t-right Interest rate
								th.t-right Monthly Payment
						tbody
							tr(v-for="type in product.types")
								td.type {{ type.type }}
								td.rate.t-right {{ type.interestRate }}
								td.loanAmount.t-right
									span.warn(v-if="warn(getMonthlyPayment( type.interestRate, true ))")
										| ${{ getMonthlyPayment( type.interestRate, true ) }}
									span(v-else) ${{ getMonthlyPayment( type.interestRate, true ) }}
	template(v-else)
		p {{ settings["Empty Form"] }}
</template>

<script>

import axios from "axios";
import {
	num,
	round,
	addCommas
} from "../helpers/functions";

module.exports = {

	props: [
		"values",
		"products",
		"limits",
		"settings"
	],

	data: function() {
		return {

		};
	},

	computed : {

		recommendedProducts : function(){

			return this.products.filter( product => {

				// decide if this should be included in the list
				if( product.firstTimeBuyer === "Y" && this.values.isFirstTimeBuyer === "N"){
					return false;
				}
				return true;

			}).map( product => {

				return product;
			}).sort( (a,b) => {
				let aMin = false;
				let bMin = false;
				a.types.forEach( type => {
					let i = num( type.interestRate );
					return aMin = aMin === false ? i : Math.min( 	i, aMin );
				});

				b.types.forEach( type => {
					let i = num( type.interestRate );
					return bMin = bMin === false ? i : Math.min( i, bMin );
				});
				return aMin-bMin;

			});
		},

		countyLimit : function(){

			return this.limits.find( limit => {
				return limit.county === this.values.location;
			});
		},

		householdLimit : function(){
			return this.countyLimit ?
				this.countyLimit.getHousehold( this.values.householdSize ) :
				false;
		},

		ineligibleReasons : function(){

			let reasons = [];

			if( !this.hasEnoughInformation || !this.limits ) return reasons;

			if( num(this.values.purchasePrice) < num(this.values.downPayment) ){
				reasons.push( `It looks like you have an error in the form. The down payment is larger than the purchase price.`);
			}

			let householdLimit = this.countyLimit.getHousehold( this.values.householdSize );
			let incomeLimit = householdLimit.getIncomeLimit( this.values.targeted==="Y" );
			if( num(this.values.householdIncome) > incomeLimit ){
				reasons.push( `Your household income exceeds the maximum allowed income for this county of $${addCommas( incomeLimit )}` );
			}

			let maxMortgage = householdLimit.getMaxMortgageAmount();
			if( num(this.values.purchasePrice)-num(this.values.downPayment) > maxMortgage ){
				reasons.push( `The load amount exceeds the maximum allowed income for this county of $${addCommas( maxMortgage )}` );
			}

			return reasons;

		},

		isEligible : function(){
			return this.ineligibleReasons.length === 0;
		},

		hasEnoughInformation : function(){
			return this.values.purchasePrice &&
				this.values.downPayment &&
				this.values.householdIncome &&
				this.values.householdSize &&
				this.values.location;

		}
	},

	methods : {

		getLoanAmount : function( interestRate ){
			var rate = num(interestRate) / 1200.0;
			var power = 1.0;
			for (var i=0; ++i<=( this.values.term * 12 ); power *= (1+rate) ) ;
			return addCommas(Math.round( this.monthlyPayment / (rate/(1-(1/power))) ));
		},

		getMonthlyPayment: function( interestRate, commas ){

			let principal = num(this.values.purchasePrice) - num(this.values.downPayment);
			let interest = num( interestRate ) / 100 / 12;
			let payments = num(this.values.term) * 12;

			let x = Math.pow( 1 + interest, payments );
			let monthly = ( principal * x * interest ) / ( x - 1 );

			if (!isNaN(monthly) &&  (monthly != Number.POSITIVE_INFINITY) && (monthly != Number.NEGATIVE_INFINITY)) {
				// if we want to know the total paid
				let total = round(monthly * payments);
				let totalInterest = round((monthly * payments) - principal);

				let amount = round(monthly);
				return commas ? addCommas( amount ) : amount;
			}

			else {
				return '?';
			}

		},

		warn : function( monthlyPayment ){
			return monthlyPayment > (this.values.householdIncome / 12 * ( num(this.settings["Monthly Percentage Of Income"])/100 ) );
		}

	}
};
</script>

<style lang="scss" scoped>
.mmp-calculator {

	&__message {
		padding: 0px !important;
		margin: 10px 0;
		+ & {
			margin-top: 10px;
		}
		&.-error {
			padding: 15px !important;
			border: 1px solid #ed1c24;
			background-color: rgba( #ed1c24, 0.1 );
		}
	}

	strong {
		font-weight: bold !important;
	}

	&__results {
		text-align: left;

		h2 {
			width: auto;
			padding-left: 0;
			text-align: center;
			margin-bottom: 1em;
			padding-top: 0.4em;
			padding-bottom: 0.4em;
			border-left: 2px solid #FFC20D;
			background: rgba(#FFC20D, 0.25);
			padding-left: 10px;
		}

		p {
			width: auto !important;
			padding-left: 0 !important;
			font-size: 15px;
		}

		&-ineligible {

		}

		&-products {
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
					margin-bottom: 0.75em;
					font-size: 18px;
				}
				p {
					width: auto !important;
					padding: 0 20px !important;
					font-size: 13px;
				}
				+ li {
					margin-top: 40px;
				}
			}
		}
	}

	&__results-types {
		text-align: left;
		font-size: 14px;
		width: 100%;
		border-top: 1px solid #d8d8d8;
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
