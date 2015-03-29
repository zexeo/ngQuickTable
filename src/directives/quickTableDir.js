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

			this.render = function(callback){
				qtvm.table = $qtApi.create({
					id: $scope.id,
					tableDef: $scope.options,
					columnDef:  $scope.columnDef,
					records: $scope.records,
				});

				$scope.rowSelection = this.table.rowSelection = {};

				if( qtvm.compileTable && typeof qtvm.compileTable == 'function' ) qtvm.compileTable();
				// put reference to api;
				qtvm.table.render = qtvm.render;

				if(typeof callback == 'function') callback.call(null,qtvm.table);

				return qtvm.table;
			}

			this.render();
			

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
		qtvm.ifMergeNeeded = function(){
			var headerExceed = $table[0].clientWidth > elm[0].clientWidth ;
			/**
			 * this type of merge don't need to check which column need to merge
			 * it should take first 3 columns(those column should not be the type of 'custom','')
			 */
			if( headerExceed ) {
				// do something
				return;
			}
			/**
			 * check columnDef.minWidth > current column width, if so put those column
			 * in an array, then take first 3 and merge theme;
			 */
			var shouldBeMerged = [];
			var $headerCells = $table.find('th');

			for (var ii = qtvm.table.columnDef.length - 1; ii >= 0; ii--) {
				var def = qtvm.table.columnDef[ii];
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

			console.log('those column should be merged')
			console.log(shouldBeMerged);
		}

		if($scope.options.autoMergeColumn){
			qtvm.ifMergeNeeded();

			
		}

	}

	return directiveObj;
}]);
