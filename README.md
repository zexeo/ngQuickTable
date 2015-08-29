ng-quick-table
=====================
## features:
 - quickly filter rows
 - auto merge column when screen is too small
 - sort row, select row
 - custom table cell content
 - inline editing
 - combined cell display
 - CSV file export


![sanpshot](snapshot.png 'preview')

##install

	bower install ngQuickTable#latest

```html
	<link rel="stylesheet" href="pathTo/ng-quick-table.css">
	<script src="pathTo/ng-quick-table.min.js"></script>

	<!-- in your template -->
	<quick-table column-def="vm.tableColumnDef" records="vm.tableRecords" options="vm.options"></quick-table>
```
```javascript
var app = angular.module('ngQuickTable-doc',['ngQuickTable']);

// in your controller:
vm.options = {
		striped:false,
		enableHover:true,
		bordered:true,
		rowSelection:true,
		autoMergeColumn: true,
		enableSort:true,
		columnSelection:false,
		showFilter:true,
}

vm.tableColumnDef = [
	{
			key:'user',
			order: 0,
			type: "custom",
			width: 80,
			headerTpl:'<div style="text-align:center">用户信息</div>',
			tpl: '<img width="50" ng-src="{{record.user.avatar}}" alt="{{record.user.username}}"  />',
			attr: {
					style: 'text-align:center;',
			}
	},
	{
			key:'基本信息',
			headerTpl:'<span>基本信息</span>',
			order: 1,
			type:'combined',
			fields:[
					{
							key: "姓名",
							order: 0,
							type: "input",
					}, {
							key: "手机号",
							order: 1,
							_id: "54f3d8c6f0d58e0557e6f52f",
							type: "input",
					}, {
							key: "年龄",
							order: 2,
							_id: "54f3d8c6f0d58e0557e6f52e",
							type: "input",
					}
			]
	}
	, {
			key: "分组",
			edit:true,
			order: 3,
			minWidth:80,
			_id: "54f3d8c6f0d58e0557e6f52d",
			selectOption: {
					allowMulti: false,
					choices: [
							"第一组",
							"第二组",
							"第四组",
							"第三组"
					]
			},
			type: "select",
	}, {
			key: "是否为会员",
			edit:true,
			mustFill: false,
			order: 4,
			minWidth:100,
			_id: "54f3d8c6f0d58e0557e6f52c",
			selectOption: {
					allowMulti: false,
					choices: [
							"是",
							"否"
					]
			},
			type: "boolean",
	}, {
			key: "付款方式",
			edit:true,
			order: 5,
			minWidth:100,
			_id: "54f3d8c6f0d58e0557e6f52b",
			selectOption: {
					allowMulti: true,
					choices: [
							"支付宝",
							"财付通"
					]
			},
			type: "select",
	}, {
			key: "备注",
			edit:true,
			order: 6,
			minWidth:100,
			_id: "54f3d8c6f0d58e0557e6f52a",
			type: "textarea",
	}
];

vm.tableRecords = [{
			'_id':'99-0993231',
			'user':{
					avatar:'img/avatar1.svg',
					username:'eisneim',
			},
			'手机号':222112312,
			'年龄':'12321',
			'分组':'11',
			'是否为会员':'是',
			'付款方式':'支付宝',
			'备注':'eisneim',
			'姓名':'eisneim hahh',
	},{
			'_id':'99-0993234',
			'user':{
					avatar:'img/avatar2.svg',
					username:'Julia',
			},
			'手机号':121213,
			'年龄':'terry',
			'分组':'22',
			'是否为会员':'是',
			'付款方式':'信用卡',
			'备注':'terry',
			'姓名':'eisneim hahh',
	}        
];


// grab all availieble api from table directive's $scope
$scope.$on('INITIAL_RENDER',function(e,$table){
		$scope.$table = $table;
});

vm.toggleFilter = function(){
		$scope.$table.showFilter = !$scope.$table.showFilter;
};

$scope.$on('CELL_EDIT',function(e,data){
		console.log('cell been edit, new values are: ');
		console.log(data);
})

vm.exportCsv = function(){
		var link = $scope.$table.table.exportCsv();
		var $linkHolder = angular.element( document.getElementById('csv-link') );
		$linkHolder.append( link );
}

```