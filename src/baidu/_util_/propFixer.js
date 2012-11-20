///import baidu._util_;
baidu._util_.propFixer = {
    tabindex: 'tabIndex',
    readonly: 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    maxlength: 'maxLength',
    cellspacing: 'cellSpacing',
    cellpadding: 'cellPadding',
    rowspan: 'rowSpan',
    colspan: 'colSpan',
    usemap: 'useMap',
    frameborder: 'frameBorder',
    contenteditable: 'contentEditable'
};
// IE6/7 call enctype encoding
!document.createElement('form').enctype
    && (baidu._util_.propFixer.enctype = 'encoding');