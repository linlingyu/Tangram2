/**
 * @author linlingyu wangxiao
 */

///import baidu.dom.ready;

baidu.support = baidu.support || function(){
    var div = document.createElement('div'),
        support, a, input, select, opt;
    div.setAttribute('className', 't');
    div.innerHTML = ' <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
    a = div.getElementsByTagName('A')[0];
    a.style.cssText = 'top:1px;float:left;opacity:.5';
    select = document.createElement('select');
    opt = select.appendChild(document.createElement('option'));
    input = div.getElementsByTagName('input')[0];
    input.checked = true;
    support = {
        opacity: a.style.opacity === '0.5',//is support opacity
        cssFloat: !!a.style.cssFloat,//is support cssFloat
        noCloneChecked: input.cloneNode(true).checked,//用于判断ie是否支持clone属性
        
        leadingWhitespace: (div.firstChild.nodeType === 3),
        htmlSerialize: !!div.getElementsByTagName('link').length,
        style: /top/.test(a.getAttribute('style')),
        checkOn: (input.value === 'on'),
        getSetAttribute: (div.className !== 't'),
        hrefNormalized: (a.getAttribute('href') === '/a'),
        pixelMargin: true
    };
    support.noCloneEvent = true;//noCloneEvent和noCloneChecked使用在baidu.dom.clone接口中
    if (!div.addEventListener && div.attachEvent && div.fireEvent){
        div.attachEvent('onclick', function(){support.noCloneEvent = false;});
        div.cloneNode(true).fireEvent('onclick');
    }
    select.disabled = true;
    support.optDisabled = !opt.disabled;
    //
    // Check if a radio maintains its value
    // after being appended to the DOM
    input = document.createElement('input');
    input.value = 't';
    input.setAttribute('type', 'radio');
    support.radioValue = input.value === 't';
    
    baidu(function(){
        var body = document.getElementsByTagName('body')[0],
            container = document.createElement('div'),
            div = document.createElement('div'),
            paddingMarginBorder = 'padding: 0; margin: 0; border: ',
            boundString = 'left: 0; top: 0; width: 0px; height: 0px; ',
            visibleString = boundString + paddingMarginBorder + '0; visibility: hidden;',
            styleString = boundString + paddingMarginBorder + '5px solid #000; position: absolute;',
            outer, inner, table;
            
        container.style.cssText = 'position: static;' + visibleString;
        body.insertBefore(container, body.firstChild);
        container.appendChild(div);
        div.style.cssText = 'position: absolute;' + visibleString;
        div.innerHTML = '<div style="'+ styleString +'display: bloack;"><div style="'+ paddingMarginBorder +'0; display: block; overflow: hidden;"></div></div><table style="'+ styleString +'" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';
        outer = div.firstChild;
        inner = outer.firstChild;
        table = outer.nextSibling;

        support.hasBorderWidth = inner.offsetTop >= 5;//opera
        support.hasTableCellBorderWidth = table.rows[0].cells[0].offsetTop >= 5;//ie,firefox
        
        inner.style.position = 'fixed';
        inner.style.top = '20px';
        support.fixedPosition = inner.offsetTop === 20 || inner.offsetTop === 15;
        //
        div.innerHTML = '';
        div.style.cssText = 'box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;';
        if (window.getComputedStyle){
            support.pixelMargin = (window.getComputedStyle(div, null) || {}).marginTop !== '1%';
        }
//        inner.style.position = inner.style.top = '';
//        outer.style.overflow = 'hidden';
//        outer.style.position = 'relative';
        
        body.removeChild(container);
        container = div = outer = inner = table = null;
    });

    return support;
}();