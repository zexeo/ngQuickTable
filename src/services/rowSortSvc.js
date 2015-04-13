/*
  most logic is modified from ui-grid
*/
ngQT.factory('$rowSorter',function(){
  
  // ------------------------- row sort utils --------------------
    var rowSorter = {};
    
  rowSorter.guessSortFn = function guessSortFn(item) {
    var itemType = typeof item;
    if(itemType == 'string' && parseFloat(item,10) == item ) 
      return 'sortNumberStr'; 
 
    switch (itemType) {
      case "number":
        return 'sortNumber';
      case "boolean":
        return 'sortBool';
      case "string":
        return 'sortAlpha';
      case "date":
        return 'sortDate';
      case "object":
        return 'basicSort';
      default:
        throw new Error('No sorting function found for type:' + itemType);
    }
  };

  rowSorter.handleNulls = function handleNulls(a, b) {
    // We want to allow zero values and false values to be evaluated in the sort function
    if ((!a && a !== 0 && a !== false) || (!b && b !== 0 && b !== false)) {
      // We want to force nulls and such to the bottom when we sort... which effectively is "greater than"
      if ((!a && a !== 0 && a !== false) && (!b && b !== 0 && b !== false)) {
        return 0;
      }
      else if (!a && a !== 0 && a !== false) {
        return 1;
      }
      else if (!b && b !== 0 && b !== false) {
        return -1;
      }
    }
    return null;
  };

  rowSorter.basicSort = function basicSort(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (a === b) {
        return 0;
      }
      if (a < b) {
        return -1;
      }
      return 1;
    }
  };

  rowSorter.sortNumber = function sortNumber(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      return a - b;
    }
  };

  rowSorter.sortNumberStr = function sortNumberStr(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var numA, // The parsed number form of 'a'
          numB, // The parsed number form of 'b'
          badA = false,
          badB = false;
  
      // Try to parse 'a' to a float
      numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
  
      // If 'a' couldn't be parsed to float, flag it as bad
      if (isNaN(numA)) {
          badA = true;
      }
  
      // Try to parse 'b' to a float
      numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
  
      // If 'b' couldn't be parsed to float, flag it as bad
      if (isNaN(numB)) {
          badB = true;
      }
  
      // We want bad ones to get pushed to the bottom... which effectively is "greater than"
      if (badA && badB) {
          return 0;
      }
  
      if (badA) {
          return 1;
      }
  
      if (badB) {
          return -1;
      }
  
      return numA - numB;
    }
  };

  rowSorter.sortAlpha = function sortAlpha(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var strA = a.toLowerCase(),
          strB = b.toLowerCase();
  
      return strA === strB ? 0 : (strA < strB ? -1 : 1);
    }
  };

  rowSorter.sortDate = function sortDate(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var timeA = a.getTime(),
          timeB = b.getTime();
  
      return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
    }
  };
  rowSorter.sortBool = function sortBool(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (a && b) {
        return 0;
      }
  
      if (!a && !b) {
        return 0;
      }
      else {
        return a ? 1 : -1;
      }
    }
  };

  rowSorter.sort = function rowSorterSort(key, rows, direction , method ) {
    if(!key || !rows ||!direction ) throw new Error('key, rows, direction is required for rowSorter.sort() ');

    // if no methed provide , we need to guess the type
    if( !method || 
      ['sortBool','sortNumber','sortNumberStr','sortAlpha','sortDate','basicSort'].indexOf(method) == -1 ) 
    {
      var item,ii=0;
      while( !item && ii< rows.length ){
        item = rows[ii][key];
        ii++;
      }

      method = rowSorter.guessSortFn( item );
    }
    // console.log('sort metbhod is :')
    // console.log( method )

    function sortMethodWraper(a,b){
      var val = rowSorter[method](a[key],b[key]);
      return direction == 'desc' ? -1*val : val;
    }

    return sortMethodWraper;
  };


  return rowSorter;
});