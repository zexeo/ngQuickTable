ngQT.directive('quickTable',['$injector',function($injector){
	var _id = 0;

	function Qtable(options){

		this.rawData = options.data || {def:[],records:[]};
		this.columnDef = options.columnDef;
		if( !this.columnDef ) this.columnDef = this.rawToColumnDef( this.rawData );

		// ----- some table style 
		if( !options.tableDef ) options.tableDef = {};
		this.theme = options.tableDef.theme || 'qt-theme-basic';//
		// is even rows have background color
		this.striped = options.tableDef.striped ;
		this.bordered = options.tableDef.bordered ;
		this.enableHover = options.tableDef.enableHover  ;

		// ----- pre defined data -------
		this.rows = [];

		this.buildTable();
	}

	var pro = Qtable.prototype;

	pro.rawToColumnDef = function(raw){
		if( !Array.isArray(raw) ) throw new TypeError('raw data shoud be an array');
		var def = [];

		return def;
	}

	pro.buildTable = function(){
		this.tpl = this.buildTableTpl();
	}

	pro.buildTableTpl = function(){
		var styleClasses = '';
		if( this.striped ) styleClasses+= ' qt-striped';
		if( this.bordered ) styleClasses+= ' qt-bordered';
		if( this.enableHover ) styleClasses+= 'qt-hover';
		var tpl = '<table class="qt-table '+styleClasses+'" width="100%" border="1" cellspacing="0">';

		// sort by order
		this.columnDef.sort(function(a,b){
			return a.order - b.order ;
		});
		

		var tHeadHTML = '<thead><tr class="qt-head-row">',  
			rowTpl = '<tr ng-repeat="record in records" class="qt-row">' ,
			rowEditTpl = {};

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
				cellTpl = '<td '+this.getCellAttr(colDef.attr)+'class="qt-combined"><ul>';
				// cellEditTpl = '<td>'
				for(var ii=0;ii<colDef.fields.length; ii++ ){
					cellTpl += '<li>'+colDef.fields[ii].key+': {{record["'+colDef.fields[ii].key+'"]}}</li>';
				}
				cellTpl += '</ul></td>';

				rowEditTpl[colDef.key] = '还没有想好 怎么写';

			}else if( colDef.type == 'custom' ){
				if(!colDef.tpl) 
					throw new Error('if colDef.type == "custom" then this column def must have "tpl" property');
				cellTpl = '<td '+this.getCellAttr(colDef.attr)+'class="qt-custom">'+colDef.tpl + '</td>';
				// editing is not allowed for this column.
				rowEditTpl[colDef.key] = null;

			}else if(colDef.type == 'select' || colDef.type == 'boolean'){
				cellTpl = '<td '+this.getCellAttr(colDef.attr)+'class="qt-select">{{record["'+colDef.key+'"]}}</td>';

				if(!colDef.selectOption || !Array.isArray(colDef.selectOption.choices) )
					throw new Error('if colDef.type=="slect" or "boolean" then thisl column def must have "selectOption" and "colDef.selectOption.choices" must be array');

				// edit template
				rowEditTpl[colDef.key] = '<select>';
				colDef.selectOption.choices.forEach(function(choice,index){
					rowEditTpl[colDef.key] += '<option value="'+choice+'">'+choice+'</option>';
				});
				rowEditTpl[colDef.key] += '</select>';
			}else if(colDef.type == 'textarea'){
				cellTpl = '<td '+this.getCellAttr(colDef.attr)+'class="qt-textarea">{{record["'+colDef.key+'"]}}</td>';
				// edit template
				rowEditTpl[colDef.key] = '<textarea type="text"></textarea>';
			}else{ //colDef.type == 'input'
				cellTpl = '<td '+this.getCellAttr(colDef.attr)+'class="qt-input">{{record["'+colDef.key+'"]}}</td>';
				// edit template
				rowEditTpl[colDef.key] = '<input type="text" value="">';				
			}

			rowTpl += cellTpl;

		}
		tHeadHTML += '</tr></thead>';
		rowTpl += '</tr>';

		tpl+= tHeadHTML;
		tpl+= '<tbody>' + rowTpl +'</tbody>';

		tpl += '</table>';
		return tpl;
	}
	pro.getCellAttr = function( attrObj ){
		if(!attrObj) return '';
		var attrs = '';
		for(var aa in attrObj){
			if(!attrObj.hasOwnProperty( aa ) ) continue;
			attrs += ' '+ aa +'="'+attrObj[aa]+'"';
		}
		return attrs;
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
			records: '=?',
			options: '=?',
		},
		template:function( tElm,attr ){
			console.log('template');
			return '<div class="qt-table-wraper"></div>';
		},
		// compile: function(tElm,attr){
		// 	console.log('compile');
		// 	console.log(tElm);

		// },
		controller: ['$scope',function( $scope ){
			this.table = new Qtable({
				tableDef: $scope.options,
				columnDef:  $scope.columnDef,
				records: $scope.records,
			});
		}],
		controllerAs:'qtvm',
		link: linkFunc,
	};

	function linkFunc($scope,elm,attr){
		var $compile = $injector.get('$compile');

		var qtvm = $scope.qtvm;
		var table = angular.element( qtvm.table.tpl );
		var $table = $compile(table)($scope);

		elm.append($table);

	}

	return directiveObj;
}]);
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