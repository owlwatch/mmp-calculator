<template lang="pug">
form.mmp-calculator__form

	.mmp-calculator__form-group
		label.mmp-calculator__form-label
			span What is the purchase price of the property?
			.input-wrap.-bordered
				span.input-context $
				input.input-number(
					type="text",
					v-model="values.purchasePrice"
					@blur="formatNumber"
				)

	.mmp-calculator__form-group
		label.mmp-calculator__form-label
			span What is your down payment amount?
			.input-wrap.-bordered
				span.input-context $
				input.input-number(
					type="text",
					v-model="values.downPayment"
					@blur="formatNumber"
				)

	.mmp-calculator__form-group
		label.mmp-calculator__form-label
			span Total Household Income
			.input-wrap.-bordered
				span.input-context $
				input.input-number(
					type="text",
					v-model="values.householdIncome"
					@blur="formatNumber"
				)

	.mmp-calculator__form-group
		label.mmp-calculator__form-label
			span Household Size
			.input-wrap.-radios.-fit
				label
					input(type="radio",name="householdSize",value="1",v-model="values.householdSize")
					span 1
				label
					input(type="radio",name="householdSize",value="2",v-model="values.householdSize")
					span 2
				label
					input(type="radio",name="householdSize",value="3+",v-model="values.householdSize")
					span 3+

	.mmp-calculator__form-group
		label.mmp-calculator__form-label
			span Location of purchase property
			.input-wrap
				select(v-model="values.location")
					option(value="",disabled,hidden) Select County
					option(v-for="county in counties") {{ county }}

			.input-wrap.-radios.-fit(v-if="displayTargeting")
				label
					input(type="radio",name="targeted",value="Y",v-model="values.targeted")
					span Targeted
				label
					input(type="radio",name="targeted",value="N",v-model="values.targeted")
					span Non-Targeted

			p.-limits-footnote(v-if="targetingFootnote",v-html="targetingFootnote")


	.mmp-calculator__form-group
		.mmp-calculator__form-label
			span Are you a first-time homebuyer?
			.input-wrap.-radios.-fit
				label
					input(type="radio",name="isFirstTimeBuyer",value="N",v-model="values.isFirstTimeBuyer")
					span No
				label
					input(type="radio",name="isFirstTimeBuyer",value="Y",v-model="values.isFirstTimeBuyer")
					span Yes

	.mmp-calculator__form-group
		.mmp-calculator__form-label
			span Do you have student debt?
			.input-wrap.-radios.-fit
				label
					input(type="radio",name="studentDebt",value="N",v-model="values.hasStudentDebt")
					span No
				label
					input(type="radio",name="studentDebt",value="Y",v-model="values.hasStudentDebt")
					span Yes

	.mmp-calculator__form-group
		.mmp-calculator__form-label
			span Is this home going to be your primary residence?
			.input-wrap.-radios.-fit
				label
					input(type="radio",name="isPrimaryResidence",value="N",v-model="values.isPrimaryResidence")
					span No
				label
					input(type="radio",name="isPrimaryResidence",value="Y",v-model="values.isPrimaryResidence")
					span Yes

	//.mmp-calculator__form-actions
		button.btn.btn-primary.btn-large Calculate

</template>

<script>

import {addCommas} from "../helpers/functions";

module.exports = {
	props: [
		"values",
		"settings",
		"limits"
	],
	data: function() {
		return {

		};
	},
	computed : {
		json: function(){
			return JSON.stringify( this.$data );
		},
		counties : function(){
			return this.limits.map( limit => limit.county );
		},
		displayTargeting : function(){
			let limit = this.limits.find( limit => limit.county === this.values.location );
			return limit && limit.note == "2";
		},
		targetingFootnote : function(){
			let limit = this.limits.find( limit => limit.county === this.values.location );
			if( limit && limit.note === "2" && this.settings ){
				return this.settings["Limits Footnote 2"];
			}
			if( limit && limit.note == "1" && this.settings ){
				return this.settings["Limits Footnote 1"];
			}
			return false;
		}
	},

	methods : {
		formatNumber : function( e ){
			e.target.value = addCommas( e.target.value );
		}
	}
};
</script>

<style lang="scss" scoped>
.mmp-calculator__form {
	&-group {
		+ .mmp-calculator__form-group {
			margin-top: 1.5em;
		}
	}
	&-label {
		font-size: 1rem;
		display: block;
		font-weight: bold;
		> span {
			display: block;
			font-weight: bold;
			margin-bottom: 0.4em;
		}
		> input, > .input-wrap {
			margin-top: 0.5em;
			margin-bottom: 0.333em;
		}
	}

	&-actions {
		margin-top: 10px;
		padding-top: 10px;
	}
}

.row-fluid + .mmp-calculator__form-group {
	margin-top: 1.5em;
}

.input-wrap {
	display: table;
	border-radius: 4px;
	width: 100%;

	&.-fit {
		width: auto;
	}
	> * {
		border: 0;
		vertical-align: middle;
		display: table-cell;
	}
	&.-bordered > * {
		border-top: 1px solid #ccc;
		border-bottom: 1px solid #ccc;
		&:first-child {
			border-radius: 0px 0 0 0px;
			border-left: 1px solid #ccc;
		}
		&:last-child {
			border-radius: 0 0px 0px 0;
			border-right: 1px solid #ccc;
		}
		+ * {
			border-left: 1px solid #ccc;
		}
	}
	> input[type="text"],
	> input[type="number"]{
		padding: 8px 12px;
		font-size: 1.1rem;
		line-height: 1.5;
		margin: 0;
		display: block;
	}
	> select {
		display: block;
		border: 1px solid #ccc;
		font-size: 15px;

	}
	&.-radios {
		margin-left: -10px;
		 > label {
			 font-size: 1rem;
			 padding: 4px 10px;
			 line-height: 1.5;
			 > input {
				 font-size: 1rem;
				 line-height: 1.5;
				 vertical-align: middle;
				 margin-right: 6px;
				 margin-top: -1px;
			 }
		 }
	}
}

.input-context {
	width: 1em;
	padding: 1px .5em;
	text-align: center;
	background: #f6f6f6;
	font-size: 1.1rem;
	color: #888;
}

.input-number {
	width: 7em;
	text-align: left;
}

.-limits-footnote {
	font-size: 12px;
	font-weight: 400;
	padding-left: 0 !important;
	width: auto !important;
}

</style>
