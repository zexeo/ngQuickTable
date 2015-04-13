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