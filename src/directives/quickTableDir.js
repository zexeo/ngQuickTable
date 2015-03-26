ngQT.directive('quickTable',function(){
	
	var directiveObj = {
		restrict: "E",
		replace:true,
		compile:function(tElm,attr){
			var inner = tElm[0].innerHTML;
			var tpl;
			// add all attributes to it;
			if('href' in attr){
				tpl = '<a class="uac-button" __attr__>__replaceme__</a>';
			}else{
				tpl = '<button class="uac-button" __attr__>__replaceme__</button>'
			}

			var topElm = tpl.match(/^\<.+?\>/);
			if(!topElm || !topElm[0]) throw new TypeError('invalid tpl string, it must have a top level element');
			
			// attributes
			var attributes = '';
			for(var aa in attr ){
				if(!attr.hasOwnProperty(aa) || ['$attr','$$element'].indexOf(aa)>=0){
					continue;
				}
				// if this attribute already exitst
				var attrIndex = topElm[0].indexOf( aa+'="');
				if(  attrIndex > -1  ){ 
					tpl = tpl.replace(aa+'="', aa+'="'+ attr[aa]+ ' ');
				}else {
					attributes += aa+'="'+attr[aa]+'"';	
				}
				
			}

			var innerNodes = stringToNode( 
				tpl.replace('__replaceme__',inner ).replace('__attr__',attributes) 
			);
			// console.log( innerNodes )

			forEach(innerNodes,function(node,index){
				tElm[0].parentNode.insertBefore(node, tElm[0].nextSibling );
			});
			tElm[0].remove();
			return linkFunc;
		}
	};

	function linkFunc($scope,elm,attr){

	}
	return directiveObj;
});