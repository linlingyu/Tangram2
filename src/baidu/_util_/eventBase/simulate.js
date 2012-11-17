/**
 * @author dron
 */

///import baidu._util_.eventBase;
///import baidu.dom.contains;
///import baidu.each;

void function( special ){
    
    baidu.each( { mouseenter: "mouseover", mouseleave: "mouseout" }, function( name, fix ){
        special[ name ] = {
        	bindType: fix,
        	pack: function( fn ){
				var contains = baidu.dom.contains;
				return function( e ){ // e instance of baidu.event
					var related = e.relatedTarget;
					e.type = name;
	                if( !related || ( related !== this && !contains( this, related ) ) )
	                	return fn.apply( this, arguments );
				}
        	}
        }
    } );

    if( /firefox/i.test(navigator.userAgent) ) // firefox dont support focusin/focusout bubbles
        baidu.each( { focusin: "focus", focusout: "blur" }, function( name, fix ){
            special[ name ] = {
            	bindType: fix,
            	attachElements: "textarea,select,input,button,a"
            }
        } );

}( baidu.event.special );