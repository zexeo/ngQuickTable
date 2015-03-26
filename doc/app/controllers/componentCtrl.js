app.controller('componentCtrl', ['$scope', '$routeParams', 'TABLEDATA', '$location',
    function($scope, $routeParams, TABLEDATA, $location) {
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
])