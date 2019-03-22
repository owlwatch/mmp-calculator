import {tmpl} from './functions';

class Copy {
	constructor(){
		this.strings = {};
	}
	
	add( key, value ){
		this.strings[key] = value;
	}
	
	get( key, vars, inline ){
		let str = this.strings[key];
		if( !str ){
			return key;
		}
		return tmpl( str, vars, inline );
	}
}

const copy = new Copy();

export default copy;
