ngQT.directive('quickTable',['$injector','$qtApi',function($injector,$qtApi){
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

			// sort by col.order
			$scope.columnDef.sort(function(a,b){
				return a.order - b.order ;
			});
			/**
			 * render table
			 */
			this.render = function(opt,callback){
				qtvm.table = $qtApi.create(opt);

				$scope.rowSelection = this.table.rowSelection = {};

				if( qtvm.compileTable && typeof qtvm.compileTable == 'function' ) qtvm.compileTable();
				// put reference to api;
				qtvm.table.render = qtvm.render;

				if(typeof callback == 'function') callback.call(null,qtvm.table);

				return qtvm.table;
			}

			this.render({
				id: $scope.id,
				tableDef: $scope.options,
				columnDef:  $scope.columnDef,
				records: $scope.records,
			});
			

			$scope.selectAllRow = this.table.selectAllRow = function(selectOrUnselect){
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
			

		}],
		controllerAs:'qtvm',
		link: linkFunc,
	};

	function linkFunc($scope,elm,attr){
		var $compile = $injector.get('$compile');
		var qtvm = $scope.qtvm;

		var table,$table;

		qtvm.compileTable = function(){
			// remove old table if there is any;
			elm.empty();

			table = angular.element( qtvm.table.tpl );
			$table = $compile(table)($scope);
			elm.append($table);
		}
		qtvm.compileTable();

		/**
		 * ==== auto merge columns into one column according to screen size =====
		 */
		qtvm.ifMergeNeeded = function(columnDef){
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

				if( def.minWidth && 
					def.minWidth > $headerCells[ii].clientWidth  &&
					def.type != 'combined' &&
					def.type != 'custom' 
				){
					shouldBeMerged.push( def );
				};
			};

			return qtvm.table.mergeColumn( shouldBeMerged )

		}// end of ifMergeNeeded()

		qtvm.mergeColumnRerender = function( newColumnDef ){
			if( !newColumnDef ) newColumnDef = qtvm.ifMergeNeeded( qtvm.table.columnDef );
			console.log('----newColumnDef-----');
			console.log(newColumnDef);
			//if still no need to 
			if( !newColumnDef ) return;
			// now let's reRender it !!;
			qtvm.render({
				id: $scope.id,
				tableDef: $scope.options,
				columnDef:  newColumnDef,
				records: $scope.records,
			});
		}

		// if($scope.options.autoMergeColumn){
		// 	qtvm.mergeColumnRerender();

		// }

	}

	return directiveObj;
}]);
