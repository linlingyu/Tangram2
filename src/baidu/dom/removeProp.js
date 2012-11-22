///import baidu.dom;
///import baidu._util_.propFixer;
baidu.dom.extend({
    removeProp: function(key){
        key = baidu._util_.propFixer[key] || key;
        this.each(function(index, item){
            // try/catch handles cases where IE balks (such as removing a property on window)
            try{
                item[key] = undefined;
                delete item[key];
            }catch(e){}
        });
        return this;
    }
});