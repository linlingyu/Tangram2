///import baidu.dom;
///import baidu._util_.isXML;
///import baidu._util_.access;
///import baidu._util_.propFixer;

baidu.dom.extend({
    prop: function(){
        var rfocusable = /^(?:button|input|object|select|textarea)$/i,
            rclickable = /^a(?:rea|)$/i,
            select = document.createElement('select'),
            opt = select.appendChild(document.createElement('option')),
            propHooks = {
                tabIndex: {
                    get: function(ele){
                        var attrNode = ele.getAttributeNode('tabindex');
                        return attrNode && attrNode.specified ? parseInt(attrNode, 10)
                            : rfocusable.test(ele.nodeName) || rclickable.test(ele.nodeName)
                                && ele.href ? 0 : undefined;
                    }
                }
            };
        !opt.selected && (propHooks.selected = {
            get: function(ele){
                var par = ele.parentNode;
                if(par){
                    par.selectedIndex;
                    par.parentNode && par.parentNode.selectedIndex
                }
                return null;
            }
        });
        select = opt = null;
        return function(propName, value){
//            baidu.check();
            return baidu._util_.access(this, propName, value, function(ele, key, val){
                var nType = ele.nodeType, hooks;
                if(!ele || ~'238'.indexOf(nType)){return;}
                if(nType !== 1 || !baidu._util_.isXML(ele)){
                    key = baidu._util_.propFixer[key] || key;
                    hooks = propHooks[key] || {};
                }
                return val === undefined ? (hooks.get && hooks.get(ele, key)) || ele[key]
                    : (hooks.set && hooks.set(ele, key, val)) || (ele[key] = val);
            });
        }
    }()
});