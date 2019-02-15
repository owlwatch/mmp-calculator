
export function num( v ){
	if( typeof v === 'string' ){
		v = v.replace(/[^\d\.]/g, '');
	}
	return Number.parseFloat( v );
}

export function round( v, places ){
	if( !places ) return Math.round( v );
	var exp = Math.pow(10, places);
	return Math.round( v * exp ) / exp;
}

export function addCommas( num ){
	return num.toString().replace(/,/g,'').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
