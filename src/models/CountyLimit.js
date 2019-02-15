import {
	num,
	addCommas
} from "../helpers/functions";

class HouseholdLimit {
	constructor( values ){
		this.values = values;
	}

	getIncomeLimit( targeted, commas ){
		let v = num(targeted ? (this.values.incomeTargeted || this.values.incomeNonTargeted) :
			(this.values.incomeNonTargeted || this.values.incomeTargeted));

		return commas ? addCommas( v ) : v;
	}

	getAcquisition( targeted, commas ){

		let v = num(targeted ? (this.values.acquisitionTargeted || this.values.acquisitionNonTargeted ) :
			(this.values.acquisitionNonTargeted || this.values.acquisitionTargeted));

		return commas ? addCommas( v ) : v;
	}

	getMaxMortgageAmount( commas ){
		let v = num(this.values.maxMortgageAmount);
		return commas ? addCommas( v ) : v;
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
