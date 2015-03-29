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

app.controller('quickTableCtrl',['$scope','TABLEDATA',function($scope,TABLEDATA){
    var ctrl = this;
    this.tableData = TABLEDATA.parsed;
    this.options = {
        striped:false,
        enableHover:true,
        bordered:false,

        rowSelection:true,
        columnSelection:false,

        autoMergeColumn: true,
    }

}])