ngQT.directive('quickTable',['$injector',function($injector){
	var _id = 0;

	function Qtable(options){

		this.rawData = options.data || {def:[],records:[]};
		this.columnDef = options.columnDef;
		if( !columnDef ) this.columnDef = this.rawToColumnDef( this.rawData );

		// ----- pre defined data -------
		this.rows = [];

		return this.buildTable();
	}

	var pro = Qtable.prototype;

	pro.rawToColumnDef = function(raw){
		if( !Array.isArray(raw) ) throw new TypeError('raw data shoud be an array');
		var def = [];

		return def;
	}

	pro.buildTable = function(){
		var tpl = this.buildTableTpl();
	}

	pro.buildTableTpl = function(){
		var tpl = '<table width="100%" border="1" cellspacing="0">';

		// sort by order
		this.columnDef.sort(function(a,b){
			return b.order - a.order ;
		});
		

		var tHeadHTML = '<tr class="qt-head-row">',  rowTpl = '<tr class="qt-row">' ,rowEditTpl = {};
		for(var colIndex=0; colIndex<this.columnDef.length; colIndex++ ){
			var colDef = this.columnDef[colIndex];
			var cellTpl= '';

			tHeadHTML += '<th>'+ colDef.key +'</th>';

			/**
			 * determin which cell template should it be;
			 */
			if(colDef.type == 'combined'){
				if(!Array.isArray(colDef.fields) ) 
					throw new TypeError('kye:"'+colDef.key+'" type="combined" must have fields property, and it must be array');
				cellTpl = '<td><ul>';
				// cellEditTpl = '<td>'
				for(var ii=0;ii<colDef.fields.length; ii++ ){
					cellTpl += '<li>'+colDef.fields[ii].key+': {{record.'+colDef.fields[ii].key+'}}</li>';
				}
				cellTpl += '</ul></td>';

				rowEditTpl[colDef.key] = '还没有想好 怎么写';

			}else if( colDef.type == 'custom' ){
				if(!colDef.tpl) 
					throw new Error('if colDef.type == "custom" then this column def must have "tpl" property');
				cellTpl = '<td>'+colDef.tpl + '</td>';
				// editing is not allowed for this column.
				rowEditTpl[colDef.key] = null;

			}else if(colDef.type == 'select' || colDef.type == 'boolean'){
				cellTpl = '<td>{{record.'+colDef.key+'}}</td>';

				if(!colDef.selectOption || !Array.isArray(colDef.selectOption.choices) )
					throw new Error('if colDef.type=="slect" or "boolean" then thisl column def must have "selectOption" and "colDef.selectOption.choices" must be array');

				// edit template
				rowEditTpl[colDef.key] = '<select>';
				colDef.selectOption.choices.forEach(function(choice,index){
					rowEditTpl[colDef.key] += '<option value="'+choice+'">'+choice+'</option>';
				});
				rowEditTpl[colDef.key] += '</select>';

			}else{ //colDef.type == 'input'
				cellTpl = '<td>{{record.'+colDef.key+'}}</td>';
				// edit template
				rowEditTpl[colDef.key] = '<input type="text" value="">';				
			}

			rowTpl += cellTpl;

		}
		tHeadHTML += '</tr>';
		rowTpl += '</tr>';

		tpl+= tHeadHTML;


		tpl += '</table>';
		return tpl;
	}

	pro.buildTableHeader = function(){

	}


	pro.idGen = function(prefix){
		return prefix + (_id++);
	}



	var directiveObj = {
		restrict: "E",
		replace:true,
		scope:{
			columnDef: '=',
			records: '=',
		},
		template:function( tElm,attr ){
			console.log('template');
			return '<h3>hh</h3>';
		},
		compile: function(tElm,attr){
			console.log(tElm);

		},
		controller: ['$scope',function( $scope ){
			var $compile = $injector.get('$compile');
			console.log($scope);
			console.log(this);

		}],
		controllerAs:'qtbVm',
		
		link: linkFunc,
		// compile:function(tElm,attr){
		// 	var inner = tElm[0].innerHTML;
		// 	var tpl;
		// 	// attributes
		// 	var attributes = '';
		// 	for(var aa in attr ){
		// 		if(!attr.hasOwnProperty(aa) || ['$attr','$$element'].indexOf(aa)>=0){
		// 			continue;
		// 		}
		// 		// if this attribute already exitst
		// 		var attrIndex = topElm[0].indexOf( aa+'="');
		// 		if(  attrIndex > -1  ){ 
		// 			tpl = tpl.replace(aa+'="', aa+'="'+ attr[aa]+ ' ');
		// 		}else {
		// 			attributes += aa+'="'+attr[aa]+'"';	
		// 		}
				
		// 	}

		// 	var innerNodes = stringToNode( 
		// 		tpl.replace('__replaceme__',inner ).replace('__attr__',attributes) 
		// 	);

		// 	// console.log( innerNodes )

		// 	forEach(innerNodes,function(node,index){
		// 		tElm[0].parentNode.insertBefore(node, tElm[0].nextSibling );
		// 	});
		// 	tElm[0].remove();
		// 	return linkFunc;
		// }
	};

	function linkFunc($scope,elm,attr){
		console.log('link....');
	}
	return directiveObj;
}]);