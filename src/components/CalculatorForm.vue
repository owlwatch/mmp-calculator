<template lang="pug">
form.mmp-calculator__form

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

			.input-wrap.-radios.-fit
				label
					input(type="radio",name="targeted",value="1",v-model="values.targeted")
					span Targeted
				label
					input(type="radio",name="targeted",value="0",v-model="values.targeted")
					span Non-Targeted


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
			span Is this home going to be your primary residence?
			.input-wrap.-radios.-fit
				label
					input(type="radio",name="isPrimaryResidence",value="0",v-model="values.isPrimaryResidence")
					span No
				label
					input(type="radio",name="isPrimaryResidence",value="1",v-model="values.isPrimaryResidence")
					span Yes

	//.mmp-calculator__form-actions
		button.btn.btn-primary.btn-large Calculate

</template>

<script>

const counties = ["Allegany","Anne Arundel","Baltimore","Baltimore City","Calvert","Caroline","Carroll","Cecil","Charles","Dorchester","Frederick","Garrett","Harford","Howard","Kent","Montgomery","Prince George's","Queen Anne's","St. Mary's","Somerset","Talbot","Washington","Wicomico","Worcester"];

module.exports = {
	props: [
		"values"
	],
	data: function() {
		return {
			counties: counties
		};
	},
	computed : {
		json: function(){
			return JSON.stringify( this.$data );
		}
	},

	watch : {
		values: function(){
			// we should emit a change event
			this.emitUpdate();
		}
	},

	created : function(){
		this.emitUpdate();
	},

	methods : {
		emitUpdate : function(){
			this.$emit( 'change' );
		},

		formatNumber : function( e ){
			e.target.value = e.target.value.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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

</style>
