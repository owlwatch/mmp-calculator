import showdown from 'showdown';

const markdown = new showdown.Converter({
	openLinksInNewWindow: true,
	simplifiedAutoLink: true
});

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

const urlRegExp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

export function tmpl( str, vars, inline ){
	let html = markdown.makeHtml(str.replace( /\{([^\}]+)\}/g, (match, v) => {
		v = v.trim().toLowerCase();
		if( vars[v] ){
			return vars[v];
		}
	}));
	
	return !inline ? html : html.replace(/^<p>|<\/p>$/g, '');
}
