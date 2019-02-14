class HouseholdLimit {
	constructor( values ){
		this.values = values;
	}

	getIncomeLimit( targeted ){
		return targeted ? this.values.incomeTargeted : 
			(this.values.incomeNonTargeted || this.values.incomeTargeted);
	}

	getAcquisition( targeted ){
		console.log( targeted );
		return targeted ? this.values.acquisitionTargeted :
			(this.values.acquisitionNonTargeted || this.values.acquisitionTargeted);
	}

	getMaxMortgageAmount(){
		return this.values.maxMortgageAmount;
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
		console.log( householdLimit );
		this.households[household] = householdLimit;
	}
}
