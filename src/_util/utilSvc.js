ngQT.factory('$qtUtil',[function(){
	var dom = {};
	/**
	 * in order to calculate top,left value of ripple center ,
	 * @param  {[type]} elm [description]
	 * @return {Node}     [description]
	 */
	dom.findParentScrolled = function (elm){
		var parent = elm.parentNode;
		if(parent.isEqualNode(document.body) ) return false;

		var styles = getComputedStyle(parent);

		if( 
			elm.scrollHeight > parent.clientHeight && 
			(  styles['overflow']=='scroll'|| styles['overflow-y'] =='scroll'||styles['overflow'] =='auto'||styles['overflow-y'] =='auto'  )
		){
			return parent;
		}else{
			return findParentScrolled( parent );
		}
	};

	var debounce = function(func, wait) {
      var args, context, later, result, timeout, timestamp;
      timeout = args = context = timestamp = result = null;
      later = function() {
        var last;
        last = +new Date() - timestamp;
        if (last < wait && last > 0) {
          return timeout = setTimeout(later, wait - last);
        } else {
          return timeout = null;
        }
      };
      return function() {
        context = this;
        args = arguments;
        timestamp = +new Date();
        if (!timeout) {
          timeout = setTimeout(later, wait);
          result = func.apply(context, args);
          context = args = null;
        }
        return result;
      };
    };



	return {
		dom:dom,
		debounce: debounce,
	}

}])