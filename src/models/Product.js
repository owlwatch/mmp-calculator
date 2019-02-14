export default class Product{
	constructor( name ){
		this.name = name;
		this.types = [];
	}

	addType( values ){
		this.types.push(values);
	}
}
