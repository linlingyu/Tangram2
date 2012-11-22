///import baidu.dom.each;
///import baidu._util_.removeAttr;
baidu.dom.extend({
    removeAttr: function(key){
        this.each(function(index, item){
            baidu._util_.removeAttr(item, key);
        });
        return this;
    }
});