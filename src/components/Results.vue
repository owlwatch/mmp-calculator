<template lang="pug">
.mmp-calculator__results
	template(v-if="hasEnoughInformation")
		h2(
			v-html="eligibleHeading",
			v-tooltip.top-start="eligibleHeadingTooltip"
		)

		.mmp-calculator__results-eligible(v-if="isEligible")
			.mmp-calculator__results-message.-eligible
				div.mmp-calculator__message(v-html="eligibleMessage")

		.mmp-calculator__results-ineligible(v-else)
			.mmp-calculator__results-message.-ineligible(
					v-html="ineligibleMessage"
				)

			div.mmp-calculator__message.-error(
				v-for="reason in ineligibleReasons",
				v-html="reason"
			)

		template(v-if="isEligible")
			h2.-sticky(
				v-html="productsHeading",
				v-tooltip.top-start="productsHeadingTooltip"
			)
			ul.mmp-calculator__results-products
				li(v-for="product in recommendedProducts")
					h4 {{ product.name }}
					p {{ product.description }}
					div.mmp-calculator__results-types-ct
						table.mmp-calculator__results-types(:class="{'-mobile': !useTables}")
							thead(v-if="useTables")
								tr
									th
									th.t-right
										span(
											v-html="interestRateText",
											v-tooltip="{content: interestRateTooltip, trigger: 'hover click'}"
										)
									th.t-right 
										span(
											v-html="monthlyPaymentText",
											v-tooltip="{content: monthlyPaymentTooltip, trigger: 'hover click'}"
										)
									
							tbody
								tr.mmp-calculator__result-type(v-for="type in product.types")
									td.type {{ type.type }}
									td.rate.t-right 
										span.mmp-calculator__result-value {{ type.interestRate }}
										span.mmp-calculator__result-label(v-if="!useTables") Interest Rate
									td.loanAmount.t-right
										span.mmp-calculator__result-value.warn(v-if="warn(getMonthlyPayment( type.interestRate, true ))")
											| ${{ getMonthlyPayment( type.interestRate, true ).amount }}
										span.mmp-calculator__result-value(v-else,:title="JSON.stringify(getMonthlyPayment( type.interestRate, true ))") 
											| ${{ getMonthlyPayment( type.interestRate, true ).amount }}
										span.mmp-calculator__result-label(v-if="!useTables") Monthly Payment<br /><nobr>(P &amp; I)</nobr>
								
							
						
						
	template(v-else)
		div.mmp-calculator__empty-text(v-html="emptyText")
</template>

<script>

import axios from "axios";
import {
	num,
	round,
	addCommas
} from "../helpers/functions";

import copy from "../helpers/copy";

module.exports = {

	props: [
		"values",
		"products",
		"limits",
		"settings",
		"fields"
	],

	data: function() {
		return {
			copy: copy,
			useTables: true
		};
	},
	
	mounted : function(){
		window.addEventListener('resize', this.onResize.bind(this) );
		this.onResize();
	},
	
	beforeDestroy : function(){
		window.removeEventListener('resize', this.onResize.bind(this) );
	},

	computed : {

		recommendedProducts : function(){

			return this.products.filter( product => {

				// decide if this should be included in the list
				if( product.firstTimeBuyer === "Y" && this.vals.isFirstTimeBuyer === "N"){
					return false;
				}
				if( product.studentDebtProduct == "Y" && this.vals.hasStudentDebt === "N" ){
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

			}).sort( (a, b) => {
				if( a.studentDebtProduct == 'Y' && this.vals.hasStudentDebt == 'Y' ){
					return b.studentDebtProduct == 'Y' ? 0 : -1;
				}
				return 1;
			});
		},
		
		vals : function(){
			return this.values.data;
		},

		countyLimit : function(){

			return this.limits.find( limit => {
				return limit.county === this.vals.location;
			});
		},

		householdLimit : function(){
			return this.countyLimit ?
				this.countyLimit.getHousehold( this.vals.householdSize ) :
				false;
		},

		ineligibleReasons : function(){

			let reasons = [];

			if( !this.hasEnoughInformation || !this.limits ) return reasons;

			if( num(this.vals.purchasePrice) < num(this.vals.downPayment) ){
				reasons.push( copy.get( 'Error: Downpayment Amount', {
					downpayment_amount: '$'+addCommas( this.vals.downPayment ),
					purchase_price: '$'+addCommas( this.vals.purchasePrice )
				}));
			}
			
			if( this.vals.isPrimaryResidence == "N" ){
				reasons.push( copy.get( 'Error: Primary Residence',{}) );
			}

			let householdLimit = this.countyLimit.getHousehold( this.vals.householdSize );
			let incomeLimit = householdLimit.getIncomeLimit( this.vals.targeted==="Y" );
			if( num(this.vals.householdIncome) > incomeLimit ){
				reasons.push( copy.get( 'Income Exceeded', {
					downpayment_amount: '$'+addCommas( this.vals.downPayment ),
					purchase_price: '$'+addCommas( this.vals.purchasePrice ),
					household_income: '$'+addCommas( this.vals.householdIncome ),
					income_limit: '$'+addCommas( incomeLimit ),
					county: this.vals.location
				}));
			}

			let maxMortgage = this.countyLimit.getMaxMortgageAmount();
			if( num(this.vals.purchasePrice)-num(this.vals.downPayment) > maxMortgage ){
				
				reasons.push( copy.get( 'Loan Amount Exceeded', {
					loan_amount: '$'+addCommas(num(this.vals.purchasePrice)-num(this.vals.downPayment)),
					maximum_loan_amount: '$'+addCommas( maxMortgage ),
					downpayment_amount: '$'+addCommas( this.vals.downPayment ),
					purchase_price: '$'+addCommas( this.vals.purchasePrice ),
					household_income: '$'+addCommas( this.vals.householdIncome ),
					income_limit: '$'+addCommas( incomeLimit ),
					county: this.vals.location
				}));
			}

			return reasons;

		},

		isEligible : function(){
			return this.ineligibleReasons.length === 0;
		},

		hasEnoughInformation : function(){

			for( let f of this.fields ){
				if( this.vals[f.name] === undefined ){
					return false;
				}
				if( f.name !== 'location' ){
					continue;
				}
				let limit = this.limits.find( limit => limit.county === this.vals.location );
				if( limit && limit.note === "2" && this.vals.targeted === undefined ){
					return false;
				}
			}
			return true;
		},
		
		eligibleHeading : function(){
			return copy.get('Eligible Heading', {}, true );
		},
		
		eligibleHeadingTooltip : function(){
			return copy.get('Eligible Heading Tooltip', {}, true, true);
		},
		
		productsHeading : function(){
			return copy.get('Products Heading', {}, true);
		},
		
		productsHeadingTooltip : function(){
			return copy.get('Products Heading Tooltip', {}, true, true);
		},
		
		eligibleMessage : function(){
			return copy.get("Eligible Message", {
				county: this.vals.location,
				purchase_price: '$'+addCommas( this.vals.purchasePrice ),
				household_income: '$'+addCommas( this.vals.householdIncome ),
				household_size: this.vals.householdSize,
				household_limit: '$'+this.householdLimit.getIncomeLimit( this.values.targeted, true ),
				maximum_mortgage: '$'+this.countyLimit.getMaxMortgageAmount( true )
			});
		},
		
		ineligibleMessage : function(){
			return copy.get("Ineligible Message", {
				county: this.vals.location,
				purchase_price: '$'+addCommas( this.vals.purchasePrice ),
				household_income: '$'+addCommas( this.vals.householdIncome ),
				household_size: this.vals.householdSize,
				household_limit: '$'+this.householdLimit.getIncomeLimit( this.values.targeted, true ),
				maximum_mortgage: '$'+this.countyLimit.getMaxMortgageAmount( true )
			});
		},
		
		interestRateText : function(){
			return copy.get("Interest Rate", {}, true)
		},
		interestRateTooltip : function(){
			return copy.get("Interest Rate Tooltip", {}, true, true);
		},
		
		monthlyPaymentText : function(){
			return copy.get("Monthly Payment", {}, true);
		},
		monthlyPaymentTooltip : function(){
			return copy.get("Monthly Payment Tooltip", {}, true, true);
		},
		
		emptyText : function(){
			return copy.get("Empty Form", {}, false, true);
		}
	},

	methods : {
		
		onResize : function(){
			this.useTables = this.$el.clientWidth > 320;
		},

		getLoanAmount : function( interestRate ){
			var rate = num(interestRate) / 1200.0;
			var power = 1.0;
			for (var i=0; ++i<=( this.vals.term * 12 ); power *= (1+rate) ) ;
			return addCommas(Math.round( this.monthlyPayment / (rate/(1-(1/power))) ));
		},

		getMonthlyPaymentOld: function( interestRate, commas ){

			let principal = num(this.vals.purchasePrice) - num(this.vals.downPayment);
			let interest = num( interestRate ) / 100 / 12;
			let payments = num(this.vals.term) * 12;

			let x = Math.pow( 1 + interest, payments );
			let monthly = ( principal * x * interest ) / ( x - 1 );

			if (!isNaN(monthly) &&  (monthly != Number.POSITIVE_INFINITY) && (monthly != Number.NEGATIVE_INFINITY)) {
				// if we want to know the total paid
				let total = round(monthly * payments);
				let totalInterest = round((monthly * payments) - principal);

				let amount = round(monthly);
				return {
					amount: commas ? addCommas( amount ) : amount,
					
				};
			}

			else {
				return '?';
			}

		},

		getMonthlyPayment: function( interestRate, commas ){

			let P = num(this.vals.purchasePrice) - num(this.vals.downPayment);
			let r = num(interestRate) / 100 / 12;
			let n = 30 * 12;

			//let x = Math.pow( 1 + interest, payments );
			//let monthly = ( principal * x * interest ) / ( x - 1 );
			
			let monthly = P * ( (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) -1) );
			
			if (!isNaN(monthly) &&  (monthly != Number.POSITIVE_INFINITY) && (monthly != Number.NEGATIVE_INFINITY)) {
				// if we want to know the total paid
				let total = round(monthly * n);
				let totalInterest = round((monthly * n) - P);

				let amount = round(monthly);
				return {
					amount: commas ? addCommas( amount ) : amount,
					P,r,n
				};
			}

			else {
				return '?';
			}

		},

		warn : function( monthlyPayment ){
			return monthlyPayment > (this.vals.householdIncome / 12 * ( num(this.settings["Monthly Percentage Of Income"])/100 ) );
		}

	}
};
</script>

<style lang="scss">
.has-tooltip{
	border-bottom: 1px dotted #aaa;
}
.mmp-calculator {

	&__message {
		padding: 0px !important;
		margin: 20px 0;
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
	
	&__empty-text {
		background: #f2f2f2;
		padding: 20px;
		border: 1px solid #d8d8d8;
	}

	&__results {
		text-align: left;
		
		* {
			&:first-child {
				margin-top: 0 !important;
			}
			&:last-child {
				margin-bottom: 0 !important;
			}
		}

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
					&:first-child {
						margin-top: 10px !important;
						margin-bottom: 10px !important;
					}
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
	&__result {
		&-type {
			span {
				line-height: 1.4;
			}
		}
		&-value {
			.-mobile &{
				font-size: 16px;
				font-weight: bold;
			}
		}
		&-label {
			display: block;
			font-size: 12px;
			padding-bottom: 6px;
		}
	}
	&__results-types-ct {
		overflow: hidden;
	}
	&__results-types {
		text-align: left;
		font-size: 14px;
		width: 100%;
		border-top: 1px solid #d8d8d8;
		border-collapse: collapse;
		th {
			text-align: left;
			line-height: 1.4;
		}
		thead {
			background: #f2f2f2;
			tr {
				vertical-align: top;
			}
		}
		tbody {
			tr {
				vertical-align: top;
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
			padding: 2px 15px;
			&.t-right{
				text-align: right;
			}
		}
		&.-mobile {
			tr {
				display: block;
			}
			th,td {
				text-align: center;
				width: 45%;
				padding: 2px 2.5%;
				float: left;
				&:first-child {
					display: block;
					font-weight: bold;
					background: #f6f6f6;
					width: 95%;
					padding: 2px 2.5%;
				}
			}
			th:first-child {
				display: none;
			}
		}
	}

}
</style>
