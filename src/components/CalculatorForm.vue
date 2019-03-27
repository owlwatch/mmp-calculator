<template lang="pug">
form.mmp-calculator__form(@submit.prevent="calculate")
	.mmp-calculator__form-group(v-for="(field, index) in fields")
		transition(name="forminput")
			label.mmp-calculator__form-label(:data-name="field.name")
				div.mmp-calculator__form-label-text
					span(v-html="field.label")
					span.tooltip-icon(
						v-if="field.tooltip",
						v-tooltip.top-start="{content: field.tooltip, trigger: 'hover click'}",
						@focus="tooltipFocus"
					)
						
					div.mmp-calculator__form-label-description(
						v-if="field.description",
						v-html="field.description"
					)
				
				template(v-if="field.Type == 'Currency'")
					.input-wrap.-bordered
						span.input-context $
						masked-input(
							type="text",
							v-model="formdata[field.name]",
							mask-type="currency"
						)
				
				template(v-else-if="field.Type == 'Yes No Question'")
					.input-wrap.-radios.-fit
						label
							input(type="radio",:name="field.name",value="N",v-model="formdata[field.name]")
							span No
						label
							input(type="radio",:name="field.name",value="Y",v-model="formdata[field.name]")
							span Yes
							
				template(v-else-if="field.Type == 'BuiltIn' && field.name == 'householdSize'")
					.input-wrap.-radios.-fit
						label
							input(type="radio",name="householdSize",value="1",v-model="formdata.householdSize")
							span 1
						label
							input(type="radio",name="householdSize",value="2",v-model="formdata.householdSize")
							span 2
						label
							input(type="radio",name="householdSize",value="3+",v-model="formdata.householdSize")
							span 3+
							
				template(v-else-if="field.Type == 'BuiltIn' && field.name == 'location'")
					.input-wrap
						select(v-model="formdata.location")
							option(value="",disabled,hidden) Select County
							option(v-for="county in counties") {{ county }}

					.input-wrap.-radios.-fit(v-if="displayTargeting")
						label
							input(type="radio",name="targeted",value="Y",v-model="formdata.targeted")
							span Targeted
						label
							input(type="radio",name="targeted",value="N",v-model="formdata.targeted")
							span Non-Targeted

					div.-limits-footnote(v-if="targetingFootnote",v-html="targetingFootnote")
				
	.mmp-calculator__form-actions
		button.mmp-calculator__button(
			type="submit",
			:disabled="calculateButtonDisabled"
		) {{ calculateButtonText }}
		
		button.mmp-calculator__button(
			v-if="showPrintButton",
			type="button",
			@click="print"
		) {{ printButtonText }}
		
		br
			
		.mmp-calculator__share(v-if="showPrintButton")
			label
				span.mmp-calculator__share-label Share your results
				.mmp-calculator__share-input
					input(
						type="text",
						:value="shareableUrl",
						readonly
					)
					a.mmp-calculator__share-btn(
						target="_blank",
						:href="shareableUrl",
						@click="preventDefault",
						v-clipboard:copy="shareableUrl",
						v-clipboard:success="handleCopyStatus",
      			v-clipboard:error="handleCopyStatus",
					) 
						include ../svg/copy-regular.svg
						div.mmp-calculator__copy-message(
							v-html="copyMessage",
							:class="{'animated fadeInUp': !!copyMessage}"
						)
						
					a.mmp-calculator__share-btn(
						target="_blank",
						:href="mailToUrl"
					) 
						include ../svg/email.svg
</template>

<script>
import Vue from 'vue';
import MaskedInput from './MaskedInput.vue';
import {addCommas} from "../helpers/functions";
import copy from "../helpers/copy";

module.exports = {
	
	components: {
		MaskedInput
	},
	
	props: [
		"values",
		"settings",
		"limits",
		"fields"
	],
	
	data: function() {
		return {
			formdata:{},
			copyMessage: ""
		};
	},
	
	created : function(){
		this.formdata = Object.assign({}, this.values.data);
	},
	
	computed : {
		json: function(){
			return JSON.stringify( this.$data );
		},
		counties : function(){
			return this.limits.map( limit => limit.county );
		},
		locationLimit : function(){
			return this.limits.find( limit => limit.county === this.formdata.location );
		},
		displayTargeting : function(){
			let limit = this.limits.find( limit => limit.county === this.formdata.location );
			return limit && limit.note == "2";
		},
		targetingFootnote : function(){
			let limit = this.limits.find( limit => limit.county === this.formdata.location );
			if( limit && limit.note === "2" ){
				return copy.get("Limits Footnote 2");
			}
			if( limit && limit.note == "1" ){
				return copy.get("Limits Footnote 1");
			}
			return false;
		},
		showCalculateButton : function(){
			for( let f of this.fields ){
				if( !this.formdata[f.name] ){
					return false;
				}
			}
			return true;
		},
		showPrintButton : function(){
			return this.showCalculateButton && this.hasCalculated;
		},
		hasCalculated : function(){
			for(var key in this.values.data) {
        if(this.values.data.hasOwnProperty(key)){
          return true;
				}
	    }
			return false;
		},
		calculateButtonText : function(){
			return this.hasCalculated ? 
				copy.get("Recalculate",{},true) :
	    	copy.get("Calculate",{},true);
		},
		calculateButtonDisabled : function(){
			
			for( let field of this.fields ){
				if( this.formdata[field.name] === undefined ){
					return true;
				}
				else if( field.name == 'location' && 
				         this.locationLimit.note === '2' &&
							   this.formdata.targeted === undefined ){
					return true;
				}
			}
			return false;
		},
		printButtonText : function(){
			return copy.get("Print",{},true);
		},
		progressText : function(){
			let count = 0;
			for( let f of this.fields ){
				if( this.showField(f) ){
					count++;
				}
				else {
					break;
				}
			}
			return 'Question '+count+' of '+this.fields.length;
		},
		
		shareableUrl : function(){
			let url = location.protocol+'//'+location.hostname+(location.port?":"+location.port:"")+location.pathname+(location.search?location.search:"");
			url+='#'+(btoa(JSON.stringify(this.values.data)));
			return url;
		},
		
		mailToUrl : function(){
			let subject = encodeURIComponent(copy.get("Email Subject",{},true));
			let url = encodeURIComponent(this.shareableUrl);
			return `mailto:?to=&subject=${subject}&body=${this.shareableUrl}`;
		}
	},
	
	watch : {
		values : function(newVal, oldVal) {
			for( let i in newVal ){
				this.formdata[i] = newVal[i];
			}
			this.$forceUpdate();
			this.calculate();
		}
	},

	methods : {
		formatNumber : function( e ){
			//console.log(e);
			//e.target.value = addCommas( e.target.value );
		},
		
		calculate : function(e){
			this.values.data = Object.assign({}, this.formdata);
			this.$emit('calculate');
		},
		
		showField : function(field){
			for(let i = 0; i<this.fields.length; i++){
				let f = this.fields[i];
				
				if( f !== field && this.formdata[f.name] === undefined ){
					return false;
				}
				else if( f !== field && f.name === 'location' && this.formdata[f.name] ){
					if( this.displayTargeting && this.formdata['targeted'] === undefined ){
						return false;
					}
				}
				else if( f === field ){
					return true;
				}
			}
			return false;
		},
		
		nextButtonDisabled : function(){
			if( !this.$el ){
				return true;
			}
			for( let f in this.fields ){
				console.log( 
					f, 
					this.$el.querySelector('label[data-name="'+f.name+'"]')
				);
				if( this.showField(f) && !this.$el.querySelector('label[data-name="'+f.name+'"]')){
					return true;
				}
			}
			return false;
		},
		
		/**
		 * Go to newly created elements on tab
		 * @param  Event e event
		 * @return void 
		 */
		onTab : function(e){
			if( e.shiftKey ) return;
			
			let selector = 'input,select';
			let input = e.target.closest(selector);
			let group = e.target.closest('.mmp-calculator__form-group');
			
			setTimeout(()=>{
				
				// check for another 
				let all = group.querySelectorAll(selector);
				
				let next = null;
				let getNext = false;
				let curName = false;
				
				for( let i =0; i < all.length; i++ ){
					
					let el = all[i];
					
					if( el === input ){
						getNext = true;
						curName = input.name; 
					}
					
					else if( getNext && (!curName || (el.name !== curName)) ){
						next = el;
						break;
					}
					
				}
				
				if( !next ){
					let nextGroup = group.nextElementSibling;
					if( nextGroup && nextGroup.matches('.mmp-calculator__form-group') ){
						next = nextGroup.querySelector(selector);
					}
				}
			
				if( next ) {
					next.focus();
				}
			},0);
		},
		
		tooltipFocus : function(e){
			e.preventDefault();
		},
		
		print : function(){
			
			window.print();
		},
		
		setData : function( data ){
			this.formdata = data;
			if( !this.nextButtonDisabled ){
				this.calculate();
			}
		},
		
		preventDefault : function(e){
			e.preventDefault();
		},
		
		handleCopyStatus : function(success){
			clearTimeout( this.copyMessageTimeout );
			this.copyMessage = success ? 
				'The link has been copied!' :
				'Press Ctrl+C to copy the link';
				
			this.timeout = setTimeout(()=>{
				this.copyMessage = '';
			}, 3000);
			
		}
	}
};
</script>

<style lang="scss">
.mmp-calculator__form {
	@media print {
		display: flex;
		flex-wrap: wrap;
	}
	&-group {
		@media print {
			width: 50%;
			margin-bottom: 2rem;
		}
		+ .mmp-calculator__form-group {
			margin-top: 1.5em;
			@media print {
				margin-top: 0;
			}
		}
	}
	&-label {
		position: relative;
		font-size: 1rem;
		display: block;
		font-weight: bold;
		&-text {
			display: block;
			font-weight: bold;
			margin-bottom: 0.4em;
		}
		
		
		.tooltip-icon {
			position: absolute;
			left: -1.8em;
			margin-left: 0;
			top: .1em;
		}
		
		
		&-description {
			font-weight: normal;
			p {
				font-size: 14px;
				margin-bottom: 0 !important;
			}
		}
		> input, > .input-wrap {
			margin-top: 0.5em;
			margin-bottom: 0.333em;
		}
	}

	&-actions {
		margin-top: 10px;
		padding-top: 10px;
		@media print {
			display: none;
		}
	}
}

.mmp-calculator__button {
	background: #FFC20D;
	color: #333;
	padding: 10px 40px;
	border: 0;
	font-size: 120%;
	transition: 0.2s background;
	cursor: pointer;
	display: block;
	@media( min-width: 500px ){
		display: inline-block;
	}
	&:hover {
		background: rgba( #ffc20d, 85% );
	}
	&:disabled {
		cursor: default;
		background: rgba(#ffc20d, 40% );
		color: #999;
	}
}
.mmp-calculator__copy-message {
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin-bottom: 10px;
	background: rgba(0,0,0,0.9);
	color: #fff;
	pointer-events: none;
	font-size: 12px;
	white-space: nowrap;
	padding: 2px 10px;
	line-height: 1.5;
	display: none;
	z-index: 2;
}
.mmp-calculator__share {
	display: block;
	margin-top: 20px;
	&-label {
		font-weight: bold;
		display: block;
		margin-bottom: 5px;
	}
	&-input {
		display: flex;
		width: 100%;
		> a,button {
			
		}
		input {
			height: 2.5em;
			padding: 0 6px;
			flex: 1;
			border-radius: 0;
			box-sizing: border-box;
		}
	}
	&-btn {
		position: relative;
		color: #08c;
		display: inline-block;
		height: 2.5em;
		line-height: 2.5em;
		vertical-align: middle;
		text-align: center;
		width: 2.5em;
		padding: 0;
		background: #f2f2f2;
		border: 1px solid #d8d8d8;
		box-sizing: border-box;
		margin-left: -1px;
	}
	svg {
		display: inline-block;
		vertical-align: text-bottom;
		height: 1.2em;
		width: auto;
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
	p {
		font-size: inherit !important;
		line-height: 1.5;
	}
}

</style>

<style lang="scss">
.forminput-enter-active {
  transition: all .3s ease;
}
.forminput-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.forminput-enter, .forminput-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}


@keyframes fadeInUp {
    from {
        transform: translate3d(-50%,15px,0)
    }

    to {
        transform: translate3d(-50%,0,0);
        opacity: 1
    }
}

@-webkit-keyframes fadeInUp {
    from {
        transform: translate3d(-50%,10px,0);
    }

    to {
        transform: translate3d(-50%,0,0);
        opacity: 1;
    }
}

.animated {
	display: block;
    animation-duration: 0.2s;
    animation-fill-mode: both;
    -webkit-animation-duration: 0.2s;
    -webkit-animation-fill-mode: both
}

.animatedFadeInUp {
    opacity: 0
}

.fadeInUp {
    opacity: 0;
    animation-name: fadeInUp;
    -webkit-animation-name: fadeInUp;
}
</style>
