ngQT.factory('$qtApi',[function(){
	var _id = 0;

	function Qtable(options){

		this.rawData = options.data || {def:[],records:[]};
		this.columnDef = options.columnDef;
		if( !this.columnDef ) this.columnDef = this.rawToColumnDef( this.rawData );

		this.id = options.id;
		this.enableRowSelection = options.rowSelection;
		if(this.enableRowSelection){
			this.rowSelection = {};
		}

		// ----- some table style 
		if( !options.tableDef ) options.tableDef = {};
		this.theme = options.tableDef.theme || 'qt-theme-basic';//
		// is even rows have background color
		this.striped = options.tableDef.striped ;
		this.bordered = options.tableDef.bordered ;
		this.enableHover = options.tableDef.enableHover  ;

		// ----- pre defined data -------
		this.rows = [];
		this.records = options.records ||[];
		this.generateIdMap(this.records); // this.recordIdMap = {'989': {onerecord}, }

		// if enable row selection, a column should be added infront
		// all we need to do is add a custom columnDef and add record to it;
		this.addRowSelectionColumn();

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
	pro.generateIdMap = function(records){
		this.recordIdMap = {};
		for (var i = records.length - 1; i >= 0; i--) {
			if(!records[i]._id ) records[i]._id = this.idGen('record');
			this.recordIdMap[ records[i]._id ] = records[i];
		};

		// we updated records id, so we can save it back
		this.records = records;
		return this.recordIdMap;
	}

	pro.buildTable = function(){
		this.tpl = this.buildTableTpl();
	}

	pro.buildTableTpl = function(){
		// some css styles
		var styleClasses = '';
		if( this.striped ) styleClasses+= 	' qt-striped';
		if( this.bordered ) styleClasses+= 	' qt-bordered';
		if( this.enableHover ) styleClasses+=' qt-hover';
		var tpl = '<table class="qt-table '+styleClasses+'" id="'+this.id+'" width="100%" >';

		// sort by order
		this.columnDef.sort(function(a,b){
			return a.order - b.order ;
		});
		

		var tHeadHTML = '<thead><tr class="qt-head-row">',  
			rowTpl = '<tr ng-repeat="record in records" class="qt-row" ng-class="{active:rowSelection[record._id]}">' ,
			rowEditTpl = {};

		for(var colIndex=0; colIndex<this.columnDef.length; colIndex++ ){
			var colDef = this.columnDef[colIndex];
			var cellTpl= '';

			// build up table header
			var theader = colDef.headerTpl ? colDef.headerTpl : colDef.key;
			var theaderWidth = 'width="'+(colDef.width ? colDef.width : '')+'px"';
			tHeadHTML += '<th '+theaderWidth+'>'+ theader +'</th>';

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