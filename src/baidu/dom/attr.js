///import baidu.dom;
///import baidu._util_.access;
///import baidu._util_.attr;
baidu.dom.extend({
    attr: function(key, value){
        return baidu._util_.access(this, key, value, function(ele, key, val, pass){
            return baidu._util_.attr(ele, key, val, pass);
        });
    }
});