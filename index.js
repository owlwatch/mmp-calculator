import Vue from 'vue';
import App from './components/App.vue';

function init(){
	let nodes = document.querySelectorAll('[data-component="mmp-mortgage-calculator"]');
	nodes.forEach( node => {
		if( node.calculator ){
			return;
		}
		else {
			window.calculator = new Vue({
			  el: node,
			  render: function(h){
				  return h(App, {
					  props: {
						  googleSheetId: node.dataset.googleSheetId,
						  googleApiKey: node.dataset.googleApiKey
					  }
				  })
			  }
			});
		}
	});
}

init();
