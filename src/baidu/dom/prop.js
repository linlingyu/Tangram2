///import baidu.dom;
///import baidu._util_.access;
///import baidu._util_.prop;
baidu.dom.extend({
    prop: function(propName, value){
        return baidu._util_.access(this, propName, value, function(ele, key, val){
            return baidu._util_.prop(ele, key, val);
        });
    }
});