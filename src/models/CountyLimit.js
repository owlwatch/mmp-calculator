import {num} from "../helpers/functions";

class HouseholdLimit {
	constructor( values ){
		this.values = values;
	}

	getIncomeLimit( targeted ){
		return num(targeted ? (this.values.incomeTargeted || this.values.incomeNonTargeted) :
			(this.values.incomeNonTargeted || this.values.incomeTargeted));
	}

	getAcquisition( targeted ){
		return num(targeted ? (this.values.acquisitionTargeted || this.values.acquisitionNonTargeted ) :
			(this.values.acquisitionNonTargeted || this.values.acquisitionTargeted));
	}

	getMaxMortgageAmount(){
		return num(this.values.maxMortgageAmount);
	}
}

export default class CountyLimit {
	constructor( county ){
		this.county = county;
		this.households = {};
	}

	getHousehold( n ){
		if( n === '3+'){
			return this.households['3+'];
		}
		return this.households['1-2'];
	}

	addHousehold( household, values ){
		let householdLimit = new HouseholdLimit( values );
		this.households[household] = householdLimit;
	}
}
