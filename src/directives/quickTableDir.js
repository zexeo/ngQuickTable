ngQT.directive('quickTable',['$injector','$qtApi',function($injector,$qtApi){

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

			this.table = $qtApi.create({
				tableDef: $scope.options,
				columnDef:  $scope.columnDef,
				records: $scope.records,
			});
			/**
			 * some inital vars ;
			 * two way bind
			 */
			
			// ---------------- row selection ---------------
			$scope.rowSelection = this.table.rowSelection = {};
			$scope.selectAllRow = this.table.selectAllRow = function(selectOrUnselect){
				for(var ii=0;ii<$scope.records.length;ii++){
					$scope.rowSelection[ $scope.records[ii]._id ] = selectOrUnselect;
				}
			};
			$scope.$watch('allRowSelected',function(newVal,oldVal){
				if(newVal){
					$scope.selectAllRow(true);
				}else if( !newVal && oldVal ){
					// clear all selection
					$scope.selectAllRow(false);
				}
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
