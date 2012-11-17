/**
 * @author dron
 */

///import baidu.dom;
///import baidu.event;
///import baidu._util_.eventBase;
///import baidu._util_.eventBase.queue;

/**
 * @description 对指定的 TangramDom 集合派发指定的事件，并触发事件默认行为
 * @function 
 * @name baidu.dom().trigger()
 * @grammar baidu.dom(args).trigger(type[,data])
 * @param {String} type 事件类型
 * @param {Array} data 触发事件函数时携带的参数
 * @return {TangramDom} 返回之前匹配元素的TangramDom对象 
 */

void function( base, be ){
	var special = be.special;
	var queue = base.queue;

	var triggerEvents = { submit: 1 };

	var createEvent = function( type ){
	    var evnt;
	    if( document.createEvent )
	        evnt = document.createEvent( "HTMLEvents" ),
	        evnt.initEvent( type, true, true );
	    else if( document.createEventObject )
	    	evnt = document.createEventObject();
	    return evnt;
	};

	var dispatchEvent = function( element, type, event ){
	   	if( element.dispatchEvent )
	   	    return element.dispatchEvent( event );
	   	else if( element.fireEvent )
	   		return element.fireEvent( "on" + type, event );
	};

	var fire = function( element, type, triggerData, special ){
		var evnt, eventReturn;

		if( evnt = createEvent( type ) ){
		    if( triggerData )
		        evnt.triggerData = triggerData;
		    
		    if( special )
		    	queue.call( element, type, null, evnt );
		    else
		        eventReturn = dispatchEvent( element, type, evnt );

		    if( eventReturn !== false && triggerEvents[type] ){
		    	console.log( eventReturn, type )
			    try{
			    	if( element[type] )
			    	    element[type]();
			    	else if( type = upp( type ), element[type] )
			    		element[type]();
			    }catch(e){
			    }
			}
		}
	};

    baidu.dom.extend({
		trigger: function( type, triggerData ){
			var sp;

			if( type in special )
			    sp = special[type];

			this.each(function(){
				fire( this, type, triggerData, sp );
			});
			return this;
		}
	});
}( baidu._util_.eventBase, baidu.event );