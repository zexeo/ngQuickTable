/*!
 *	ng-quick-table
 * 
 * Copyright(c) 2015 Eisneim Terry
 * MIT Licensed
 */

'use strict';

var ngQT = angular.module('ngQuickTable',[]);

ngQT.provider("ngQuickTableDefaults", function() {
    return {
      options: {
        dateFormat: 'M/d/yyyy',
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

// ngQT.run()
ngQT.factory('$qtUtil',[function(){
	var dom = {};
	/**
	 * in order to calculate top,left value of ripple center ,
	 * @param  {[type]} elm [description]
	 * @return {Node}     [description]
	 */
	dom.findParentScrolled = function (elm){
		var parent = elm.parentNode;
		if(parent.isEqualNode(document.body) ) return false;

		var styles = getComputedStyle(parent);

		if( 
			elm.scrollHeight > parent.clientHeight && 
			(  styles['overflow']=='scroll'|| styles['overflow-y'] =='scroll'||styles['overflow'] =='auto'||styles['overflow-y'] =='auto'  )
		){
			return parent;
		}else{
			return findParentScrolled( parent );
		}
	};

	var debounce = function(func, wait) {
      var args, context, later, result, timeout, timestamp;
      timeout = args = context = timestamp = result = null;
      later = function() {
        var last;
        last = +new Date() - timestamp;
        if (last < wait && last > 0) {
          return timeout = setTimeout(later, wait - last);
        } else {
          return timeout = null;
        }
      };
      return function() {
        context = this;
        args = arguments;
        timestamp = +new Date();
        if (!timeout) {
          timeout = setTimeout(later, wait);
          result = func.apply(context, args);
          context = args = null;
        }
        return result;
      };
    };



	return {
		dom:dom,
		debounce: debounce,
	}

}])
ngQT.directive('quickTable',['$injector','$qtApi','$qtUtil','$rowSorter',
	function($injector,$qtApi,$qtUtil,$rowSorter){
	// some constant
	var events = {
		initialRender:'INITIAL_RENDER',
		rowSelect:'ROW_SELECT',
		rowUnselect: 'ROW_UNSELECT',
		rowSelectAll: 'ROW_SELECT_ALL',
		rowClear: 'ROW_CLEAR',
		cellEdit: 'CELL_EDIT',

	}

	var directiveObj = {
		restrict: "E",
		replace:true,
		scope:{
			columnDef: '=',
			records: '=?',
			options: '=?',
			id: '@', // this id is for: $qtApi.get( id ) -> table
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
			var qtvm = this;

			// some initail variables
			this.sortMap = {};


			/**
			 * render table
			 */
			this.render = function(opt,callback){
				qtvm.table = $qtApi.create(opt);

				$scope.rowSelection = this.table.rowSelection = {};
				
				// it will not run in the first time, but will run during reRender
				if( qtvm.compileTable && typeof qtvm.compileTable == 'function' ) 
					qtvm.compileTable();
				
				// put reference to api;
				qtvm.table.render = qtvm.render;

				if(typeof callback == 'function') 
					callback.call(null,qtvm.table);

				return qtvm.table;
			}
			
			this.reRender = function(opt){
				qtvm.table.reBuildTable(opt);	
				qtvm.compileTable();
			}

			$scope.selectAllRow = function(selectOrUnselect){
				for(var ii=0;ii<$scope.records.length;ii++){
					$scope.rowSelection[ $scope.records[ii]._id ] = selectOrUnselect;
				}

			};

			$scope.$watch('allRowSelected',function(newVal,oldVal){
				if(newVal){
					$scope.selectAllRow(true);
					$scope.$emit( events.rowSelectAll );
				}else if( !newVal && oldVal ){
					// clear all selection
					$scope.selectAllRow(false);
					$scope.$emit( events.rowClear );
				}
			});
			
			// ----------- sort row ---------
			this.sortRow = function(key){
				var oldWay = qtvm.sortMap[key];
				// now clear other keyword sort, the sortMap is only for ui change
				qtvm.sortMap = {};

				if( oldWay == 'asc' ){
					qtvm.sortMap[key] = 'desc';
				}else if( oldWay == 'desc' ){
					qtvm.sortMap[key] = null;
				}else{	
					// default way is asc 
					qtvm.sortMap[key] = 'asc';
				}

				if(!qtvm.sortMap[key] ) return;
				// this did the real sorting
				var sortFunc = $rowSorter.sort( key, $scope.records , qtvm.sortMap[key] );
				$scope.records.sort( sortFunc );

			}

		}],
		controllerAs:'qtvm',
		link: linkFunc,
	};

	function linkFunc($scope,elm,attr){
		var $compile = $injector.get('$compile');
		var qtvm = $scope.qtvm;

		qtvm.elements = {
			container: elm,
		}


		var table,$table;
		
		qtvm.render({
			id: $scope.id,
			tableDef: $scope.options,
			columnDef:  $scope.columnDef,
			records: $scope.records,
			container: elm[0],
		},function( tableInstance ){
			// qtvm.table
			$scope.$emit( events.initialRender, qtvm );
		});

		qtvm.table.selectAllRow = $scope.selectAllRow;

		qtvm.compileTable = function(){
			// remove old table if there is any;
			elm.empty();

			table = angular.element( qtvm.table.tpl );
			$table = $compile(table)($scope);
			elm.append($table);
		}
		qtvm.compileTable();
		qtvm.elements.table = $table;

		/**
		 * ==== auto merge columns into one column according to screen size =====
		 */
		qtvm.ifMergeNeeded = qtvm.table.ifMergeNeeded = function(columnDef){
			var shouldBeMerged = [];

			var headerExceed = $table[0].clientWidth > elm[0].clientWidth ;
			/**
			 * this type of merge don't need to check which column need to merge
			 * it should take first 3 columns(those column should not be the type of 'custom','')
			 */
			if( headerExceed ) {
				for(var ii=0; ii<columnDef.length;ii++){
					var def = columnDef[ii];
					if( 
						def.type != 'combined' &&
						def.type != 'textarea' && 
						def.type != 'custom'  
					){
						shouldBeMerged.push( def );
					}
				}

				return qtvm.table.mergeColumn( shouldBeMerged );
			}
			/**
			 * check columnDef.minWidth > current column width, if so put those column
			 * in an array, then take first 3 and merge theme;
			 */
			var $headerCells = $table.find('th');

			for (var ii = columnDef.length - 1; ii >= 0; ii--) {
				var def = columnDef[ii];
				// if width has been set, do not merge
				if(def.width) continue;

				// if some col is already merged, the count of $headerCells != columnDefs.length
				if(!$headerCells[ii]) continue;

				if( def.minWidth && 
					def.minWidth + 20 > $headerCells[ii].clientWidth  &&
					def.type != 'combined' &&
					def.type != 'textarea' && 
					def.type != 'custom' 
				){
					shouldBeMerged.push( def );
				};
			};

			return qtvm.table.mergeColumn( shouldBeMerged )

		}// end of ifMergeNeeded()

		qtvm.mergeColumnRerender = function( newColumnDef ){
			if( !newColumnDef ) newColumnDef = qtvm.ifMergeNeeded( qtvm.table.columnDef );
			// console.log('----newColumnDef-----');
			// console.log(newColumnDef);
			//if still no need to 
			if( newColumnDef ){
				// now let's reRender it !!;
				qtvm.reRender({
					columnDef:  newColumnDef,
				});
			}else{
				// un merge combined columns
				qtvm.reRender({
					columnDef:  $scope.columnDef,
				});
			}
		}

		var onWindowResize = $qtUtil.debounce(function(){

			qtvm.mergeColumnRerender(  qtvm.ifMergeNeeded( $scope.columnDef ) )

		},500)
		// ================================ row filter ==================
		qtvm.rowFilter = {};
		qtvm.showFilter = $scope.options.showFilter;
		qtvm.clearFilter = function(key){
			delete qtvm.rowFilter[ key ];
		}


		// --------------------------------- cell edit ---------------------------------
		
		qtvm.cellEditMap = {};
		/**
		 * first let's add dubleclick listener
		 */
		$table.on('dblclick',tableDbclickHandle);
		angular.element(document).on('keypress',cancelEditCellCheck );

		function tableDbclickHandle(e){
			var target = e.target;
			cancelEdit();

			if( ['LI','TD'].indexOf( target.tagName ) == -1 ) return;

			var rowidx, columnkey,fieldIdx ,targetCell, targetRow;
			
			if(target.tagName == 'TD'){
				columnkey = target.dataset['columnkey'];
				targetRow = target.parentNode;
				rowidx = targetRow.dataset['rowidx'];
				targetCell = target;

			}else{

				fieldIdx = target.dataset['idx'];
				targetCell = target.parentNode.parentNode
				columnkey = targetCell.dataset['columnkey'];

				targetRow = target.parentNode.parentNode.parentNode
				rowidx = targetRow.dataset['rowidx'];
			}

			// qtvm.table.showCellEdit( targetCell ,rowidx,columnkey,fieldIdx);
			var editTpl = qtvm.table.rowEditTpl[columnkey];
			if( !editTpl ) return;

			var colDef = qtvm.table.defKeyMap[columnkey];
			if( colDef.type=='combined' ){
				colDef.fields.forEach(function(field,index){
					editTpl = editTpl.replace('__model_'+field.key, 'ng-model="records['+rowidx+'][\''+field.key+'\']"' );
				})

			}else{
				editTpl = editTpl.replace('__model_'+columnkey,'ng-model="records['+rowidx+'][\''+columnkey+'\']"' );				
			}
			

			var editCell = angular.element(
				'<td>'+editTpl+'</td>'
			);

			// compile this cell with scope
			var $editCell = $compile(editCell)($scope);
			// hide the original cell;
			targetCell.classList.add('hidden');

			qtvm.cellEditMap = {
				targetCell: targetCell,
				editCell: $editCell,
				isEditing: true,
				columnkey:columnkey,
				rowidx:rowidx,
				fieldIdx: fieldIdx,
			}

			angular.element(targetCell).after( $editCell );
		}
		function cancelEditCellCheck(e){
			if( e.keyCode == 13 && qtvm.cellEditMap.isEditing ){
				cancelEdit()
			} 
		}
		function cancelEdit(){
			if(qtvm.cellEditMap.isEditing ){
				// now let's emit some event
				$scope.$emit( events.cellEdit, {
					columnkey: qtvm.cellEditMap.columnkey,
					row: $scope.records[ qtvm.cellEditMap.rowidx ],
				} )

				qtvm.cellEditMap.targetCell.classList.remove('hidden');
				qtvm.cellEditMap.editCell.remove();
			}

			qtvm.cellEditMap = {};
		}


		if($scope.options.autoMergeColumn){
			window.addEventListener('resize', onWindowResize );			
		}

		$scope.$on('$destroy',function(){
			window.removeEventListener('resize', onWindowResize );	

			// remove dbclick listener
			$table.off('dblclick',tableDbclickHandle);
			angular.element(document).off('keypress',cancelEditCellCheck );
		});
	}

	return directiveObj;
}]);

/*
  some logic is modified from ui-grid
*/
ngQT.factory('$tableExporter',function(){
  
  var csvExporter = {};
  csvExporter.link = '<a href=\"data:text/csv;charset=UTF-8,CSV_CONTENT\">LINK_LABEL</a>';

  csvExporter.formatAsCsv = function (header, exportData, separator) {
    var self = this;
    separator = separator || ',';

    var bareHeaders = header.map(function(col){return col.key;});
    
    var csv = self.formatRowAsCsv(this, separator)(bareHeaders) + '\n';

    csv += exportData.map(this.formatRowAsCsv(this, separator, header) ).join('\n');
    // console.log('-------the csv string is--------')
    // console.log(csv);
    return csv;
  };

  csvExporter.formatRowAsCsv = function (exporter, separator, columnDef ) {
    return function (row) {
      if( Array.isArray(row) )
        return row.map(exporter.formatFieldAsCsv).join(separator);
      // it's not array.....
      if( typeof row != 'object' ) return '';

      var rowOfValue = [];
      // the order is not guaranteed for object 
      if(!columnDef) throw new Error('if you want to parse a row which is array of object, you need to pass in the columnDef so we can decide the order of each field');

      columnDef.forEach(function(col,index){
        rowOfValue.push( csvExporter.formatFieldAsCsv( row[ col.key ] ) );
      });

      return rowOfValue;
    };
  };

  csvExporter.formatFieldAsCsv = function (field) {
    if (field == null) { // we want to catch anything null-ish, hence just == not ===
      return '" "';
    }
    if (typeof(field) === 'number') {
      return field;
    }
    if (typeof(field) === 'boolean') {
      return (field ? 'TRUE' : 'FALSE') ;
    }
    if (typeof(field) === 'string') {
      return '"' + field.replace(/"/g,'""') + '"';
    }

    return JSON.stringify(field);        
  };

  csvExporter.generateLink = function( colDef, records, separator ){
    var csvString = this.formatAsCsv( colDef, records, separator )
    console.log(csvString);
    return this.link.replace('CSV_CONTENT',encodeURIComponent(csvString) );
  }

  return csvExporter;
});
ngQT.factory('$qtApi',['$tableExporter',function($tableExporter){
	var _id = 0;

	function Qtable(options){

		this.rawData = options.data || {def:[],records:[]};
		this.columnDef = options.columnDef;
		if( !this.columnDef ) this.columnDef = this.rawToColumnDef( this.rawData );

		this.container = options.container;
		this.id = options.id;

		// ----- some table style 
		if( !options.tableDef ) options.tableDef = {};
		this.theme = options.tableDef.theme || 'qt-theme-basic';//
		// is even rows have background color
		this.striped = options.tableDef.striped ;
		this.bordered = options.tableDef.bordered ;
		this.enableHover = options.tableDef.enableHover  ;


		// ---------------- feature specific settings
		this.exportOptions = {
			csvExportLinkLable: options.csvExportLinkLable || '下载CSV',
			csvFileName: options.csvFileName || '导出的表格',
		}


		// ----- pre defined data -------
		this.rows = [];
		this.records = options.records ||[];
		this.recordIdMap = this.generateIdMap(this.records,'_id'); // this.recordIdMap = {'989': {onerecord}, }
		this.defKeyMap = this.generateIdMap(this.columnDef,'key');




		// if autoMergeColumn is set to true, do some pre merge
		if( options.tableDef.autoMergeColumn ){
			this.autoMergeColumn = true;
			// ifMergeNeeded is defined in directive, so in the first time it won't run.
			if(typeof this.ifMergeNeeded == 'function'){
				this.ifMergeNeeded( this.columnDef );
			}else{
				if(!this.container)
					throw new Error('autoMergeColumn need container');
				var coldefs = this.isHeaderRowTooNarrow( this.columnDef , this.container );
				// console.log(coldefs);
				this.mergeColumn( coldefs ); 
			}
		}

		// if enable row selection, a column should be added infront
		// all we need to do is add a custom columnDef and add record to it;
		this.enableRowSelection = options.tableDef.rowSelection;
		if(this.enableRowSelection){
			this.rowSelection = {};
			this.addRowSelectionColumn();
		}

		/**
		 * if enable sort , we will just add trigger to the tableCell,
		 * the actual sort will happen in directive
		 */
		this.enableSort = options.tableDef.enableSort;
		if(this.enableSort){
			// console.log('sort is enabled')
		}

		// generate table template
		this.buildTable();
	}

	var pro = Qtable.prototype;

	pro.rawToColumnDef = function(raw){
		if( !Array.isArray(raw) ) throw new TypeError('raw data shoud be an array');
		var def = [];

		return def;
	}
	/**
	 * generate id map for all records, so it will be easier to access rows by their id
	 */
	pro.generateIdMap = function(array,key){
		var theMap = {};
		if(!key) key ='_id';

		for (var ii = array.length - 1; ii >= 0; ii--) {
			if(!array[ii][key] ) array[ii][key] = this.idGen('record');
			theMap[ array[ii][key] ] = array[ii];
		};

		return theMap;
	}

	pro.buildTable = function(){
		// sort by col.order
		this.columnDef.sort(function(a,b){
			return a.order - b.order ;
		});

		this.tpl = this.buildTableTpl();
	}
	/**
	 * !!! should provide validation!!!!
	 */
	pro.reBuildTable = function(opt){
		// override some option
		for(var key in opt ){
			if(opt.hasOwnProperty(key)){
				this[key] = opt[key];
			}
		}

		this.buildTable();

		return this.tpl;
	}

	pro.buildTableTpl = function(){
		// some css styles
		var styleClasses = '';
		if( this.striped ) styleClasses+= 	' qt-striped';
		if( this.bordered ) styleClasses+= 	' qt-bordered';
		if( this.enableHover ) styleClasses+=' qt-hover';
		var tpl = '<table class="qt-table '+styleClasses+'" id="'+this.id+'" width="100%" >';
		

		var tHeadHTML = '<thead><tr class="qt-head-row">',  
			rowTpl = '<tr ng-repeat="record in records | filter:qtvm.rowFilter track by record._id" data-rowidx={{$index}} class="qt-row" ng-class="{active:rowSelection[record._id]}">' ,
			rowEditTpl = {};

		for(var colIndex=0; colIndex<this.columnDef.length; colIndex++ ){
			var colDef = this.columnDef[colIndex];
			var cellTpl= '';

			// build up table header
			var theaderWidth = 'width="'+(colDef.width ? colDef.width : '')+'px"';
			var enableSort = this.enableSort ? this.getSortStringForTpl(colDef) : null;
			var theader = colDef.headerTpl ? colDef.headerTpl : ('<div '+ (enableSort?enableSort:'')+'>'+colDef.key);
			theader += (!enableSort?'':'<span class="qt-sort-arrow" ng-class="{up: qtvm.sortMap[\''+colDef.key+'\']==\'asc\', down: qtvm.sortMap[\''+colDef.key+'\']==\'desc\' }"><span>');
			theader += '</div>';

			tHeadHTML += '<th '+theaderWidth +'>'+theader;
			// the row filter
			if(['combined','custom'].indexOf(colDef.type) < 0){
				tHeadHTML+=  '<div ng-if="qtvm.showFilter" class="qt-row-filter clearfix"> \
					<input ng-model="qtvm.rowFilter[\''+colDef.key+'\']" ng-model-options="{ updateOn: \'default blur\', debounce: {\'default\': 500, \'blur\': 0} }" type="text"> \
					<span class="qt-clear-filter" ng-click="qtvm.clearFilter(\''+colDef.key+'\')" ng-show="qtvm.rowFilter[\''+colDef.key+'\']">✕</span></div>';
			}else{
				tHeadHTML += '<div ng-if="qtvm.showFilter" class="qt-row-filter clearfix"></div>';
			}

			tHeadHTML+='</th>';

			/**
			 * determin which cell template should it be;
			 */
			if(colDef.type == 'combined'){
				if(!Array.isArray(colDef.fields) ) 
					throw new TypeError('kye:"'+colDef.key+'" type="combined" must have fields property, and it must be array');
				
				var tplObj = this.getCombinedColTpl( colDef );
				
				cellTpl = tplObj.cellTpl;
				
				cellTpl += '</ul></td>';

				rowEditTpl[colDef.key] = tplObj.editTpl;

			}else if( colDef.type == 'custom' ){
				if(!colDef.tpl) 
					throw new Error('if colDef.type == "custom" then this column def must have "tpl" property');
				cellTpl = '<td '+this.getCellAttr(colDef)+'class="qt-custom">'+colDef.tpl + '</td>';
				// editing is not allowed for this column.
				rowEditTpl[colDef.key] = null;

			}else if(colDef.type == 'select' || colDef.type == 'boolean'){
				cellTpl = '<td '+this.getCellAttr(colDef)+'class="qt-select">{{record["'+colDef.key+'"]}}</td>';

				if(!colDef.selectOption || !Array.isArray(colDef.selectOption.choices) )
					throw new Error('if colDef.type=="slect" or "boolean" then thisl column def must have "selectOption" and "colDef.selectOption.choices" must be array');

				// edit template
				rowEditTpl[colDef.key] = '<select __model_'+colDef.key+'>';
				colDef.selectOption.choices.forEach(function(choice,index){
					rowEditTpl[colDef.key] += '<option value="'+choice+'">'+choice+'</option>';
				});
				rowEditTpl[colDef.key] += '</select>';
			}else if(colDef.type == 'textarea'){
				cellTpl = '<td '+this.getCellAttr(colDef)+'class="qt-textarea">{{record["'+colDef.key+'"]}}</td>';
				// edit template
				rowEditTpl[colDef.key] = '<textarea type="text" __model_'+colDef.key+'></textarea>';
			}else{ //colDef.type == 'input'
				cellTpl = '<td '+this.getCellAttr(colDef)+'class="qt-input">{{record["'+colDef.key+'"]}}</td>';
				// edit template
				rowEditTpl[colDef.key] = '<input type="text" value="" __model_'+colDef.key+'>';				
			}

			rowTpl += cellTpl;

		}
		// save row edit template for editting feature;
		this.rowEditTpl = rowEditTpl;

		tHeadHTML += '</tr></thead>';
		rowTpl += '</tr>';

		tpl+= tHeadHTML;
		tpl+= '<tbody>' + rowTpl +'</tbody>';

		tpl += '</table>';

		return tpl;
	}
	pro.getCellAttr = function(colDef){
		var attrs = 'data-columnkey="'+colDef.key+'"';

		if(!colDef.attr) return attrs;

		for(var aa in colDef.attr){
			if(!colDef.attr.hasOwnProperty( aa ) ) continue;
			attrs += ' '+ aa +'="'+colDef.attr[aa]+'"';
		}

		return attrs;
	}

	pro.getCombinedColTpl = function(colDef){
		var cellTpl = '<td '+this.getCellAttr(colDef)+'class="qt-combined"><ul>';
		var editTpl = '';

		for(var ii=0;ii<colDef.fields.length; ii++ ){
			var field = colDef.fields[ii]
			cellTpl += '<li data-idx="'+ii+'">'+field.key+': {{record["'+field.key+'"]}}</li>';
			
			if(field.type == 'select'||field.type == 'boolean'){
				editTpl += '<select __model_'+field.key+'__>';
				field.selectOption.choices.forEach(function(opt,index){
					editTpl =+ '<option value="'+opt+'">'+opt+'</option>';
				});
			}else if(field.type == 'textarea'){
				editTpl += '<textarea __model_'+field.key+'></textarea>';
			}else{
				editTpl += '<input type="text" __model_'+field.key+'/>';
			}
		}
		
		return {
			cellTpl: cellTpl,
			editTpl: editTpl,
		}
	}


	pro.addRowSelectionColumn = function(def){
		if(!def) def = {};
		var rowdef = {
			key:'rowSelect',
			order: 0,
			type: "custom",
			width: def.width || 50,
			headerTpl: def.headerTpl || '<div><input type="checkbox" ng-model="allRowSelected"/></div>',
			tpl: def.tpl || '<input type="checkbox" ng-model="rowSelection[record._id]"/>',
		};

		this.columnDef.unshift(rowdef);
	}

	pro.getSelectedRows = function(){
		// rest previous selection
		this.rows = [];
		for(var _id in this.rowSelection ){
			if(this.rowSelection[_id]){
				this.rows.push( this.recordIdMap[_id] );
			}
		}

		return this.rows;
	}
	pro.setSelectedRows = function( ids ){
		if(!Array.isArray(ids) ) 
			throw new TypeError('setSelectedRows(ids) only accept array of row id');

		ids.forEach(function(_id,index){
			// it must exisit
			if( this.recordIdMap[_id] ){ 
				this.rowSelection[ _id ] = true;
			}
		});
		return this.rowSelection;
	}
	// pro.clearSelectedRows = function(){

	// }

	// ------------- auto merge column -----------------
	/**
	 * simple check: sum of all header cell width should be greater than
	 * a minimal number based on
	 */
	pro.isHeaderRowTooNarrow = function( columnDefs , container ){
		var shouldBeMerged = [];
		var avgWidth = container.clientWidth / columnDefs.length; 

		/**
		 * sort by key length desc
		 */
		columnDefs.sort(function(a,b){
			return a.key.length - b.key.length;
		});
		
		if(avgWidth < 120 ){
			for (var ii = columnDefs.length - 1; ii >= 0; ii--) {
				if(shouldBeMerged.length >= 3 ) continue;
				var def = columnDefs[ii];
				if( 
					def.type != 'combined' && def.type != 'custom' && def.type != 'textarea' && !def.width 
				){
					shouldBeMerged.push( def );
				}
			};
		}
		return shouldBeMerged;
	}

	pro.mergeColumn = function( columnDefs ){
		if(!Array.isArray(columnDefs) ) 
			throw new TypeError('mergeColumn(columnDefs) only accept array of columnDef ');
		// if just one item , no need to merge;
		if(columnDefs.length <= 1) return;
		// sort the array ascending
		columnDefs.sort(function(a,b){
			return a.order - b.order;
		});
		// first, remove old def, then generata new def with the type of 'combined';
		var combinedDef = {
			key:'合并显示',
			order: columnDefs[0].order,
			type:'combined',
			isGerated: true,
			fields: [],
		}
		for (var ii = columnDefs.length - 1; ii >= 0; ii--) {
			var def = columnDefs[ii];
			combinedDef.fields.push( columnDefs[ii] );
			// remove old def
			this.columnDef = this.columnDef.filter(function(ee){
				if( ee.key != def.key ) return ee;
			});

		};

		// console.log('--this.columnDef')
		// console.log( this.columnDef );
		console.log('-----combinedDef')
		console.log(combinedDef)

		this.columnDef.splice(combinedDef.order,0, combinedDef );
		return this.columnDef
	}
	// ====================== sort row================
	/**
	 * 
	 * @param  {object} def the column def;
	 * @return {string} tpl like: ng-click="sortRow(....)"
	 */
	pro.getSortStringForTpl = function(def){
		if( ['custom','combined','textarea'].indexOf( def.type ) != -1 ) return null;
		return ' ng-click="qtvm.sortRow(\''+def.key+'\')" class="qt-sort-enabled qt-col-key"';
	}

	// --==================== cell edit ==============
	// pro.showCellEdit = function(targetCell, rowIndex , columnKey , fieldIndex ){


	// }
	// ---------------------- csv export -------------
	/**
	 * exportCsv , before export, remove all custom column and flatten all combined Columns
	 * @return {string} this is the CSV download <a> link
	 */
	pro.exportCsv = function(){
		var colDef = [], combinedFileds = [] ;

		for(var ii=0; ii< this.columnDef.length; ii++ ){
			var def = this.columnDef[ii];
			if(def.type == "combined" ){
				// let's flaten it
				def.fields.forEach(function(field,index){
					combinedFileds.push( field );
					colDef.push( field );
				});
			}else if( ['input','textarea','boolean','select']
					.indexOf( def.type ) != -1 )
			{
				colDef.push( def );
			}
		}

		colDef.sort(function(a,b){
			return a.order-b.order;
		});

		var link = $tableExporter.generateLink( colDef , this.records  )
			.replace('LINK_LABEL', this.exportOptions.csvExportLinkLable );
		return link;
	}


	var idGen = pro.idGen = function(prefix){
		return prefix +'_'+ (_id++);
	}

	var api = {
		tables:{},
		create: function(options){
			var id = options.id || idGen('ngt');
			options.id = id;

			this.tables[id] = new Qtable( options );

			return this.tables[id]
		},
		getTable:function( id ){
			return this.tables[id];
		}
	}

	return api;
}]);
/*
  most logic is modified from ui-grid
*/
ngQT.factory('$rowSorter',function(){
  
  // ------------------------- row sort utils --------------------
    var rowSorter = {};
    
  rowSorter.guessSortFn = function guessSortFn(item) {
    var itemType = typeof item;
    if(itemType == 'string' && parseFloat(item,10) == item ) 
      return 'sortNumberStr'; 
 
    switch (itemType) {
      case "number":
        return 'sortNumber';
      case "boolean":
        return 'sortBool';
      case "string":
        return 'sortAlpha';
      case "date":
        return 'sortDate';
      case "object":
        return 'basicSort';
      default:
        throw new Error('No sorting function found for type:' + itemType);
    }
  };

  rowSorter.handleNulls = function handleNulls(a, b) {
    // We want to allow zero values and false values to be evaluated in the sort function
    if ((!a && a !== 0 && a !== false) || (!b && b !== 0 && b !== false)) {
      // We want to force nulls and such to the bottom when we sort... which effectively is "greater than"
      if ((!a && a !== 0 && a !== false) && (!b && b !== 0 && b !== false)) {
        return 0;
      }
      else if (!a && a !== 0 && a !== false) {
        return 1;
      }
      else if (!b && b !== 0 && b !== false) {
        return -1;
      }
    }
    return null;
  };

  rowSorter.basicSort = function basicSort(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (a === b) {
        return 0;
      }
      if (a < b) {
        return -1;
      }
      return 1;
    }
  };

  rowSorter.sortNumber = function sortNumber(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      return a - b;
    }
  };

  rowSorter.sortNumberStr = function sortNumberStr(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var numA, // The parsed number form of 'a'
          numB, // The parsed number form of 'b'
          badA = false,
          badB = false;
  
      // Try to parse 'a' to a float
      numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
  
      // If 'a' couldn't be parsed to float, flag it as bad
      if (isNaN(numA)) {
          badA = true;
      }
  
      // Try to parse 'b' to a float
      numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
  
      // If 'b' couldn't be parsed to float, flag it as bad
      if (isNaN(numB)) {
          badB = true;
      }
  
      // We want bad ones to get pushed to the bottom... which effectively is "greater than"
      if (badA && badB) {
          return 0;
      }
  
      if (badA) {
          return 1;
      }
  
      if (badB) {
          return -1;
      }
  
      return numA - numB;
    }
  };

  rowSorter.sortAlpha = function sortAlpha(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var strA = a.toLowerCase(),
          strB = b.toLowerCase();
  
      return strA === strB ? 0 : (strA < strB ? -1 : 1);
    }
  };

  rowSorter.sortDate = function sortDate(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var timeA = a.getTime(),
          timeB = b.getTime();
  
      return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
    }
  };
  rowSorter.sortBool = function sortBool(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (a && b) {
        return 0;
      }
  
      if (!a && !b) {
        return 0;
      }
      else {
        return a ? 1 : -1;
      }
    }
  };

  rowSorter.sort = function rowSorterSort(key, rows, direction , method ) {
    if(!key || !rows ||!direction ) throw new Error('key, rows, direction is required for rowSorter.sort() ');

    // if no methed provide , we need to guess the type
    if( !method || 
      ['sortBool','sortNumber','sortNumberStr','sortAlpha','sortDate','basicSort'].indexOf(method) == -1 ) 
    {
      var item,ii=0;
      while( !item && ii< rows.length ){
        item = rows[ii][key];
        ii++;
      }

      method = rowSorter.guessSortFn( item );
    }
    // console.log('sort metbhod is :')
    // console.log( method )

    function sortMethodWraper(a,b){
      var val = rowSorter[method](a[key],b[key]);
      return direction == 'desc' ? -1*val : val;
    }

    return sortMethodWraper;
  };


  return rowSorter;
});