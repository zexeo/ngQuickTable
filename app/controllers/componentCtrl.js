app.controller('componentCtrl', ['$scope', '$routeParams', '$location',
    function($scope, $routeParams, $location) {
        var ctrl = this;
        if (!$routeParams.component) return $location.path('/404');

        ctrl.component = $routeParams.component;

        var comps = [{
            "name": "quickTable",
            "path": 'app/comp/quickTable.html',
            "url": ""
        }, {
            "name": "loader",
            "path": 'app/comp/loader.html',
            "url": ""
        }];

        comps.forEach(function(com, index) {
            if (com.name == ctrl.component) ctrl.compData = comps[index];
        });
        // console.log(this.)
        if (!this.compData) return $location.path('/404');

        // change page title
        document.title = this.component + ' - ng-quick-table';



    }
]);

app.controller('quickTableCtrl',['$scope','TABLEDATA','$qtApi',function($scope,TABLEDATA,$qtApi){
    var ctrl = this;
    this.tableData = TABLEDATA.parsed;
    this.options = {
        striped:false,
        enableHover:true,
        bordered:true,

        rowSelection:true,
        autoMergeColumn: true,
        enableSort:true,

        columnSelection:false,

        showFilter:true,
        
    }

    this.toggleFilter = function(){
        ctrl.$table.showFilter = !ctrl.$table.showFilter;
    },

    // grab all availieble api from table directive's $scope
    $scope.$on('INITIAL_RENDER',function(e,$table){
        ctrl.$table = $table;
    });

    $scope.$on('CELL_EDIT',function(e,data){
        console.log('cell been edit, new values are: ');
        console.log(data);
    })

    $scope.exportCsv = function(){
        var link = ctrl.$table.table.exportCsv();
        var $linkHolder = angular.element( document.getElementById('csv-link') );
        $linkHolder.append( link );
    }



}])