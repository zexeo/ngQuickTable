ngQT.directive('quickTable',['$injector','$qtApi','$qtUtil','$rowSorter',
	function($injector,$qtApi,$qtUtil,$rowSorter){
	// some constant
	var events = {
		rowSelect:'ROW_SELECT',
		rowUnselect: 'ROW_UNSELECT',
		rowSelectAll: 'ROW_SELECT_ALL',
		rowClear: 'ROW_CLEAR',
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

		// --------------------------------- cell edit --------------------
		/**
		 * first let's add dubleclick listener
		 */
		$table.on('dblclick',tableDbclickHandle)
		function tableDbclickHandle(e){
			var target = e.target;

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
			var editCell = angular.element(
				'<td>'+qtvm.table.rowEditTpl[columnkey]+'</td>'
			)
			
			targetCell.style.display = 'none';

			angular.element(targetCell).after(editCell);


		}

		if($scope.options.autoMergeColumn){
			window.addEventListener('resize', onWindowResize );			
		}

		$scope.$on('$destroy',function(){
			window.removeEventListener('resize', onWindowResize );	

			// remove dbclick listener
			$table.off('dblclick',tableDbclickHandle);
		});
	}

	return directiveObj;
}]);
