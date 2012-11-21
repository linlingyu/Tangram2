void function(){
	// Copyright (c) 2009-2012, Baidu Inc. All rights reserved.
	//
	// Licensed under the BSD License
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	// 
	//      http://tangram.baidu.com/license.html
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS-IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	
	var T, baidu = T = baidu || function(q, c) { return baidu.dom ? baidu.dom(q, c) : null; };
	
	if( !window.baidu )
		window.baidu = window.T = T;
	
	baidu.version = "2.0.0.3";
	baidu.guid = "$BAIDU$";
	baidu.key = "tangram_guid";
	
	// Tangram 可能被放在闭包中
	// 一些页面级别唯一的属性，需要挂载在 window[baidu.guid]上
	
	var _ = window[ baidu.guid ] = window[ baidu.guid ] || {};
	(_.versions || (_.versions = [])).push(baidu.version);
	
	// 20120709 mz 添加参数类型检查器，对参数做类型检测保护
	baidu.check = baidu.check || function(){};
	
	baidu._util_ = baidu._util_ || {};
	
	baidu.merge = function(first, second) {
	    var i = first.length,
	        j = 0;
	
	    if ( typeof second.length === "number" ) {
	        for ( var l = second.length; j < l; j++ ) {
	            first[ i++ ] = second[ j ];
	        }
	
	    } else {
	        while ( second[j] !== undefined ) {
	            first[ i++ ] = second[ j++ ];
	        }
	    }
	
	    first.length = i;
	
	    return first;
	};
	
	 
	baidu.forEach = function( enumerable, iterator, context ) {
	    var i, n, t;
	
	    if ( typeof iterator == "function" && enumerable) {
	
	        // Array or ArrayLike or NodeList or String or ArrayBuffer
	        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
	        if ( typeof n == "number" ) {
	
	            // 20121030 function.length
	            //safari5.1.7 can not use typeof to check nodeList - linlingyu
	            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
	                return enumerable;
	            }
	
	            for ( i=0; i<n; i++ ) {
	
	                t = enumerable[ i ] || (enumerable.charAt && enumerable.charAt( i ));
	
	                // 被循环执行的函数，默认会传入三个参数(array[i], i, array)
	                iterator.call( context || null, t, i, enumerable );
	            }
	        
	        // enumerable is number
	        } else if (typeof enumerable == "number") {
	
	            for (i=0; i<enumerable; i++) {
	                iterator.call( context || null, i, i, i);
	            }
	        
	        // enumerable is json
	        } else if (typeof enumerable == "object") {
	
	            for (i in enumerable) {
	                if ( enumerable.hasOwnProperty(i) ) {
	                    iterator.call( context || null, enumerable[ i ], i, enumerable );
	                }
	            }
	        }
	    }
	
	    return enumerable;
	};
	
	 
	baidu.lang = baidu.lang || {};
	
	baidu.type = (function() {
	    var objectType = {},
	        nodeType = [, "HTMLElement", "Attribute", "Text", , , , , "Comment", "Document", , "DocumentFragment", ],
	        str = "Array Boolean Date Error Function Number RegExp String",
	        retryType = {'object': 1, 'function': '1'},//解决safari对于childNodes算为function的问题
	        toString = objectType.toString;
	
	    // 给 objectType 集合赋值，建立映射
	    baidu.forEach(str.split(" "), function(name) {
	        objectType[ "[object " + name + "]" ] = name.toLowerCase();
	
	        baidu[ "is" + name ] = function ( unknow ) {
	            return baidu.type(unknow) == name.toLowerCase();
	        }
	    });
	
	    // 方法主体
	    return function ( unknow ) {
	        var s = typeof unknow;
	        return !retryType[s] ? s
	            : unknow == null ? "null"
	            : unknow._type_
	                || objectType[ toString.call( unknow ) ]
	                || nodeType[ unknow.nodeType ]
	                || ( unknow == unknow.window ? "Window" : "" )
	                || "object";
	    };
	})();
	
	// extend
	baidu.isDate = function( unknow ) {
	    return baidu.type(unknow) == "date" && unknow.toString() != 'Invalid Date' && !isNaN(unknow);
	};
	
	baidu.isElement = function( unknow ) {
	    return baidu.type(unknow) == "HTMLElement";
	};
	
	// 20120818 mz 检查对象是否可被枚举，对象可以是：Array NodeList HTMLCollection $DOM
	baidu.isEnumerable = function( unknow ){
	    return unknow != null
	        && typeof unknow == "object"
	        &&(typeof unknow.length == "number"
	        || typeof unknow[0] != "undefined");
	};
	
	baidu.isNumber = function( unknow ) {
	    return baidu.type(unknow) == "number" && isFinite( unknow );
	};
	
	// 20120903 mz 检查对象是否为一个简单对象 {}
	baidu.isPlainObject = function(unknow) {
	    var key,
	        hasOwnProperty = Object.prototype.hasOwnProperty;
	
	    if ( baidu.type(unknow) != "object" ) {
	        return false;
	    }
	
	    //判断new fn()自定义对象的情况
	    //constructor不是继承自原型链的
	    //并且原型中有isPrototypeOf方法才是Object
	    if ( unknow.constructor &&
	        !hasOwnProperty.call(unknow, "constructor") &&
	        !hasOwnProperty.call(unknow.constructor.prototype, "isPrototypeOf") ) {
	        return false;
	    }
	    //判断有继承的情况
	    //如果有一项是继承过来的，那么一定不是字面量Object
	    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
	    for ( key in unknow ) {}
	    return key === undefined || hasOwnProperty.call( unknow, key );
	};
	
	baidu.isObject = function( unknow ) {
	    return typeof unknow === "function" || ( typeof unknow === "object" && unknow != null );
	};
	
	baidu.extend = function(depthClone, object) {
	    var second, options, key, src, copy,
	        i = 1,
	        n = arguments.length,
	        result = depthClone || {},
	        copyIsArray, clone;
	    
	    baidu.isBoolean( depthClone ) && (i = 2) && (result = object || {});
	    !baidu.isObject( result ) && (result = {});
	
	    for (; i<n; i++) {
	        options = arguments[i];
	        if( baidu.isObject(options) ) {
	            for( key in options ) {
	                src = result[key];
	                copy = options[key];
	                // Prevent never-ending loop
	                if ( src === copy ) {
	                    continue;
	                }
	                
	                if(baidu.isBoolean(depthClone) && depthClone && copy
	                    && (baidu.isPlainObject(copy) || (copyIsArray = baidu.isArray(copy)))){
	                        if(copyIsArray){
	                            copyIsArray = false;
	                            clone = src && baidu.isArray(src) ? src : [];
	                        }else{
	                            clone = src && baidu.isPlainObject(src) ? src : {};
	                        }
	                        result[key] = baidu.extend(depthClone, clone, copy);
	                }else if(copy !== undefined){
	                    result[key] = copy;
	                }
	            }
	        }
	    }
	    return result;
	};
	
	baidu.createChain = function(chainName, fn, constructor) {
	    // 创建一个内部类名
	    var className = chainName=="dom"?"$DOM":"$"+chainName.charAt(0).toUpperCase()+chainName.substr(1);
	    var slice = Array.prototype.slice;
	
	    // 构建链头执行方法
	    var chain = baidu[chainName] = baidu[chainName] || fn || function(object) {
	        return baidu.extend(object, baidu[chainName].fn);
	    };
	
	    // 扩展 .extend 静态方法，通过本方法给链头对象添加原型方法
	    chain.extend = function(extended) {
	        var method;
	
	        // 直接构建静态接口方法，如 baidu.array.each() 指向到 baidu.array().each()
	        for (method in extended) {
	            chain[method] = function() {
	                var id = arguments[0];
	
	                // 在新版接口中，ID选择器必须用 # 开头
	                chainName=="dom" && baidu.type(id)=="string" && (id = "#"+ id);
	
	                var object = chain(id);
	                var result = object[method].apply(object, slice.call(arguments, 1));
	
	                // 老版接口返回实体对象 getFirst
	                return baidu.type(result) == "$DOM" ? result.get(0) : result;
	            }
	        }
	        return baidu.extend(baidu[chainName].fn, extended);
	    };
	
	    // 创建 链头对象 构造器
	    baidu[chainName][className] = baidu[chainName][className] || constructor || function() {};
	
	    // 给 链头对象 原型链做一个短名映射
	    chain.fn = baidu[chainName][className].prototype;
	
	    return chain;
	};
	
	baidu.overwrite = function(Class, list, fn) {
		for (var i = list.length - 1; i > -1; i--) {
			Class.prototype[list[i]] = fn(list[i]);
		}
	
		return Class;
	};
	
	baidu.createChain("array", function(array){
	    var pro = baidu.array.$Array.prototype
	        ,ap = Array.prototype
	        ,key;
	
	    baidu.type( array ) != "array" && ( array = [] );
	
	    for ( key in pro ) {
	        ap[key] || (array[key] = pro[key]);
	    }
	
	    return array;
	});
	
	// 对系统方法新产生的 array 对象注入自定义方法，支持完美的链式语法
	baidu.overwrite(baidu.array.$Array, "concat slice".split(" "), function(key) {
		return function() {
			return baidu.array( Array.prototype[key].apply(this, arguments) );
		}
	});
	
	baidu.array.extend({
	    unique : function (fn) {
	        var len = this.length,
	            result = this.slice(0),
	            i, datum;
	            
	        if ('function' != typeof fn) {
	            fn = function (item1, item2) {
	                return item1 === item2;
	            };
	        }
	        
	        // 从后往前双重循环比较
	        // 如果两个元素相同，删除后一个
	        while (--len > 0) {
	            datum = result[len];
	            i = len;
	            while (i--) {
	                if (fn(datum, result[i])) {
	                    result.splice(len, 1);
	                    break;
	                }
	            }
	        }
	
	        len = this.length = result.length;
	        for ( i=0; i<len; i++ ) {
	            this[ i ] = result[ i ];
	        }
	
	        return this;
	    }
	});
	
	baidu.query = baidu.query || (function(){
	    var rId = /^(\w*)#([\w\-\$]+)$/,
	        rId0= /^#([\w\-\$]+)$/
	        rTag = /^\w+$/,
	        rClass = /^(\w*)\.([\w\-\$]+)$/,
	        rComboClass = /^(\.[\w\-\$]+)+$/,
	        rDivider = /\s*,\s*/,
	        rSpace = /\s+/g,
	        slice = Array.prototype.slice;
	
	    // selector: #id, .className, tagName, *
	    function query(selector, context) {
	        var t, x, id, dom, tagName, className, arr, list, array = [];
	
	        // tag#id
	        if (rId.test(selector)) {
	            id = RegExp.$2;
	            tagName = RegExp.$1 || "*";
	
	            // 本段代码效率很差，不过极少流程会走到这段
	            baidu.forEach(context.getElementsByTagName(tagName), function(dom) {
	                dom.id == id && array.push(dom);
	            });
	
	        // tagName or *
	        } else if (rTag.test(selector) || selector == "*") {
	            baidu.merge(array, context.getElementsByTagName(selector));
	
	        // .className
	        } else if (rClass.test(selector)) {
	            arr = [];
	            tagName = RegExp.$1;
	            className = RegExp.$2;
	            t = " " + className + " ";
	            // bug: className: .a.b
	
	            if (context.getElementsByClassName) {
	                arr = context.getElementsByClassName(className);
	            } else {
	                baidu.forEach(context.getElementsByTagName("*"), function(dom) {
	                    dom.className && (" " + dom.className + " ").indexOf(t) > -1 && (arr.push(dom));
	                });
	            }
	
	            if (tagName && (tagName = tagName.toUpperCase())) {
	                baidu.forEach(arr, function(dom) {
	                    dom.tagName.toUpperCase() === tagName && array.push(dom);
	                });
	            } else {
	                baidu.merge(array, arr);
	            }
	        
	        // IE 6 7 8 里组合样式名(.a.b)
	        } else if (rComboClass.test(selector)) {
	            list = selector.substr(1).split(".");
	
	            baidu.forEach(context.getElementsByTagName("*"), function(dom) {
	                if (dom.className) {
	                    t = " " + dom.className + " ";
	                    x = true;
	
	                    baidu.forEach(list, function(item){
	                        t.indexOf(" "+ item +" ") == -1 && (x = false);
	                    });
	
	                    x && array.push(dom);
	                }
	            });
	        }
	
	        return array;
	    }
	
	    // selector 还可以是上述四种情况的组合，以空格分隔
	    // @return ArrayLike
	    function queryCombo(selector, context) {
	        var a, s = selector, id = "__tangram__", array = [];
	
	        // 在 #id 且没有 context 时取 getSingle，其它时 getAll
	        if (!context && rId0.test(s) && (a=document.getElementById(s.substr(1)))) {
	            return [a];
	        }
	
	        context = context || document;
	
	        // 用 querySelectorAll 时若取 #id 这种唯一值时会多选
	        if (context.querySelectorAll) {
	            // 在使用 querySelectorAll 时，若 context 无id将貌似 document 而出错
	            if (context.nodeType == 1 && !context.id) {
	                context.id = id;
	                a = context.querySelectorAll("#" + id + " " + s);
	                context.id = "";
	            } else {
	                a = context.querySelectorAll(s);
	            }
	            return a;
	        } else {
	            if (s.indexOf(" ") == -1) {
	                return query(s, context);
	            }
	
	            baidu.forEach(query(s.substr(0, s.indexOf(" ")), context), function(dom) { // 递归
	                baidu.merge(array, queryCombo(s.substr(s.indexOf(" ") + 1), dom));
	            });
	        }
	
	        return array;
	    }
	
	    return function(selector, context, results) {
	        if (!selector || typeof selector != "string") {
	            return results || [];
	        }
	
	        var arr = [];
	        selector = selector.replace(rSpace, " ");
	        results && baidu.merge(arr, results) && (results.length = 0);
	
	        baidu.forEach(selector.indexOf(",") > 0 ? selector.split(rDivider) : [selector], function(item) {
	            baidu.merge(arr, queryCombo(item, context));
	        });
	
	        return baidu.merge(results || [], baidu.array(arr).unique());
	    };
	})();
	
	baidu.createChain("dom",
	
	// method function
	
	function(selector, context) {
	    var e, me = new baidu.dom.$DOM(context);
	
	    // Handle $(""), $(null), or $(undefined)
	    if (!selector) {
	        return me;
	    }
	
	    // Handle $($DOM)
	    if (selector._type_ == "$DOM") {
	        return selector;
	
	    // Handle $(DOMElement)
	    } else if (selector.nodeType || selector == selector.window) {
	        me[0] = selector;
	        me.length = 1;
	        return me;
	
	    // Handle $(Array) or $(Collection) or $(NodeList)
	    } else if (selector.length && me.toString.call(selector) != "[object String]") {
	        return baidu.merge(me, selector);
	
	    } else if (typeof selector == "string") {
	        // HTMLString
	        if (selector.charAt(0) == "<" && selector.charAt(selector.length - 1) == ">" && selector.length > 2) {
	            if ( baidu.dom.createElements ) {
	                baidu.merge( me, baidu.dom.createElements( selector ) );
	            }
	
	        // baidu.query
	        } else {
	            baidu.query(selector, context, me);
	        }
	    
	    // document.ready
	    } else if (typeof selector == "function") {
	        return me.ready ? me.ready(selector) : me;
	    }
	
	    return me;
	},
	
	// constructor
	function(context) {
	    this.length = 0;
	    this._type_ = "$DOM";
	    this.context = context || document;
	}
	
	).extend({
	
	    
	    size: function() {
	        return this.length;
	    }
	
	    ,splice : function(){}
	
	    
	    ,
	    get: function(index) {
	
	        if ( typeof index == "number" ) {
	            return index < 0 ? this[this.length + index] : this[index];
	        }
	
	        return Array.prototype.slice.call(this, 0);
	    }
	
	    ,toArray: function(){
	        return this.get();
	    }
	
	});
	
	baidu.dom.extend({
	    each : function (iterator) {
	        baidu.check("function", "baidu.dom.each");
	        var i, result,
	            n = this.length;
	
	        for (i=0; i<n; i++) {
	            result = iterator.call( this[i], i, this[i], this );
	
	            if ( result === false || result == "break" ) { break;}
	        }
	
	        return this;
	    }
	});
	
	baidu._util_.access = function(tang, key, value, callback){
	    if(tang.size() <= 0){return tang;}
	    switch(baidu.type(key)){
	        case 'string': //高频
	            if(value === undefined){
	                return callback.call(tang, tang[0], key);
	            }else{
	                tang.each(function(index, item){
	                    callback.call(tang, item, key,
	                        baidu.type(value) === 'function' ? value.call(item, i, callback.call(tang, item, key)) : value);
	                });
	            }
	            break;
	        case 'object':
	            for(var i in key){
	                baidu._util_.access.call(tang, i, key[i], callback);
	            }
	            break;
	    }
	    return tang;
	};
	
	baidu.array.extend({
	    indexOf : function (match, fromIndex) {
	        baidu.check(".+(,number)?","baidu.array.indexOf");
	        var len = this.length;
	
	        // 小于 0
	        (fromIndex = fromIndex | 0) < 0 && (fromIndex = Math.max(0, len + fromIndex));
	
	        for ( ; fromIndex < len; fromIndex++) {
	            if(fromIndex in this && this[fromIndex] === match) {
	                return fromIndex;
	            }
	        }
	        
	        return -1;
	    }
	});
	
	baidu.createChain("Callbacks",
	//copy from jquery 1.8.2,thanks for jquery
	
	// 执行方法
	function(options){
	
		// String to Object options format cache
		var optionsCache = {};
	
		// Convert String-formatted options into Object-formatted ones and store in cache
		function createOptions( options ) {
			var object = optionsCache[ options ] = {};
			baidu.forEach( options.split(/\s+/), function( flag, _ ) {
				object[ flag ] = true;
			});
			return object;
		};
	
		
		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			( optionsCache[ options ] || createOptions( options ) ) :
			baidu.extend( {}, options );
	
		var // Last fire value (for non-forgettable lists)
			memory,
			// Flag to know if list was already fired
			fired,
			// Flag to know if list is currently firing
			firing,
			// First callback to fire (used internally by add and fireWith)
			firingStart,
			// End of the loop when firing
			firingLength,
			// Index of currently firing callback (modified by remove if needed)
			firingIndex,
			// Actual callback list
			list = [],
			// Stack of fire calls for repeatable lists
			stack = !options.once && [],
			// Fire callbacks
			fire = function( data ) {
				memory = options.memory && data;
				fired = true;
				firingIndex = firingStart || 0;
				firingStart = 0;
				firingLength = list.length;
				firing = true;
				for ( ; list && firingIndex < firingLength; firingIndex++ ) {
					if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
						memory = false; // To prevent further calls using add
						break;
					}
				}
				firing = false;
				if ( list ) {
					if ( stack ) {
						if ( stack.length ) {
							fire( stack.shift() );
						}
					} else if ( memory ) {
						list = [];
					} else {
						self.disable();
					}
				}
			},
			// Actual Callbacks object
			self = {
				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {
						// First, we save the current length
						var start = list.length;
						(function add( args ) {
							baidu.forEach( args, function( arg, _) {
								if ( (typeof arg === 'function') && ( !options.unique || !self.has( arg ) ) ) {
									list.push( arg );
								} else if ( arg && arg.length ) {
									// Inspect recursively
									add( arg );
								}
							});
						})( arguments );
						// Do we need to add the callbacks to the
						// current firing batch?
						if ( firing ) {
							firingLength = list.length;
						// With memory, if we're not firing then
						// we should call right away
						} else if ( memory ) {
							firingStart = start;
							fire( memory );
						}
					}
					return this;
				},
				// Remove a callback from the list
				remove: function() {
					if ( list ) {
						baidu.forEach( arguments, function( arg, _ ) {
							var index;
							while( ( index = baidu.array(list).indexOf(arg,index) ) > -1 ) {
								list.splice( index, 1 );
								// Handle firing indexes
								if ( firing ) {
									if ( index <= firingLength ) {
										firingLength--;
									}
									if ( index <= firingIndex ) {
										firingIndex--;
									}
								}
							}
						});
					}
					return this;
				},
				// Control if a given callback is in the list
				has: function( fn ) {
					return baidu.array(list).indexOf(fn) > -1;
				},
				// Remove all callbacks from the list
				empty: function() {
					list = [];
					return this;
				},
				// Have the list do nothing anymore
				disable: function() {
					list = stack = memory = undefined;
					return this;
				},
				// Is it disabled?
				disabled: function() {
					return !list;
				},
				// Lock the list in its current state
				lock: function() {
					stack = undefined;
					if ( !memory ) {
						self.disable();
					}
					return this;
				},
				// Is it locked?
				locked: function() {
					return !stack;
				},
				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( list && ( !fired || stack ) ) {
						if ( firing ) {
							stack.push( args );
						} else {
							fire( args );
						}
					}
					return this;
				},
				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};
	
		return self;
	},
	// constructor
	function(){});
	
	baidu.createChain("Deferred",
	//copy from jquery 1.8.2,thanks for jquery
	
	// 执行方法
	function( func ) {
		var core_slice = Array.prototype.slice;
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", baidu.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", baidu.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", baidu.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function(  ) {
					var fns = arguments;
					return baidu.Deferred(function( newDefer ) {
						baidu.forEach( tuples, function( tuple, i ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( (typeof fn === 'function') ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && ( typeof returned.promise === 'function') ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return typeof obj === "object" ? baidu.extend( obj, promise ) : promise;
				}
			},
			deferred = {};
	
		// Keep pipe for back-compat
		promise.pipe = promise.then;
	
		// Add list-specific methods
		baidu.forEach( tuples, function( tuple,i ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];
	
			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;
	
			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;
	
				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}
	
			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});
	
		// Make the deferred a promise
		promise.promise( deferred );
	
		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}
	
		baidu.extend(baidu,{
			// Deferred helper
			when: function( subordinate  ) {
				var i = 0,
					resolveValues = core_slice.call( arguments ),
					length = resolveValues.length,
	
					// the count of uncompleted subordinates
					remaining = length !== 1 || ( subordinate && (typeof subordinate.promise === 'function') ) ? length : 0,
	
					// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
					deferred = remaining === 1 ? subordinate : baidu.Deferred(),
	
					// Update function for both resolve and progress values
					updateFunc = function( i, contexts, values ) {
						return function( value ) {
							contexts[ i ] = this;
							values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
							if( values === progressValues ) {
								deferred.notifyWith( contexts, values );
							} else if ( !( --remaining ) ) {
								deferred.resolveWith( contexts, values );
							}
						};
					},
	
					progressValues, progressContexts, resolveContexts;
	
				// add listeners to Deferred subordinates; treat others as resolved
				if ( length > 1 ) {
					progressValues = new Array( length );
					progressContexts = new Array( length );
					resolveContexts = new Array( length );
					for ( ; i < length; i++ ) {
						if ( resolveValues[ i ] && (typeof resolveValues[ i ].promise ==='function') ) {
							resolveValues[ i ].promise()
								.done( updateFunc( i, resolveContexts, resolveValues ) )
								.fail( deferred.reject )
								.progress( updateFunc( i, progressContexts, progressValues ) );
						} else {
							--remaining;
						}
					}
				}
	
				// if we're not waiting on anything, resolve the master
				if ( !remaining ) {
					deferred.resolveWith( resolveContexts, resolveValues );
				}
	
				return deferred.promise();
			}	
		});
	
		// All done!
		return deferred;
	},
	// constructor
	function(){});
	
	baidu.dom.extend({
	    ready: function(){
	
	        var me = this,
	
	            // The deferred used on DOM ready
	            readyList,
	
	            // Use the correct document accordingly with window argument (sandbox)
	            document = window.document;
	
	        // Is the DOM ready to be used? Set to true once it occurs.
	        baidu._util_.isDomReady = false;
	
	        // A counter to track how many items to wait for before
	        // the ready event fires. See #6781
	        baidu._util_._readyWait = 1;
	
	        // Hold (or release) the ready event
	        baidu.dom.holdReady = function( hold ) {
	            if ( hold ) {
	                baidu._util_.readyWait++;
	            } else {
	                _ready( true );
	            }
	        };
	
	        // Handle when the DOM is ready
	        var _ready = function( wait ) {
	
	            // Abort if there are pending holds or we're already ready
	            if ( wait === true ? --baidu._util_.readyWait : baidu._util_.isDomReady ) {
	                return;
	            }
	
	            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
	            if ( !document.body ) {
	                return setTimeout( _ready, 1 );
	            }
	
	            // Remember that the DOM is ready
	            baidu._util_.isReady = true;
	
	            // If a normal DOM Ready event fired, decrement, and wait if need be
	            if ( wait !== true && --baidu._util_.readyWait > 0 ) {
	                return;
	            }
	
	            // If there are functions bound, to execute
	            readyList.resolveWith( document );
	
	            // Trigger any bound ready events
	            if ( baidu.dom.trigger ) {
	                baidu.dom( document ).trigger("ready").off("ready");
	            }
	        };
	
	        var DOMContentLoaded = function() {
	            if ( document.addEventListener ) {
	                document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	                _ready();
	            } else if ( document.readyState === "complete" ) {
	                // we're here because readyState === "complete" in oldIE
	                // which is good enough for us to call the dom ready!
	                document.detachEvent( "onreadystatechange", DOMContentLoaded );
	                _ready();
	            }
	        };
	
	        var readyPromise = function( obj ) {
	            if ( !readyList ) {
	
	                readyList = baidu.Deferred();
	
	                // Catch cases where $(document).ready() is called after the browser event has already occurred.
	                // we once tried to use readyState "interactive" here, but it caused issues like the one
	                // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
	                if ( document.readyState === "complete" ) {
	                    // Handle it asynchronously to allow scripts the opportunity to delay ready
	                    setTimeout( _ready, 1 );
	
	                // Standards-based browsers support DOMContentLoaded
	                } else if ( document.addEventListener ) {
	                    // Use the handy event callback
	                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	
	                    // A fallback to window.onload, that will always work
	                    window.addEventListener( "load", _ready, false );
	
	                // If IE event model is used
	                } else {
	                    // Ensure firing before onload, maybe late but safe also for iframes
	                    document.attachEvent( "onreadystatechange", DOMContentLoaded );
	
	                    // A fallback to window.onload, that will always work
	                    window.attachEvent( "onload", _ready );
	
	                    // If IE and not a frame
	                    // continually check to see if the document is ready
	                    var top = false;
	
	                    try {
	                        top = window.frameElement == null && document.documentElement;
	                    } catch(e) {}
	
	                    if ( top && top.doScroll ) {
	                        (function doScrollCheck() {
	                            if ( !baidu._util_.isDomReady ) {
	
	                                try {
	                                    // Use the trick by Diego Perini
	                                    // http://javascript.nwbox.com/IEContentLoaded/
	                                    top.doScroll("left");
	                                } catch(e) {
	                                    return setTimeout( doScrollCheck, 50 );
	                                }
	
	                                // and execute any waiting functions
	                                _ready();
	                            }
	                        })();
	                    }
	                }
	            }
	            return readyList.promise( obj );
	        };
	
	        return function( fn ) {
	
	            // Add the callback
	            readyPromise().done( fn );
	
	            return me;
	        }
	
	    }()
	});
	
	/// Tangram 1.x Code Start
	baidu.dom.ready = baidu.dom.fn.ready;
	/// Tangram 1.x Code End
	
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
	
	baidu.extend(baidu._util_,{
		rfocusable:/^(?:button|input|object|select|textarea)$/i,
		rclickable:/^a(?:rea)?$/i,
		rboolean:/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
		propFix:{
			tabindex: "tabIndex",
			readonly: "readOnly",
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		},
		propHooks: {
			tabIndex:{
				get: function( elem ) {
	
					var bu = baidu._util_;
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					var attributeNode = elem.getAttributeNode("tabindex");
	
					return attributeNode && attributeNode.specified ?
						parseInt( attributeNode.value, 10 ) :
						bu.rfocusable.test( elem.nodeName ) || bu.rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							undefined;
				}
			}
		}
	});
	
	// IE6/7 call enctype encoding
	if ( !baidu.support.enctype ) {
		var bu = baidu._util_;
		bu.propFix.enctype = "encoding";
	};
	
	// Safari mis-reports the default selected property of an option
	// Accessing the parent's selectedIndex property fixes it
	if ( !baidu.support.optSelected ) {
		var bu = baidu._util_;
		bu.propHooks.selected = baidu.extend( bu.propHooks.selected, {
			get: function( elem ) {
				var parent = elem.parentNode;
	
				if ( parent ) {
					parent.selectedIndex;
	
					// Make sure that it also works with optgroups, see #5701
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
				return null;
			}
		});
	};
	
	baidu.extend(baidu,{
	    _error : function( msg ) {
	        throw new Error( msg );
	    },
	    _nodeName : function( elem, name ) {
	        return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	    }    
	});
	
	baidu.extend(baidu._util_,{
		rfocusable : /^(?:button|input|object|select|textarea)$/i,
		rtype : /^(?:button|input)$/i,
		rclickable : /^a(?:rea)?$/i,
		nodeHook:{},
		attrHooks: {
			type: {
				set: function( elem, value ) {
					var bu = baidu._util_;
					// We can't allow the type property to be changed (since it causes problems in IE)
					if ( bu.rtype.test( elem.nodeName ) && elem.parentNode ) {
						baidu._error( "type property can't be changed" );
					} else if ( !baidu.support.radioValue && value === "radio" && baidu._nodeName(elem, "input") ) {
						// Setting the type on a radio button after the value resets the value in IE6-9
						// Reset value to it's default in case type is set after value
						// This is for element creation
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			},
			// Use the value property for back compat
			// Use the nodeHook for button elements in IE6/7 (#1954)
			value: {
				get: function( elem, name ) {
					var bu = baidu._util_;
					if ( bu.nodeHook && baidu._nodeName( elem, "button" ) ) {
						return bu.nodeHook.get( elem, name );
					}
					return name in elem ?
						elem.value :
						null;
				},
				set: function( elem, value, name ) {
					if ( bu.nodeHook && baidu._nodeName( elem, "button" ) ) {
						return bu.nodeHook.set( elem, value, name );
					}
					// Does not return so that setAttribute is also used
					elem.value = value;
				}
			}
		},
		// Hook for boolean attributes
		boolHook : {
			get: function( elem, name ) {
				// Align boolean attributes with corresponding properties
				// Fall back to attribute presence where some booleans are not supported
				var attrNode,
					property = baidu(elem).prop( name );
				return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
					name.toLowerCase() :
					undefined;
			},
			set: function( elem, value, name ) {
				var propName;
				if ( value === false ) {
					// Remove boolean attributes when set to false
					baidu(elem).removeAttr( name );
				} else {
					// value is true since we know at this point it's type boolean and not false
					// Set boolean attributes to the same name and set the DOM property
					propName = baidu._util_.propFix[ name ] || name;
					if ( propName in elem ) {
						// Only set the IDL specifically if it already exists on the element
						elem[ propName ] = true;
					}
	
					elem.setAttribute( name, name.toLowerCase() );
				}
				return name;
			}
		}
	});
	
	// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
	baidu._util_.attrHooks.tabindex = baidu._util_.propHooks.tabIndex;
	
	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !baidu.support.getSetAttribute ) {
	
		var bu = baidu._util_,
			fixSpecified = {
				name: true,
				id: true,
				coords: true
			};
	
		// Use this for any attribute in IE6/7
		// This fixes almost every IE6/7 issue
		bu.nodeHook = {
			get: function( elem, name ) {
				var ret;
				ret = elem.getAttributeNode( name );
				return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
					ret.nodeValue :
					undefined;
			},
			set: function( elem, value, name ) {
				// Set the existing or create a new attribute node
				var ret = elem.getAttributeNode( name );
				if ( !ret ) {
					ret = document.createAttribute( name );
					elem.setAttributeNode( ret );
				}
				return ( ret.nodeValue = value + "" );
			}
		};
	
		// Apply the nodeHook to tabindex
		bu.attrHooks.tabindex.set = bu.nodeHook.set;
	
	    // Set width and height to auto instead of 0 on empty string( Bug #8150 )
	    // This is for removals
	    baidu.forEach([ "width", "height" ], function( name ) {
	        bu.attrHooks[ name ] = baidu.extend( bu.attrHooks[ name ], {
	            set: function( elem, value ) {
	                if ( value === "" ) {
	                    elem.setAttribute( name, "auto" );
	                    return value;
	                }
	            }
	        });
	    });
	
		// Set contenteditable to false on removals(#10429)
		// Setting to empty string throws an error as an invalid value
		bu.attrHooks.contenteditable = {
			get: bu.nodeHook.get,
			set: function( elem, value, name ) {
				if ( value === "" ) {
					value = "false";
				}
				bu.nodeHook.set( elem, value, name );
			}
		};
	};
	
	// Some attributes require a special call on IE
	if ( !baidu.support.hrefNormalized ) {
		var bu = baidu._util_;
	    baidu.forEach([ "href", "src", "width", "height" ], function( name ) {
	        bu.attrHooks[ name ] = baidu.extend( bu.attrHooks[ name ], {
	            get: function( elem ) {
	                var ret = elem.getAttribute( name, 2 );
	                return ret === null ? undefined : ret;
	            }
	        });
	    });
	};
	
	if ( !baidu.support.style ) {
		var bu = baidu._util_;
		bu.attrHooks.style = {
			get: function( elem ) {
				// Return undefined in the case of empty string
				// Normalize to lowercase since IE uppercases css property names
				return elem.style.cssText.toLowerCase() || undefined;
			},
			set: function( elem, value ) {
				return ( elem.style.cssText = "" + value );
			}
		};
	};
	
	baidu.global = baidu.global || (function() {
	    baidu._global_ = window[ baidu.guid ];
	    var global = baidu._global_._ = {};
	
	    return function( key, value, overwrite ) {
	        if ( typeof value != "undefined" ) {
	            if(!overwrite) {
	                value = typeof global[ key ] == "undefined" ? value : global[ key ];
	            }
	            global[ key ] =  value;
	
	        } else if (key && typeof global[ key ] == "undefined" ) {
	            global[ key ] = {};
	        }
	
	        return global[ key ];
	    }
	})();
	
	baidu.browser = baidu.browser || function(){
	    var ua = navigator.userAgent;
	    
	    var result = {
	        isStrict : document.compatMode == "CSS1Compat"
	        ,isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua)
	        ,isWebkit: /webkit/i.test(ua)
	    };
	
	    try{/(\d+\.\d+)/.test(external.max_version) && (result.maxthon = + RegExp['\x241'])} catch (e){};
	
	    // 蛋疼 你懂的
	    switch (true) {
	        case /msie (\d+\.\d+)/i.test(ua) :
	            result.ie = document.documentMode || + RegExp['\x241'];
	            break;
	        case /chrome\/(\d+\.\d+)/i.test(ua) :
	            result.chrome = + RegExp['\x241'];
	            break;
	        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) :
	            result.safari = + (RegExp['\x241'] || RegExp['\x242']);
	            break;
	        case /firefox\/(\d+\.\d+)/i.test(ua) : 
	            result.firefox = + RegExp['\x241'];
	            break;
	        
	        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua) :
	            result.opera = + ( RegExp["\x244"] || RegExp["\x241"] );
	            break;
	    }
	           
	    baidu.extend(baidu, result);
	
	    return result;
	}();
	
	baidu.id = function() {
	    var maps = baidu.global("_maps_id")
	        ,key = baidu.key;
	
	    baidu.global("_counter", 1, true);
	
	    return function( object, command ) {
	        var e
	            ,str_1= baidu.isString( object )
	            ,obj_1= baidu.isObject( object )
	            ,id = obj_1 ? object[ key ] : str_1 ? object : "";
	
	        // 第二个参数为 String
	        if ( baidu.isString( command ) ) {
	            switch ( command ) {
	            case "get" :
	                return obj_1 ? id : maps[id];
	            break;
	            case "remove" :
	            case "delete" :
	                if ( e = maps[id] ) {
	                    // 20120827 mz IE低版本给 element[key] 赋值时会写入DOM树，因此在移除的时候需要使用remove
	                    if (baidu.isElement(e) && baidu.browser.ie < 7) {
	                        e.removeAttribute(key);
	                    } else {
	                        delete e[ key ];
	                    }
	                    delete maps[ id ];
	                }
	                return id;
	            break;
	            case "decontrol" : 
	                !(e = maps[id]) && obj_1 && ( object[ key ] = id = baidu.id() );
	                id && delete maps[ id ];
	                return id;
	            break;
	            default :
	                if ( str_1 ) {
	                    (e = maps[ id ]) && delete maps[ id ];
	                    e && ( maps[ e[ key ] = command ] = e );
	                } else if ( obj_1 ) {
	                    id && delete maps[ id ];
	                    maps[ object[ key ] = command ] = object;
	                }
	                return command;
	            }
	        }
	
	        // 第一个参数不为空
	        if ( obj_1 ) {
	            !id && (maps[ object[ key ] = id = baidu.id() ] = object);
	            return id;
	        } else if ( str_1 ) {
	            return maps[ object ];
	        }
	
	        return "TANGRAM__" + baidu._global_._._counter ++;
	    };
	}();
	
	baidu.id.key = "tangram_guid";
	
	//TODO: mz 20120827 在低版本IE做delete操作时直接 delete e[key] 可能出错，这里需要重新评估，重写
	
	baidu._util_.eventBase = {};
	
	baidu._util_.cleanData = function(array){
	    var tangId;
	    for(var i = 0, ele; ele = array[i]; i++){
	        tangId = baidu.id(ele, 'get');
	        if(!tangId){continue;}
	        baidu._util_.eventBase.removeAll(ele);
	        baidu.id(ele, 'remove');
	    }
	}
	baidu._util_.contains = document.compareDocumentPosition ?
	    function(container, contained){
	        return !!(container.compareDocumentPosition( contained ) & 16);
	    } : document.contains ? function(container, contained){
	        return container != contained
	            && (container.contains ? container.contains( contained ) : false)
	    } : function(container, contained){
	        while(contained = contained.parentNode){
	            if(contained === container){return true;}
	        }
	        return false;
	    };
	
	baidu.object = baidu.object || {};
	
	baidu.object.isEmpty = function(obj) {
	    var ret = true;
	    if('[object Array]' === Object.prototype.toString.call(obj)){
	        ret = !obj.length;
	    }else{
	        obj = new Object(obj);
	        for(var key in obj){
	            return false;
	        }
	    }
	    return ret;
	};
	
	baidu.json = baidu.json || {};
	
	baidu.json.parse = function (data) {
	    //2010/12/09：更新至不使用原生parse，不检测用户输入是否正确
	    return (new Function("return (" + data + ")"))();
	};
	
	;(function(){
	
	var rbrace = /^(?:\{.*\}|\[.*\])$/,
		rmultiDash = /([A-Z])/g,
	
		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,
	
		fcamelCase = function( all, letter ) {
			return ( letter + "" ).toUpperCase();
		};
	
	baidu.extend(baidu._util_,{
	
		// Convert dashed to camelCase; used by the css and data modules
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		}
	});
	
	//Copy from jQuery 1.8 , thank you for jQuery 
	baidu.extend(baidu._util_,{
		cache: {},
	
		deletedIds: [],
	
		// Please use with caution
		uuid: 0,
	
		// Unique for each copy of baidu on the page
		// Non-digits removed to match rinlinebaidu
		expando: "baidu" + ( '2.0.0' + Math.random() ).replace( /\D/g, "" ),
	
		// The following elements throw uncatchable exceptions if you
		// attempt to add expando properties to them.
		noData: {
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},
	
		hasData: function( elem ) {
			elem = elem.nodeType ? baidu._util_.cache[ elem[baidu._util_.expando] ] : elem[ baidu._util_.expando ];
			return !!elem && !isEmptyDataObject( elem );
		},
	
		data: function( elem, name, data, pvt  ) {
			if ( !baidu._util_.acceptData( elem ) ) {
				return;
			}
	
			var thisCache, ret,
				internalKey = baidu._util_.expando,
				getByName = typeof name === "string",
	
				// We have to handle DOM nodes and JS objects differently because IE6-7
				// can't GC object references properly across the DOM-JS boundary
				isNode = elem.nodeType,
	
				//这部分为jQuery全局的缓存设计，目前tangram2.0中没有设计该部分功能，但是使用涉及到这部分的接口全部正常。
				// Only DOM nodes need the global baidu cache; JS object data is
				// attached directly to the object so GC can occur automatically
				cache = isNode ? baidu._util_.cache : elem,
	
				// Only defining an ID for JS objects if its cache already exists allows
				// the code to shortcut on the same path as a DOM node with no cache
				id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;
	
			// Avoid doing any more work than we need to when trying to get data on an
			// object that has no data at all
			if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
				return;
			}
	
			if ( !id ) {
				// Only DOM nodes need a new unique ID for each element since their data
				// ends up in the global cache
				if ( isNode ) {
					elem[ internalKey ] = id = baidu._util_.deletedIds.pop() || ++baidu._util_.uuid;
				} else {
					id = internalKey;
				}
			}
	
			if ( !cache[ id ] ) {
				cache[ id ] = {};
	
				// Avoids exposing baidu metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if ( !isNode ) {
					cache[ id ].toJSON = function() {};
				}
			}
	
			// An object can be passed to baidu.dom.data instead of a key/value pair; this gets
			// shallow copied over onto the existing cache
			if ( typeof name === "object" || typeof name === "function" ) {
				if ( pvt ) {
					cache[ id ] = baidu.extend( cache[ id ], name );
				} else {
					cache[ id ].data = baidu.extend( cache[ id ].data, name );
				}
			}
	
			thisCache = cache[ id ];
	
			// baidu data() is stored in a separate object inside the object's internal data
			// cache in order to avoid key collisions between internal data and user-defined
			// data.
			if ( !pvt ) {
				if ( !thisCache.data ) {
					thisCache.data = {};
				}
	
				thisCache = thisCache.data;
			}
	
			if ( data !== undefined ) {
				thisCache[ baidu._util_.camelCase( name ) ] = data;
			}
	
			// Check for both converted-to-camel and non-converted data property names
			// If a data property was specified
			if ( getByName ) {
	
				// First Try to find as-is property data
				ret = thisCache[ name ];
	
				// Test for null|undefined property data
				if ( ret == null ) {
	
					// Try to find the camelCased property
					ret = thisCache[ baidu._util_.camelCase( name ) ];
				}
			} else {
				ret = thisCache;
			}
	
			return ret;
		},
	
		removeData: function( elem, name, pvt  ) {
			if ( !baidu._util_.acceptData( elem ) ) {
				return;
			}
	
			var thisCache, i, l,
	
				isNode = elem.nodeType,
	
				cache = isNode ? baidu._util_.cache : elem,
				id = isNode ? elem[ baidu._util_.expando ] : baidu._util_.expando;
	
			// If there is already no cache entry for this object, there is no
			// purpose in continuing
			if ( !cache[ id ] ) {
				return;
			}
	
			if ( name ) {
	
				thisCache = pvt ? cache[ id ] : cache[ id ].data;
	
				if ( thisCache ) {
	
					// Support array or space separated string names for data keys
					if ( !baidu.isArray( name ) ) {
	
						// try the string as a key before any manipulation
						if ( name in thisCache ) {
							name = [ name ];
						} else {
	
							// split the camel cased version by spaces unless a key with the spaces exists
							name = baidu._util_.camelCase( name );
							if ( name in thisCache ) {
								name = [ name ];
							} else {
								name = name.split(" ");
							}
						}
					}
	
					for ( i = 0, l = name.length; i < l; i++ ) {
						delete thisCache[ name[i] ];
					}
	
					// If there is no data left in the cache, we want to continue
					// and let the cache object itself get destroyed
					if ( !( pvt ? isEmptyDataObject : baidu.object.isEmpty )( thisCache ) ) {
						return;
					}
				}
			}
	
			if ( !pvt ) {
				delete cache[ id ].data;
	
				// Don't destroy the parent cache unless the internal data object
				// had been the only thing left in it
				if ( !isEmptyDataObject( cache[ id ] ) ) {
					return;
				}
			}
	
			// Destroy the cache
			if ( isNode ) {
				baidu._util_.cleanData( [ elem ], true );
	
			// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
			} else if ( baidu.support.deleteExpando || cache != cache.window ) {
				delete cache[ id ];
	
			// When all else fails, null
			} else {
				cache[ id ] = null;
			}
		},
	
		// For internal use only.
		_data: function( elem, name, data ) {
			return baidu._util_.data( elem, name, data, true );
		},
	
		// A method for determining if a DOM node can handle the data expando
		acceptData: function( elem ) {
			var noData = elem.nodeName && baidu._util_.noData[ elem.nodeName.toLowerCase() ];
	
			// nodes accept data unless otherwise specified; rejection can be conditional
			return !noData || noData !== true && elem.getAttribute("classid") === noData;
		}
	});
	
	//TODO data的入口
	
	function dataAttr( elem, key, data ) {
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
	
			var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
	
			data = elem.getAttribute( name );
	
			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					baidu.isNumber( data ) ? +data :
						rbrace.test( data ) ? baidu.json.parse( data ) :
						data;
				} catch( e ) {}
	
				// Make sure we set the data so it isn't changed later
				baidu._util_.data( elem, key, data );
	
			} else {
				data = undefined;
			}
		}
	
		return data;
	}
	
	// checks a cache object for emptiness
	function isEmptyDataObject( obj ) {
		var name;
		for ( name in obj ) {
	
			// if the public data object is empty, the private is still empty
			if ( name === "data" && baidu.object.isEmpty( obj[name] ) ) {
				continue;
			}
			if ( name !== "toJSON" ) {
				return false;
			}
		}
	
		return true;
	}
	
	//
	})();
	
	baidu.createChain("event",
	
	// 执行方法
	function(){
	    var lastEvt = {};
	    return function( event, json ){
	        switch( baidu.type( event ) ){
	            // event
	            case "object":
	                return lastEvt.originalEvent === event ? lastEvt : ( lastEvt = new baidu.event.$Event( event ) );
	
	            case "$Event":
	                return event;
	
	            // event type
	            case "string" :
	                var e = new baidu.event.$Event( event );
	                typeof json == "object" && baidu.forEach( e, json );
	                return e;
	        }
	    }
	}(),
	
	// constructor
	function( event ){
	    var e, t, f;
	    var me = this;
	
	    this._type_ = "$Event";
	
	    if( typeof event == "object" && event.type ){
	        me.originalEvent = e = event;
	
	        baidu.forEach( "altKey bubbles button buttons cancelable clientX clientY ctrlKey commandKey currentTarget fromElement metaKey screenX screenY shiftKey toElement type view which triggerData".split(" "), function(item){
	            me[ item ] = e[ item ];
	        });
	
	        me.target = me.srcElement = e.srcElement || (( t = e.target ) && ( t.nodeType == 3 ? t.parentNode : t ));
	        me.relatedTarget = e.relatedTarget || (( t = e.fromElement ) && (t === me.target ? e.toElement : t ));
	
	        me.keyCode = me.which = e.keyCode || e.which;
	
	        // Add which for click: 1 === left; 2 === middle; 3 === right
	        if( !me.which && e.button !== undefined )
	            me.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
	
	        var doc = document.documentElement, body = document.body;
	
	        me.pageX = e.pageX || (e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0));
	        me.pageY = e.pageY || (e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0));
	
	        me.data;
	    }
	
	    // event.type
	    typeof event == "string" && ( this.type = event );
	
	    // event.timeStamp
	    this.timeStamp = new Date().getTime();
	}
	
	// 扩展两个常用方法
	).extend({
	    // 阻止事件冒泡
	    stopPropagation : function() {
	        var e = this.originalEvent;
	
	        e && (e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true);
	    }
	
	    // 阻止事件默认行为
	    ,preventDefault : function() {
	        var e = this.originalEvent;
	
	        e && (e.preventDefault ? e.preventDefault() : e.returnValue = false);
	    }
	});
	
	void function( base, listener ){
		listener = base.listener = {};
		
		if( window.addEventListener )
		    listener.add = function( target, name, fn ){
		        target.addEventListener( name, fn, false );
		    };
		else if( window.attachEvent )
			listener.add = function( target, name, fn ){
		        target.attachEvent( "on" + name, fn );
		    };
	}( baidu._util_.eventBase );
	
	void function( base, be ){
		var I = baidu.id;
		var attaCache = {};
	    var queue = base.queue = {};
	    var listener = base.listener;
	
	    queue.get = function( target, type, bindType, attachElements ){
	        var id = I( target ), c;
	
	        if( !attaCache[id] )
	            attaCache[id] = {};
	        
	        c = attaCache[id];
	
	        if( type ){
	            if( !c[type] )
	                this.setupCall( target, type, bindType, c[ type ] = [], attachElements );
	            return c[type];
	        }else return c;
	    };
	
	    queue.add = function( target, type, bindType, item, attachElements ){
	    	this.get( target, type, bindType, attachElements ).push( item );
	    };
	
	    queue.remove = function( target, type, fn ){
	        var arr, c;
	        if( type ){
	            var arr = this.get( target, type );
	            if( fn ){
	                for(var i = arr.length - 1; i >= 0; i --)
	                	if( arr[i].orig == fn )
	                		arr.splice( i, 1 );
	            }else{
	                arr.length = 0;
	            }
	        }else{
	            var c = this.get( target );
	            for(var i in c)
	            	c[i].length = 0;
	        }
	    };
	
	    queue.call = function( target, type, fnAry, e ){
	        if( fnAry ){
	            if( !fnAry.length )
	                return ;
	
	            var args = [].slice.call( arguments, 1 ), one = [];
	                args.unshift( e = baidu.event( e || type ) );          
	                e.type = type;
	
	            if( !e.currentTarget )
	                e.currentTarget = target;
	
	            for( var i = 0, r, l = fnAry.length; i < l; i ++ ){
	                r = fnAry[i];
	                r.pkg.apply( target, args );
	                if( r.one )
	                    one.unshift( i );
	            }
	
	            if( one.length )
	                for(var i = 0, l = one.length; i < l; i ++)
	                    this.remove( target, type, fnAry[i].fn );
	                
	        }else{
	            fnAry = this.get( target, type );
	            this.call( target, type, fnAry, e );
	        }
	    };
	
	    queue.setupCall = function(){
	        var add = function( target, type, bindType, fnAry ){
	            listener.add( target, bindType, function( e ){
	                queue.call( target, type, fnAry, e );
	            } );
	        };
	        return function( target, type, bindType, fnAry, attachElements ){
	            if( !attachElements )
	                add( target, type, bindType, fnAry );
	            else{
	                target = baidu.dom( attachElements, target );
	                for(var i = 0, l = target.length; i < l; i ++)
	                    add( target[i], type, bindType, fnAry );
	            }
	        };
	    }();
	
	}( baidu._util_.eventBase, baidu.event );
	/// Tangram 1.x Code Start
	
	baidu.dom._g = function(id){
	    return baidu.type(id) === 'string' ? document.getElementById(id) : id;
	}
	/// Tangram 1.x Code End
	
	 
	baidu.dom.extend({
	    contains : function(contained) {
	        var container = this[0];
	            contained = baidu.dom(contained)[0];
	        if(!container || !contained){return false;}
	        return baidu._util_.contains(container, contained);
	    }	
	});
	/// Tangram 1.x Code Start
	baidu.dom.contains = function (container, contained) {
	    var g = baidu.dom._g;
	    container = g(container);
	    contained = g(contained);
	    return baidu._util_.contains(container, contained);
	};
	/// Tangram 1.x Code End
	
	baidu.each = function( enumerable, iterator, context ) {
	    var i, n, t, result;
	
	    if ( typeof iterator == "function" && enumerable) {
	
	        // Array or ArrayLike or NodeList or String or ArrayBuffer
	        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
	        if ( typeof n == "number" ) {
	
	            // 20121030 function.length
	            //safari5.1.7 can not use typeof to check nodeList - linlingyu
	            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
	                return enumerable;
	            }
	
	            for ( i=0; i<n; i++ ) {
	
	                t = enumerable[ i ] || (enumerable.charAt && enumerable.charAt( i ));
	
	                // 被循环执行的函数，默认会传入三个参数(i, array[i], array)
	                result = iterator.call( context || t, i, t, enumerable );
	
	                // 被循环执行的函数的返回值若为 false 和"break"时可以影响each方法的流程
	                if ( result === false || result == "break" ) {break;}
	            }
	        
	        // enumerable is number
	        } else if (typeof enumerable == "number") {
	
	            for (i=0; i<enumerable; i++) {
	                result = iterator.call( context || i, i, i, i);
	                if ( result === false || result == "break" ) { break;}
	            }
	        
	        // enumerable is json
	        } else if (typeof enumerable == "object") {
	
	            for (i in enumerable) {
	                if ( enumerable.hasOwnProperty(i) ) {
	                    result = iterator.call( context || enumerable[ i ], i, enumerable[ i ], enumerable );
	
	                    if ( result === false || result == "break" ) { break;}
	                }
	            }
	        }
	    }
	
	    return enumerable;
	};
	
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
	
	void function(){
	    var arr = ("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu").split(" ");
	
	    var conf = {};
	    var create = function( name ){
	        conf[ name ] = function( data, fn ){
			    if( fn == null )
			    	fn = data,
			    	data = null;
	
			    return arguments.length > 0 ?
			    	this.on( name, null, data, fn ) :
			    	this.trigger( name );
			}
	    };
	
		for(var i = 0, l = arr.length; i < l; i ++)
			create( arr[i] );
	
		baidu.dom.extend( conf );
	}();
	
	void function( base, be ){
	    var queue = base.queue;
	    var core = base.core = {};
	    var special = be.special = {};
	
	    var findVestedEl = function( target, parents ){
	        for( var i = 0, l = parents.length; i < l; i ++ )
	        	if( parents.get(i).contains( target ) )
	        		return parents[i];
	    };
	
	    core.build = function( target, name, fn, selector, data ){
	
	    	var bindElements;
	    	if( selector )
	    	    bindElements = baidu.dom( selector, target );
	
	        if( ( name in special ) && special[name].pack )
	            fn = special[name].pack( fn );
	
	        return function( e ){ // e is instance of baidu.event()
	            var t = baidu.dom( e.target ), args = arguments, bindElement;
	            if( data && !e.data ) 
	                e.data = data;
	            if( e.triggerData ) 
	                [].push.apply( args, e.triggerData );
	
	            if( !bindElements )
	                return e.result = fn.apply( target, args );
	
	            for(var i = 0; i < 2; i ++){
	            	if( bindElement = findVestedEl( e.target, bindElements ) )
	            	    return e.result = fn.apply( bindElement, args );
	            	bindElements = baidu.dom( selector, target );
	            }
	        };
	    };
	
	    core.add = function( target, type, fn, selector, data, one ){
			var pkg = this.build( target, type, fn, selector, data ), attachElements, bindType;
	        bindType = type;
	        if(type in special)
	            attachElements = special[type].attachElements,
	            bindType = special[type].bindType || type;
			queue.add( target, type, bindType, { type: type, pkg: pkg, orig: fn, one: one }, attachElements );
	    };
	
	    core.remove = function( target, type, fn, selector ){
	        queue.remove( target, type, fn, selector );
	    };
	
	}( baidu._util_.eventBase, baidu.event );
	
	///import baidu._util_.eventBase.shortcut;
	
	baidu.dom.extend({
	    getComputedStyle: function(key){
	        var defaultView = this[0].ownerDocument.defaultView,
	            computedStyle = defaultView && defaultView.getComputedStyle
	                && defaultView.getComputedStyle(this[0], null),
	            val = computedStyle ? (computedStyle.getPropertyValue(key) || computedStyle[key]) : '';
	        return val || this[0].style[key];
	    }
	});
	
	baidu.dom.extend({
	    getCurrentStyle: function(){
	        var css = document.documentElement.currentStyle ?
	            function(key){return this[0].currentStyle ? this[0].currentStyle[key] : this[0].style[key];}
	                : function(key){return this.getComputedStyle(key);}
	        return function(key){
	            return css.call(this, key);
	        }
	    }()
	});
	
	baidu._util_.getWidthOrHeight = function(){
	    var ret = {},
	        cssShow = {position: 'absolute', visibility: 'hidden', display: 'block'};
	    function swap(ele, options){
	        var defaultVal = {};
	        for(var i in options){
	            defaultVal[i] = ele.style[i];
	            ele.style[i] = options[i];
	        }
	        return defaultVal;
	    }
	    baidu.forEach(['Width', 'Height'], function(item){
	        var cssExpand = {Width: ['Right', 'Left'], Height: ['Top', 'Bottom']}[item];
	        ret['get' + item] = function(ele, extra){
	            var tang = baidu.dom(ele),
	                rect = ele['offset' + item],
	                defaultValue = rect === 0 && swap(ele, cssShow),
	                delString = 'padding|border';
	            defaultValue && (rect = ele['offset' + item]);
	            extra && baidu.forEach(extra.split('|'), function(val){
	                if(!~delString.indexOf(val)){//if val is margin
	                    rect += parseFloat(tang.getCurrentStyle(val + cssExpand[0])) || 0;
	                    rect += parseFloat(tang.getCurrentStyle(val + cssExpand[1])) || 0;
	                }else{//val is border or padding
	                    delString = delString.replace(new RegExp('\\|?' + val + '\\|?'), '');
	                }
	            });
	            delString && baidu.forEach(delString.split('|'), function(val){
	                rect -= parseFloat(tang.getCurrentStyle(val + cssExpand[0] + (val === 'border' ? 'Width' : ''))) || 0;
	                rect -= parseFloat(tang.getCurrentStyle(val + cssExpand[1] + (val === 'border' ? 'Width' : ''))) || 0;
	            });
	            defaultValue && swap(ele, defaultValue);
	            return rect;
	        }
	    });
	    //
	    return function(ele, key, extra){
	        return ret[key === 'width' ? 'getWidth' : 'getHeight'](ele, extra);
	    }
	}();
	
	//baidu.browser.isStrict = document.compatMode == "CSS1Compat";
	
	baidu._util_.getWindowOrDocumentWidthOrHeight = baidu._util_.getWindowOrDocumentWidthOrHeight || function(){
	    var ret = {'window': {}, 'document': {}};
	    baidu.forEach(['Width', 'Height'], function(item){
	        var clientProp = 'client' + item,
	            offsetProp = 'offset' + item,
	            scrollProp = 'scroll' + item;
	        ret['window']['get' + item] = function(ele){
	            var doc = ele.document,
	                rectValue = doc.documentElement[clientProp];
	            return baidu.browser.isStrict && rectValue
	                || doc.body && doc.body[clientProp] || rectValue;
	        };
	        ret['document']['get' + item] = function(ele){
	            var doc = ele.documentElement;
	            return doc[clientProp] >= doc[scrollProp] ? doc[clientProp]
	                : Math.max(ele.body[scrollProp], doc[scrollProp], ele.body[offsetProp], doc[offsetProp]);
	        }
	    });
	    return function(ele, type, key){
	        return ret[type][key === 'width' ? 'getWidth' : 'getHeight'](ele);
	    }
	}();
	//Sizzle.isXML
	baidu._util_.isXML = function(ele) {
	    var docElem = (ele ? ele.ownerDocument || ele : 0).documentElement;
	    return docElem ? docElem.nodeName !== 'HTML' : false;
	};
	
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
	
	baidu.createChain('string',
	    // 执行方法
	    function(string){
	        var type = baidu.type(string),
	            str = new String(~'string|number'.indexOf(type) ? string : type),
	            pro = String.prototype;
	        baidu.forEach(baidu.string.$String.prototype, function(fn, key) {
	            pro[key] || (str[key] = fn);
	        });
	        return str;
	    }
	);
	
	 //支持单词以“-_”分隔
	 //todo:考虑以后去掉下划线支持？
	baidu.string.extend({
	    toCamelCase : function () {
	    	var source = this.valueOf();
	        //提前判断，提高getStyle等的效率 thanks xianwei
	        if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
	            return source;
	        }
	        return source.replace(/[-_][^-_]/g, function (match) {
	            return match.charAt(1).toUpperCase();
	        });
	    }
	});
	
	baidu.dom.styleFixer = function(){
	    var alpha = /alpha\s*\(\s*opacity\s*=\s*(\d{1,3})/i,
	        nonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
	        cssNumber = 'fillOpacity,fontWeight,opacity,orphans,widows,zIndex,zoom',
	        cssProps = {
	            'float': baidu.support.cssFloat ? 'cssFloat' : 'styleFloat'
	        },
	        cssMapping = {
	            fontWeight: {normal: 400, bold: 700, bolder: 700, lighter: 100}
	        },
	        cssHooks = {
	            opacity: {},
	            width: {},
	            height: {},
	            fontWeight: {
	                get: function(ele, key){
	                    var ret = style.get(ele, key);
	                    return cssMapping.fontWeight[ret] || ret;
	                }
	            }
	        },
	        style = {
	            set: function(ele, key, val){ele.style[key] = val;}
	        };
	    baidu.extend(cssHooks.opacity, baidu.support.opacity ? {
	        get: function(ele, key){
	            var ret = baidu.dom(ele).getCurrentStyle(key);
	            return ret === '' ? '1' : ret;
	        }
	    } : {
	        get: function(ele){
	            return alpha.test((ele.currentStyle || ele.style).filter || '') ? parseFloat(RegExp.$1) / 100 : '1';
	        },
	        set: function(ele, key, value){
	            var filterString = (ele.currentStyle || ele.style).filter || '',
	                opacityValue = value * 100;
	                ele.style.zoom = 1;
	                ele.style.filter = alpha.test(filterString) ? filterString.replace(alpha, 'Alpha(opacity=' + opacityValue)
	                    : filterString + ' progid:dximagetransform.microsoft.Alpha(opacity='+ opacityValue +')';
	        }
	    });
	    //
	    baidu.forEach(['width', 'height'], function(item){
	        cssHooks[item] = {
	            get: function(ele){
	                return baidu._util_.getWidthOrHeight(ele, item) + 'px';
	            },
	            set: function(ele, key, val){
	                baidu.type(val) === 'number' && val < 0 && (val = 0);
	                style.set(ele, key, val);
	            }
	        };
	    });
	    
	    baidu.extend(style, document.documentElement.currentStyle? {
	        get: function(ele, key){
	            var val = baidu.dom(ele).getCurrentStyle(key),
	                defaultLeft;
	            if(nonpx.test(val)){
	                defaultLeft = ele.style.left;
	                ele.style.left = key === 'fontSize' ? '1em' : val;
	                val = ele.style.pixelLeft + 'px';
	                ele.style.left = defaultLeft;
	            }
	            return val;
	        }
	    } : {
	        get: function(ele, key){
	            return baidu.dom(ele).getCurrentStyle(key);
	        }
	    });
	    
	    //
	    return function(ele, key, val){
	        var origKey = baidu.string(key).toCamelCase(),
	            method = val === undefined ? 'get' : 'set',
	            origVal, hooks;
	        origKey = cssProps[origKey] || origKey;
	        origVal = baidu.type(val) === 'number' && !~cssNumber.indexOf(origKey) ? val + 'px' : val;
	        hooks = cssHooks.hasOwnProperty(origKey) && cssHooks[origKey][method] || style[method];
	        return hooks(ele, origKey, origVal);
	    };
	}();
	
	baidu.dom.extend({
	    css: function(key, value){
	        baidu.check('^(?:(?:string(?:,(?:number|string|function))?)|object)$', 'baidu.dom.css');
	        return baidu._util_.access(this, key, value, function(ele, key, val){
	            var styleFixer = baidu.dom.styleFixer;
	            return styleFixer ? styleFixer(ele, key, val)
	                : (val === undefined ? this.getCurrentStyle(key) : ele.style[key] = val);
	        });
	    }
	});
	
	baidu.dom.extend({
	    data : function () {
	        var   guid = baidu.key
	            , maps = baidu.global("_maps_HTMLElementData");
	
	        return function( key, value ) {
	            baidu.forEach( this, function( dom ) {
	                !dom[ guid ] && ( dom[ guid ] = baidu.id() );
	            });
	
	            if ( baidu.isString(key) ) {
	
	                // get first
	                if ( typeof value == "undefined" ) {
	                    var data,result;
	                    result = this[0] && (data = maps[ this[0][guid] ]) && data[ key ];
	                    if(result){
	                        return result;
	                    }else{
	
	                        //取得自定义属性
	                        var attr = this[0].getAttribute('data-'+key);
	                        return (String(attr).indexOf('{') == -1)?attr:Function("return "+attr)();
	                    }
	                }
	
	                // set all
	                baidu.forEach(this, function(dom){
	                    var data = maps[ dom[ guid ] ] = maps[ dom[ guid ] ] || {};
	                    data[ key ] = value;
	                });
	            
	            // json
	            } else if ( baidu.type(key) == "object") {
	
	                // set all
	                baidu.forEach(this, function(dom){
	                    var data = maps[ dom[ guid ] ] = maps[ dom[ guid ] ] || {};
	
	                    baidu.forEach( key , function(item) {
	                        data[ item ] = key[ item ];
	                    });
	                });
	            }
	
	            return this;
	        }
	    }()
	});
	
	baidu.dom.extend({
	    map : function (iterator) {
	        baidu.check("function","baidu.dom.map");
	        var me = this,
	            td = baidu.dom();
	
	        baidu.forEach(this, function( dom, index ){
	            td[td.length ++] = iterator.call( dom, index, dom, dom );
	        });
	
	        return td;
	    }
	});
	
	baidu.dom.extend({
	    clone: function(){
	        var event = baidu._util_.eventBase;
	        //
	        function getAll(ele){
	            return ele.getElementsByTagName ? ele.getElementsByTagName('*')
	                : (ele.querySelectorAll ? ele.querySelectorAll('*') : []);
	        }
	        //
	        function cloneFixAttributes(src, dest){
	            dest.clearAttributes && dest.clearAttributes();
	            dest.mergeAttributes && dest.mergeAttributes(src);
	            switch(dest.nodeName.toLowerCase()){
	                case 'object':
	                    dest.outerHTML = src.outerHTML;
	                    break;
	                case 'textarea':
	                case 'input':
	                    if(~'checked|radio'.indexOf(src.type)){
	                        src.checked && (dest.defaultChecked = dest.checked = src.checked);
	                        dest.value !== src.value && (dest.value = src.value);
	                    }
	                    dest.defaultValue = src.defaultValue;
	                    break;
	                case 'options':
	                    dest.selected = src.defaultSelected;
	                    break;
	                case 'script':
	                    dest.text !== src.text && (dest.text = src.text);
	                    break;
	            }
	            dest[baidu.key] && dest.removeAttribute(baidu.key);
	        }
	        //
	        function cloneCopyEvent(src, dest){
	        	if(dest.nodeType !== 1 || !baidu.id(src, 'get')){return;}
	        	var defaultEvents = event.get(src);
	        	for(var i in defaultEvents){
	        	    for(var j = 0, handler; handler = defaultEvents[i][j]; j++){
	        	        event.add(dest, i, handler);
	        	    }
	        	}
	        }
	        //
	        function clone(ele, dataAndEvents, deepDataAndEvents){
	            var cloneNode = ele.cloneNode(true),
	                srcElements, destElements, len;
	            //IE
	            if((!baidu.support.noCloneEvent || !baidu.support.noCloneChecked)
	                && (ele.nodeType === 1 || ele.nodeType === 11) && !baidu._util_.isXML(ele)){
	                    cloneFixAttributes(ele, cloneNode);
	                    srcElements = getAll( ele );
	                    destElements = getAll( cloneNode );
	                    len = srcElements.length;
	                    for(var i = 0; i < len; i++){
	                        destElements[i] && cloneFixAttributes(srcElements[i], destElements[i]);
	                    }
	            }
	            if(dataAndEvents){
	                cloneCopyEvent(ele, cloneNode);
	                if(deepDataAndEvents){
	                    srcElements = getAll( ele );
	                    destElements = getAll( cloneNode );
	                    len = srcElements.length;
	                    for(var i = 0; i < len; i++){
	                    	cloneCopyEvent(srcElements[i], destElements[i]);
	                    }
	                }
	            }
	            return cloneNode;
	        }
	        //
	        return function(dataAndEvents, deepDataAndEvents){
	            dataAndEvents = !!dataAndEvents;
	            deepDataAndEvents = !!deepDataAndEvents;
	            return this.map(function(){
	                return clone(this, dataAndEvents, deepDataAndEvents);
	            });
	        }
	    }()
	});
	
	baidu.dom.extend({
	    getDocument: function(){
	    	if(this.size()<=0){return undefined;}
	        var ele = this[0];
	        return ele.nodeType == 9 ? ele : ele.ownerDocument || ele.document;
	    }
	});
	
	baidu.dom.createElements = function() {
	    var tagReg  = /<(\w+)/i,
	        rhtml = /<|&#?\w+;/,
	        tagMap  = {
	            area    : [1, "<map>", "</map>"],
	            col     : [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
	            legend  : [1, "<fieldset>", "</fieldset>"],
	            option  : [1, "<select multiple='multiple'>", "</select>"],
	            td      : [3, "<table><tbody><tr>", "</tr></tbody></table>"],
	            thead   : [1, "<table>", "</table>"],
	            tr      : [2, "<table><tbody>", "</tbody></table>"],
	            _default: [0, "", ""]
	        };
	
	    // 建立映射
	    tagMap.optgroup = tagMap.option;
	    tagMap.tbody = tagMap.tfoot = tagMap.colgroup = tagMap.caption = tagMap.thead;
	    tagMap.th = tagMap.td;
	
	    // 将<script>解析成正常可执行代码
	    function parseScript ( box, doc ) {
	        var list = box.getElementsByTagName("SCRIPT"),
	            i, script, item;
	
	        for ( i=list.length-1; i>=0; i-- ) {
	            item = list[ i ];
	            script = doc.createElement( "SCRIPT" );
	
	            item.id && (script.id = item.id);
	            item.src && (script.src = item.src);
	            item.type && (script.type = item.type);
	            script[ item.text ? "text" : "textContent" ] = item.text || item.textContent;
	
	            item.parentNode.replaceChild( script, item );
	        }
	    }
	
	    return function( htmlstring, doc ) {
	        baidu.isNumber( htmlstring ) && ( htmlstring = htmlstring.toString() );
	        doc = doc || document;
	
	        var wrap, depth, box,
	            hs  = htmlstring,
	            n   = hs.length,
	            div = doc.createElement("div"),
	            df  = doc.createDocumentFragment(),
	            result = [];
	
	        if ( baidu.isString( hs ) ) {
	            if(!rhtml.test(hs)){// TextNode
	                result.push( doc.createTextNode( hs ) );
	            }else {//htmlString
	                wrap = tagMap[ hs.match( tagReg )[1].toLowerCase() ] || tagMap._default;
	
	                div.innerHTML = "<i>mz</i>" + wrap[1] + hs + wrap[2];
	                div.removeChild( div.firstChild );  // for ie (<script> <style>)
	                parseScript(div, doc);
	
	                depth = wrap[0];
	                box = div;
	                while ( depth -- ) { box = box.firstChild; };
	
	                baidu.merge( result, box.childNodes );
	
	                // 去除 item.parentNode
	                baidu.forEach( result, function (dom) {
	                    df.appendChild( dom );
	                } );
	
	                div = box = null;
	            }
	        }
	
	        div = null;
	
	        return result;
	    };
	}();
	
	baidu.dom.extend({
	    empty: function(){
	        for(var i = 0, item; item = this[i]; i++){
	            item.nodeType === 1 && baidu._util_.cleanData(item.getElementsByTagName('*'));
	            while(item.firstChild){
	                item.removeChild(item.firstChild);
	            }
	        }
	        return this;
	    }
	});
	
	/// Tangram 1.x Code Start
	
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    append: function(){
	        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.append');
	        baidu._util_.smartInsert(this, arguments, function(child){
	            this.nodeType === 1 && this.appendChild(child);
	        });
	        return this;
	    }
	});
	
	 
	 
	
	baidu.dom.extend({
	    html: function(value){
	
	        var bd = baidu.dom,
	            bt = baidu._util_,
	            me = this,
	            isSet = false,
	            result;
	
	        //当dom选择器为空时
	        if(this.size()<=0){
	            switch(typeof value){
	                case 'undefined':
	                    return undefined;
	                break;
	                default:
	                    return me;
	                break;
	            }            
	        }
	        
	        var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
	        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	            rnoInnerhtml = /<(?:script|style|link)/i,
	            rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	            rleadingWhitespace = /^\s+/,
	            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	            rtagName = /<([\w:]+)/,
	            wrapMap = {
	                option: [ 1, "<select multiple='multiple'>", "</select>" ],
	                legend: [ 1, "<fieldset>", "</fieldset>" ],
	                thead: [ 1, "<table>", "</table>" ],
	                tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	                td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	                col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	                area: [ 1, "<map>", "</map>" ],
	                _default: [ 0, "", "" ]
	            };
	        wrapMap.optgroup = wrapMap.option;
	        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	        wrapMap.th = wrapMap.td;
	
	        // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	        // unless wrapped in a div with non-breaking characters in front of it.
	        if ( !baidu.support.htmlSerialize ) {
	            wrapMap._default = [ 1, "X<div>", "</div>" ];
	        }
	
	        baidu.forEach(me,function(elem, index){
	            
	            if(result){
	                return;
	            };
	            var tangramDom = bd(elem);
	            switch(typeof value){
	                case 'undefined':
	        
	                    //get first
	                    result = ( elem.nodeType === 1 ? elem.innerHTML : undefined );
	                    return result;
	
	                break;
	
	                case 'number':
	                    value = String(value);
	                case 'string':
	
	                    //set all
	                    isSet = true;
	
	                    // See if we can take a shortcut and just use innerHTML
	                    if ( !rnoInnerhtml.test( value ) &&
	                        ( baidu.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
	                        ( baidu.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
	                        !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {
	
	                        value = value.replace( rxhtmlTag, "<$1></$2>" );
	
	                        try {
	
	                            // Remove element nodes and prevent memory leaks
	                            if ( elem.nodeType === 1 ) {
	                                tangramDom.empty();
	                                elem.innerHTML = value;
	                            }
	
	                            elem = 0;
	
	                        // If using innerHTML throws an exception, use the fallback method
	                        } catch(e) {}
	                    }
	
	                    if ( elem ) {
	                        me.empty().append( value );
	                    }
	
	                break;
	
	                case 'function':
	
	                    //set all
	                    isSet = true;
	                    tangramDom.html(value.call(elem, index, tangramDom.html()));
	                break;
	            };
	        });
	        
	        return isSet?me:result;
	    }
	});
	
	baidu._util_.smartInsert = function(tang, args, callback){
	    if(args.length <= 0 || tang.size() <= 0){return;}
	    if(baidu.type(args[0]) === 'function'){
	        var fn = args[0],
	            tangItem;
	        return baidu.forEach(tang, function(item, index){
	            tangItem = baidu.dom(item);
	            args[0] = fn.call(item, index, tangItem.html());
	            baidu._util_.smartInsert(tangItem, args, callback);
	        });
	    }
	    var doc = tang.getDocument() || document,
	        fragment = doc.createDocumentFragment(),
	        len = tang.length - 1,
	        firstChild;
	    for(var i = 0, item; item = args[i]; i++){
	        if(item.nodeType){
	            fragment.appendChild(item);
	        }else{
	            baidu.forEach(~'string|number'.indexOf(baidu.type(item)) ?
	                baidu.dom.createElements(item, doc)
	                    : item, function(ele){
	                        fragment.appendChild(ele);
	                    });
	        }
	    }
	    if(!(firstChild = fragment.firstChild)){return;}
	    baidu.forEach(tang, function(item, index){
	        callback.call(item.nodeName.toLowerCase() === 'table'
	            && firstChild.nodeName.toLowerCase() === 'tr' ?
	                item.tBodies[0] || item.appendChild(item.ownerDocument.createElement('tbody'))
	                    : item, index < len ? fragment.cloneNode(true) : fragment);
	    });
	};
	
	baidu._util_.smartInsertTo = function(tang, target, callback, orie){
	    var insert = baidu.dom(target),
	        first = insert[0],
	        tangDom;
	        
	    if(orie && first && (!first.parentNode || first.parentNode.nodeType === 11)){
	        orie = orie === 'before';
	        tangDom = baidu.merge(orie ? tang : insert, !orie ? tang : insert);
	        if(tang !== tangDom){
	            tang.length = 0;
	            baidu.merge(tang, tangDom);
	        }
	    }else{
	        for(var i = 0, item; item = insert[i]; i++){
	            baidu._util_.smartInsert(baidu.dom(item), i > 0 ? tang.clone(true) : tang, callback);
	        }
	    }
	};
	
	baidu.dom.extend({
	    appendTo: function(target){
	        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.appendTo');
	        baidu._util_.smartInsertTo(this, target, function(child){
	            this.appendChild(child);
	        });
	        return this;
	    }
	});
	
	(function(){
	
	var iframeDoc,
	    iframe,
	    curCSS,
	    rmargin = /^margin/,
	    rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
	    rposition = /^(top|right|bottom|left)$/,
	    elemdisplay = {};
	
	baidu.extend(baidu._util_,{
	    showHide:function( elements, show){
	        var elem, display,
	            values = [],
	            index = 0,
	            length = elements.length;
	
	        for ( ; index < length; index++ ) {
	            elem = elements[ index ];
	            if ( !elem.style ) {
	                continue;
	            }
	            values[ index ] = baidu.dom(elem).data("olddisplay" );
	            if ( show ) {
	                // Reset the inline display of this element to learn if it is
	                // being hidden by cascaded rules or not
	                if ( !values[ index ] && elem.style.display === "none" ) {
	                    elem.style.display = "";
	                }
	
	                // Set elements which have been overridden with display: none
	                // in a stylesheet to whatever the default browser style is
	                // for such an element
	                if ( (elem.style.display === "" && curCSS( elem, "display" ) === "none") ||
	                    !baidu.dom.contains( elem.ownerDocument.documentElement, elem ) ) {
	                    values[ index ] = baidu.dom(elem).data("olddisplay", css_defaultDisplay(elem.nodeName) );
	                }
	            } else {
	                display = curCSS( elem, "display" );
	
	                if ( !values[ index ] && display !== "none" ) {
	                    baidu.dom(elem).data("olddisplay", display );
	                }
	            }
	        }
	
	        // Set the display of most of the elements in a second loop
	        // to avoid the constant reflow
	        for ( index = 0; index < length; index++ ) {
	            elem = elements[ index ];
	            if ( !elem.style ) {
	                continue;
	            }
	            if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
	                elem.style.display = show ? values[ index ] || "" : "none";
	            }
	        }
	
	        return elements;
	    }
	});
	
	// NOTE: To any future maintainer, we've used both window.getComputedStyle
	// and getComputedStyle here to produce a better gzip size
	if ( window.getComputedStyle ) {
	    curCSS = function( elem, name ) {
	        var ret, width,
	            computed = getComputedStyle( elem, null ),
	            style = elem.style;
	
	        if ( computed ) {
	
	            ret = computed[ name ];
	            if ( ret === "" && !baidu.dom.contains( elem.ownerDocument.documentElement, elem ) ) {
	                ret = baidu.dom(elem).css( name );
	            }
	
	            // A tribute to the "awesome hack by Dean Edwards"
	            // WebKit uses "computed value (percentage if specified)" instead of "used value" for margins
	            // which is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
	            if ( !baidu.support.pixelMargin && rmargin.test( name ) && rnumnonpx.test( ret ) ) {
	                width = style.width;
	                style.width = ret;
	                ret = computed.width;
	                style.width = width;
	            }
	        }
	
	        return ret;
	    };
	} else if ( document.documentElement.currentStyle ) {
	    curCSS = function( elem, name ) {
	        var left, rsLeft,
	            ret = elem.currentStyle && elem.currentStyle[ name ],
	            style = elem.style;
	
	        // Avoid setting ret to empty string here
	        // so we don't default to auto
	        if ( ret == null && style && style[ name ] ) {
	            ret = style[ name ];
	        }
	
	        // From the awesome hack by Dean Edwards
	        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
	
	        // If we're not dealing with a regular pixel number
	        // but a number that has a weird ending, we need to convert it to pixels
	        // but not position css attributes, as those are proportional to the parent element instead
	        // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
	        if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {
	
	            // Remember the original values
	            left = style.left;
	            rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
	
	            // Put in the new values to get a computed value out
	            if ( rsLeft ) {
	                elem.runtimeStyle.left = elem.currentStyle.left;
	            }
	            style.left = name === "fontSize" ? "1em" : ret;
	            ret = style.pixelLeft + "px";
	
	            // Revert the changed values
	            style.left = left;
	            if ( rsLeft ) {
	                elem.runtimeStyle.left = rsLeft;
	            }
	        }
	
	        return ret === "" ? "auto" : ret;
	    };
	}
	
	// Try to determine the default display value of an element
	function css_defaultDisplay( nodeName ) {
	    if ( elemdisplay[ nodeName ] ) {
	        return elemdisplay[ nodeName ];
	    }
	
	    var elem = baidu.dom( "<" + nodeName + ">" ).appendTo( document.body ),
	        display = elem.css("display");
	    elem.remove();
	
	    // If the simple way fails,
	    // get element's real default display by attaching it to a temp iframe
	    if ( display === "none" || display === "" ) {
	        // Use the already-created iframe if possible
	        iframe = document.body.appendChild(
	            iframe || baidu.extend( document.createElement("iframe"), {
	                frameBorder: 0,
	                width: 0,
	                height: 0
	            })
	        );
	
	        // Create a cacheable copy of the iframe document on first call.
	        // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
	        // document to it; WebKit & Firefox won't allow reusing the iframe document.
	        if ( !iframeDoc || !iframe.createElement ) {
	            iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
	            iframeDoc.write("<!doctype html><html><body>");
	            iframeDoc.close();
	        }
	
	        elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );
	
	        display = curCSS( elem, "display" );
	        document.body.removeChild( iframe );
	    }
	
	    // Store the correct default display
	    elemdisplay[ nodeName ] = display;
	
	    return display;
	}
	
	})();
	
	baidu.object.isPlain  = baidu.isPlainObject;
	
	baidu.string.extend({
	    trim: function(){
	        var trimer = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)', 'g');
	        return function(){
	            return this.replace(trimer, '');
	        }
	    }()
	});
	/// support magic - Tangram 1.x Code Start
	
	baidu.dom.g = function(id) {
	    if (!id) return null; //修改IE下baidu.dom.g(baidu.dom.g('dose_not_exist_id'))报错的bug，by Meizz, dengping
	    if ('string' == typeof id || id instanceof String) {
	        return document.getElementById(id);
	    } else if (id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
	        return id;
	    }
	    return null;
	};
	
	/// support magic - Tangram 1.x Code End
	
	baidu.dom.extend({
	    on: function( events, selector, data, fn, _one ){
	        var eb = baidu._util_.eventBase.core;
	        // var specials = { mouseenter: 1, mouseleave: 1, focusin: 1, focusout: 1 };
	
	        if( typeof selector == "object" && selector )
	            fn = data,
	            data = selector,
	            selector = null;
	        else if( typeof data == "function" )
	            fn = data,
	            data = null;
	        else if( typeof selector == "function" )
	            fn = selector,
	            selector = data = null;
	
	        if( typeof events == "string" ){
	            events = events.split(/[ ,]+/);
	            this.each(function(){
	                baidu.forEach(events, function( event ){
	                    // if( specials[ event ] )
	                    //     baidu( this )[ event ]( data, fn );
	                    // else
	                    eb.add( this, event, fn, selector, data, _one );
	                }, this);
	            });
	        }else if( typeof events == "object" ){
	            if( fn )
	                fn = null;
	            baidu.forEach(events, function( fn, eventName ){
	                this.on( eventName, selector, data, fn, _one );
	            }, this);
	        }
	
	        return this;
	    }
	
	    // _on: function( name, data, fn ){
	    //     var eb = baidu._util_.eventBase;
	    //     this.each(function(){
	    //         eb.add( this, name, fn, undefined, data );
	    //     });
	    //     return this;
	    // }
	});
	
	/// support - magic Tangram 1.x Code Start
	baidu.event.on = baidu.on = function(element, evtName, handler){
	    element = baidu.dom.g(element);
	    baidu.dom(element).on(evtName.replace(/^\s*on/, ''), handler);
	    return element;
	};
	/// support - magic Tangram 1.x Code End
	
	 
	
	 
	
	void function(){
	    var ajaxLocation = location.href,
	        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	        rprotocol = /^\/\//,
	        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
	        rhash = /#.*$/,
	        rbracket = /\[\]$/,
	        rnoContent = /^(?:GET|HEAD)$/,
	        rts = /([?&])_=[^&]*/,
	        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	        
	        // JSON RegExp
	        rvalidchars = /^[\],:{}\s]*$/,
	        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	        rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	        rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,
	        
	        
	        
	        allTypes = ['*/'] + ['*'],
	        
	        prefilters = {},
	        transports = {},
	        
	        lastModified = {},
	        etag = {},
	        
	        
	        
	        ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];
	        
	    function parseXML(data){
	        var xml, tmp;
	        if (!data || baidu.type(data) !== 'string') {
	            return null;
	        }
	        try {
	            if ( window.DOMParser ) { // Standard
	                tmp = new DOMParser();
	                xml = tmp.parseFromString( data , "text/xml" );
	            } else { // IE
	                xml = new ActiveXObject( "Microsoft.XMLDOM" );
	                xml.async = "false";
	                xml.loadXML( data );
	            }
	        } catch( e ) {
	            xml = undefined;
	        }
	        if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
	            throw new Error( "Invalid XML: " + data );
	        }
	        return xml;
	    }
	    
	    function parseJSON(data){
	        if(!data || baidu.type(data) !== 'string'){return null;}
	        data = baidu.string(data).trim();
	        if ( window.JSON && window.JSON.parse ) {
	            return window.JSON.parse( data );
	        }
	        if ( rvalidchars.test( data.replace( rvalidescape, "@" )
	            .replace( rvalidtokens, ']')
	            .replace( rvalidbraces, ''))) {
	
	            return ( new Function( 'return ' + data ) )();
	
	        }
	        throw new Error( "Invalid JSON: " + data );
	    }
	    
	    function globalEval( data ) {
	        if ( data && /\S/.test( data ) ) {
	            ( window.execScript || function( data ) {
	                window[ "eval" ].call( window, data );
	            } )( data );
	        }
	    }
	    
	    function toPrefiltersOrTransports(structure){
	        return function(expression, func){
	            if(baidu.type(expression) !== 'string'){
	                func = expression;
	                expression = '*';
	            }
	            var dataTypes = expression.toLowerCase().split(/\s+/),
	                placeBefore, array;
	            
	            if(baidu.type(func) === 'function'){
	                for(var i = 0, item; item = dataTypes[i]; i++){
	                    placeBefore = /^\+/.test(item);
	                    placeBefore && (item = item.substr(1) || '*');
	                    array = structure[item] = structure[item] || [];
	                    array[placeBefore ? 'unshift' : 'push'](func);
	                }
	            }
	        };
	    }
	    
	    
	    function ajaxHandleResponses(opts, tangXHR, responses){
	        var ct, type, finalDataType, firstDataType,
	            contents = opts.contents,
	            dataTypes = opts.dataTypes,
	            responseFields = opts.responseFields;
	        
	        for ( type in responseFields ) {
	            if ( type in responses ) {
	                tangXHR[responseFields[type]] = responses[ type ];
	            }
	        }
	        while(dataTypes[0] === '*'){
	            dataTypes.shift();
	            if (ct === undefined){
	                ct = opts.mimeType || tangXHR.getResponseHeader('content-type');
	            }
	        }
	        if(ct){
	            for(type in contents ){
	                if(contents[type] && contents[type].test(ct)){
	                    dataTypes.unshift(type);
	                    break;
	                }
	            }
	        }
	        if (dataTypes[0] in responses){
	            finalDataType = dataTypes[0];
	        } else {
	            for (type in responses){
	                if (!dataTypes[0] || opts.converters[type + ' ' + dataTypes[0]]){
	                    finalDataType = type;
	                    break;
	                }
	                if (!firstDataType) {
	                    firstDataType = type;
	                }
	            }
	            finalDataType = finalDataType || firstDataType;
	        }
	        if(finalDataType){
	            if(finalDataType !== dataTypes[0]){
	                dataTypes.unshift(finalDataType);
	            }
	            return responses[finalDataType];
	        }
	    }
	    
	    function ajaxConvert(opts, response){
	        var dataTypes = opts.dataTypes.slice(),
	            prev = dataTypes[0],
	            converters = {},
	            conv, array;
	            
	            
	            
	        opts.dataFilter && (response = opts.dataFilter(response, opts.dataType));
	        if(dataTypes[1]){
	            for(var i in opts.converters){
	                converters[i.toLowerCase()] = opts.converters[i];
	            }
	        }
	        for(var i = 0, curr; curr = dataTypes[++i];){
	            if(curr !== '*'){
	                if(prev !== '*' && prev !== curr){
	                    conv = converters[prev + ' ' + curr] || converters['* ' + curr];
	                    if(!conv){
	                        for(var key in converters){
	                            array = key.split(' ');
	                            if(array[1] === curr){
	                                conv = converters[prev + ' ' + array[0]]
	                                    || converters['* ' + array[0]];
	                                if(conv){
	                                    if(conv === true){
	                                        conv = converters[key];
	                                    }else if(converters[key] !== true){
	                                        curr = array[0];
	                                        dataTypes.splice(i--, 0, curr);
	                                    }
	                                    break;
	                                }
	                            }
	                        }
	                    }
	                    
	                    if(conv !== true){
	                        if(conv && opts['throws']){
	                            response = conv(response);
	                        }else{
	                            try{
	                                response = conv(response);
	                            }catch(e){
	                                return { state: 'parsererror', error: conv ? e : 'No conversion from ' + prev + ' to ' + curr };
	                            }
	                        }
	                    }
	                }
	                prev = curr;
	            }
	        }
	        return { state: 'success', data: response };
	    }
	    
	    
	    function inspectPrefiltersOrTransports(structure, options, originalOptions, tangXHR, dataType, inspected){
	        dataType = dataType || options.dataTypes[0];
	        inspected = inspected || {};
	        inspected[dataType] = true;
	        
	        var selection,
	        list = structure[ dataType ],
	        length = list ? list.length : 0,
	        executeOnly = ( structure === prefilters );
	        
	        for (var i = 0; i < length && ( executeOnly || !selection ); i++ ) {
	            selection = list[ i ]( options, originalOptions, tangXHR );
	            if ( typeof selection === "string" ) {
	                if ( !executeOnly || inspected[selection]){
	                    selection = undefined;
	                } else {
	                    options.dataTypes.unshift(selection);
	                    selection = inspectPrefiltersOrTransports(
	                            structure, options, originalOptions, tangXHR, selection, inspected );
	                }
	            }
	        }
	        if ( ( executeOnly || !selection ) && !inspected['*'] ) {
	            selection = inspectPrefiltersOrTransports(
	                    structure, options, originalOptions, tangXHR, '*', inspected );
	        }
	        return selection;
	    }
	    
	    baidu.createChain('ajax', function(url, options){
	        if(baidu.object.isPlain(url)){
	            options = url;
	            url = undefined;
	        }
	        options = options || {};
	        
	        var opts = baidu.ajax.setup({}, options),
	            callbackContext = opts.context || opts,
	            fireGlobals,
	            ifModifiedKey,
	            parts,
	            
	            //tangXHR
	            
	            deferred = baidu.Deferred(),
	            completeDeferred = baidu.Callbacks('once memory'),
	            statusCode = opts.statusCode || {},
	            
	            state = 0,
	            requestHeadersNames = {},
	            requestHeaders = {},
	            strAbort = 'canceled',
	            responseHeadersString,
	            responseHeaders,
	            transport,
	            //tangXHR
	            //done
	            
	            //done
	            tangXHR = baidu.extend(new baidu.ajax.$Ajax(url, opts), {
	                readyState: 0,
	                setRequestHeader: function(name, value){
	                    if(!state){
	                        var lname = name.toLowerCase();
	                        name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
	                        requestHeaders[ name ] = value;
	                    }
	                },
	                getAllResponseHeaders: function(){
	                    return state === 2 ? responseHeadersString : null;
	                },
	                
	                getResponseHeader: function(key){
	                    var match;
	                    if(state === 2){
	                        if(!responseHeaders){
	                            responseHeaders = {};
	                            while(match = rheaders.exec(responseHeadersString)){
	                                responseHeaders[match[1].toLowerCase()] = match[2];
	                            }
	                        }
	                        match = responseHeaders[key.toLowerCase()];
	                    }
	                    return match === undefined ? null : match;
	                },
	                
	                overrideMimeType: function(type){
	                    !state && (opts.mimeType = type);
	                    return this;
	                },
	                
	                abort: function(statusText){
	                    statusText = statusText || strAbort;
	                    transport && transport.abort(statusText);
	                    done(0, statusText);
	                    return this;
	                }
	            });
	        var timeoutTimer;
	        
	        
	        function done(status, nativeStatusText, responses, headers){
	            var statusText = nativeStatusText,
	                isSuccess, success, error, response, modified;
	            if(state === 2){return;}
	            state = 2;
	            timeoutTimer && clearTimeout(timeoutTimer);
	            transport = undefined;
	            responseHeadersString = headers || '';
	            tangXHR.readyState = status > 0 ? 4 : 0;
	            responses && (response = ajaxHandleResponses(opts, tangXHR, responses));
	            
	            if(status >= 200 && status < 300 || status === 304){
	                if(opts.ifModified){
	                    modified = tangXHR.getResponseHeader('Last-Modified');
	                    modified && (lastModified[ifModifiedKey] = modified);
	                    modified = tangXHR.getResponseHeader('Etag');
	                    modified && (etag[ifModifiedKey] = modified);
	                }
	                if(status === 304){
	                    statusText = 'notmodified';
	                    isSuccess = true;
	                }else{
	                    isSuccess = ajaxConvert(opts, response);
	                    statusText = isSuccess.state;
	                    success = isSuccess.data;
	                    error = isSuccess.error;
	                    isSuccess = !error;
	                }
	            }else{
	                error = statusText;
	                if(!statusText || status){
	                    statusText = 'error';
	                    status < 0 && (status = 0);
	                }
	            }
	            
	            tangXHR.status = status;
	            tangXHR.statusText = '' + (nativeStatusText || statusText);
	            
	            if(isSuccess){
	                deferred.resolveWith(callbackContext, [success, statusText, tangXHR]);
	            }else{
	                deferred.rejectWith(callbackContext, [tangXHR, statusText, error]);
	            }
	            tangXHR.statusCode(statusCode);
	            statusCode = undefined;
	            
	//            fireGlobals && globalEventContext.trigger('ajax' + (isSuccess ? 'Success' : 'Error'),
	//                        [tangXHR, opts, isSuccess ? success : error]);
	            completeDeferred.fireWith(callbackContext, [tangXHR, statusText]);
	            //TODO ajaxComplete event;
	        }
	        
	        deferred.promise(tangXHR);
	        tangXHR.success = tangXHR.done;
	        tangXHR.error = tangXHR.fail;
	        tangXHR.complete = completeDeferred.add;
	        
	        tangXHR.statusCode = function(map){
	            if(map){
	                if(state < 2){
	                    for(var i in map){
	                        statusCode[i] = [statusCode[i], map[i]];
	                    }
	                }else{
	                    tangXHR.always(map[tangXHR.status]);
	                }
	            }
	            return this;
	        };
	        
	        //if url is window.location must + ''
	        opts.url = ((url || opts.url) + '').replace(rhash, '').replace(rprotocol, ajaxLocParts[1] + '//');
	        opts.dataTypes = baidu.string(opts.dataType || '*').trim().toLowerCase().split(/\s+/);
	        // Determine if a cross-domain request is in order
	        if (opts.crossDomain == null){
	            parts = rurl.exec(opts.url.toLowerCase());
	            opts.crossDomain = !!(parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2]
	                || (parts[3] || (parts[1] === 'http:' ? 80 : 443)) !=
	                    (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? 80 : 443))));
	        }
	        if(opts.data && opts.processData && baidu.type(opts.data) !== 'string'){
	            opts.data = baidu.ajax.param(opts.data, opts.traditional );
	        }
	        
	        inspectPrefiltersOrTransports(prefilters, opts, options, tangXHR);//运行prefilter()
	        
	        if(state === 2){return '';}
	        fireGlobals = opts.global;
	        opts.type = opts.type.toUpperCase();
	        opts.hasContent = !rnoContent.test(opts.type);
	        
	        //trigger ajaxStart start;
	        //trigger ajaxStart end;
	        if(!opts.hasContent){
	            if(opts.data){
	                opts.url += (~opts.url.indexOf('?') ? '&' : '?') + opts.data;
	                delete opts.data;
	            }
	            ifModifiedKey = opts.url;
	            if(opts.cache === false){
	                var now = new Date().getTime(),
	                    ret = opts.url.replace(rts, '$1_=' + now);
	                opts.url = ret + (ret === opts.url ? (~opts.url.indexOf('?') ? '&' : '?') + '_=' + now : '');
	            }
	        }
	        if(opts.data && opts.hasContent && opts.contentType !== false
	            || options.contentType){
	                tangXHR.setRequestHeader('Content-Type', opts.contentType);
	        }
	        if(opts.ifModified){
	            ifModifiedKey = ifModifiedKey || opts.url;
	            lastModified[ifModifiedKey]
	                && tangXHR.setRequestHeader('If-Modified-Since', lastModified[ifModifiedKey]);
	            etag[ifModifiedKey]
	                && tangXHR.setRequestHeader('If-None-Match', etag[ifModifiedKey]);
	        }
	        
	        tangXHR.setRequestHeader('Accept',
	            opts.dataTypes[0] && opts.accepts[opts.dataTypes[0]] ?
	                opts.accepts[opts.dataTypes[0]] + (opts.dataTypes[0] !== '*' ? ', ' + allTypes + '; q=0.01' : '')
	                    : opts.accepts['*']);
	        
	        for(var i in opts.headers){
	            tangXHR.setRequestHeader(i, opts.headers[i]);
	        }
	        if(opts.beforeSend && (opts.beforeSend.call(callbackContext, tangXHR, opts) === false || state === 2)){
	            return tangXHR.abort();
	        }
	        strAbort = 'abort';
	        for(var i in {success: 1, error: 1, complete: 1}){
	            tangXHR[i](opts[i]);
	        }
	        transport = inspectPrefiltersOrTransports(transports, opts, options, tangXHR);
	        if(!transport){
	            done(-1, 'No Transport');
	        }else{
	            tangXHR.readyState = 1;
	            //TODO trigger ajaxSend
	            if(opts.async && opts.timeout > 0){
	                timeoutTimer = setTimeout(function(){
	                    tangXHR.abort('timeout')
	                }, opts.timeout);
	            }
	            try{
	                state = 1;
	                transport.send(requestHeaders, done);
	            }catch(e){
	                if(state < 2){
	                    done(-1, e);
	                }else{
	                    throw e;
	                }
	            }
	        }
	        return tangXHR;
	    }, function(url, options){
	        this.url = url;
	        this.options = options;
	    });
	    
	    baidu.ajax.settings = {
	       url: ajaxLocation,
	        isLocal: rlocalProtocol.test(ajaxLocParts[1]),
	        global: true,
	        type: 'GET',
	        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
	        processData: true,
	        async: true,
	        
	        accepts: {
	            xml: 'application/xml, text/xml',
	            html: 'text/html',
	            text: 'text/plain',
	            json: 'application/json, text/javascript',
	            '*': allTypes
	        },
	        contents: {
	            xml: /xml/,
	            html: /html/,
	            json: /json/
	        },
	        responseFields: {
	            xml: 'responseXML',
	            text: 'responseText'
	        },
	        converters: {
	            '* text': window.String,
	            'text html': true,
	            'text json': parseJSON,
	            'text xml': parseXML
	        },
	        flatOptions: {
	            context: true,
	            url: true
	        }
	    };
	    //
	    function ajaxExtend(target, src){
	        var flatOpt = baidu.ajax.settings.flatOptions || {},
	            deep;
	        for(var i in src){
	            if(src[i] !== undefined){
	                (flatOpt[i] ? target : (deep || (deep = {})))[i] = src[i]
	            }
	        }
	        deep && baidu.extend(true, target, deep);
	    }
	    
	    baidu.ajax.setup = function(target, settings){
	        if(settings){
	            ajaxExtend(target, baidu.ajax.settings);
	        }else{
	            settings = target;
	            target = baidu.ajax.settings;
	        }
	        ajaxExtend(target, settings);
	        return target;
	    };
	    
	    //
	    
	    function addParam(array, key, val){
	        val = baidu.type(val) === 'function' ? val() : (val || '');
	        array.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
	    }
	    function buildParams(array, key, val, traditional){
	        if(baidu.type(val) === 'array'){
	            baidu.forEach(val, function(item, index){
	                if(traditional || rbracket.test(key)){
	                    addParam(array, key, item);
	                }else{
	                    buildParams(array, key + '[' + (typeof item === 'object' ? index : '') + ']', item, traditional);
	                }
	            });
	        }else if(!traditional && baidu.type(val) === "object"){
	            for(var i in val){
	                buildParams(array, key + '[' + i + ']', val[i], traditional);
	            }
	        }else{
	            addParam(array, key, val);
	        }
	    }
	    
	    baidu.ajax.param = function(src, traditional){
	        var ret = [];
	        if(baidu.type(src) === 'array'){
	            baidu.forEach(src, function(item){
	                addParam(ret, item.name, item.value);
	            });
	        }else{
	            for(var i in src){
	                buildParams(ret, i, src[i], traditional);
	            }
	        }
	        return ret.join('&').replace(/%20/g, '+');
	    };
	    
	    baidu.ajax.prefilter = toPrefiltersOrTransports(prefilters);
	    baidu.ajax.transport = toPrefiltersOrTransports(transports);
	    
	    //jsonp
	    var oldCallbacks = [],
	        rjsonp = /(=)\?(?=&|$)|\?\?/,
	        nonce = new Date().getTime();
	    baidu.ajax.setup({
	        jsonp: 'callback',
	        jsonpCallback: function(){
	            var callback = oldCallbacks.pop() || (baidu.id.key + '_' + (nonce++));
	            this[callback] = true;
	            return callback;
	        }
	    });
	    baidu.ajax.prefilter('json jsonp', function(opts, originalSettings, tangXHR){
	        var callbackName, overwritten, responseContainer,
	            data = opts.data,
	            url = opts.url,
	            hasCallback = opts.jsonp !== false,
	            replaceInUrl = hasCallback && rjsonp.test(url),
	            replaceInData = hasCallback && !replaceInUrl && baidu.type(data) === 'string'
	                && !(opts.contentType || '').indexOf('application/x-www-form-urlencoded')
	                && rjsonp.test(data);
	        if(opts.dataTypes[0] === 'jsonp' || replaceInUrl || replaceInData){
	            callbackName = opts.jsonpCallback = baidu.type(opts.jsonpCallback) === 'function' ?
	                opts.jsonpCallback() : opts.jsonpCallback;
	            overwritten = window[callbackName];
	            
	            if (replaceInUrl) {
	                opts.url = url.replace(rjsonp, '$1' + callbackName );
	            } else if (replaceInData) {
	                opts.data = data.replace(rjsonp, '$1' + callbackName );
	            } else if (hasCallback) {
	                opts.url += (/\?/.test(url) ? '&' : '?') + opts.jsonp + '=' + callbackName;
	            }
	            
	            opts.converters['script json'] = function() {
	//                !responseContainer && baidu.error( callbackName + " was not called" );
	                return responseContainer[0];
	            }
	            
	            opts.dataTypes[0] = 'json';
	            window[callbackName] = function(){responseContainer = arguments;}
	            tangXHR.always(function(){
	                window[callbackName] = overwritten;
	                if (opts[callbackName]){
	                    opts.jsonpCallback = originalSettings.jsonpCallback;
	                    oldCallbacks.push(callbackName);
	                }
	                if (responseContainer && baidu.type(overwritten) === 'function'){
	                    overwritten(responseContainer[0]);
	                }
	                responseContainer = overwritten = undefined;
	            });
	            return 'script';
	        }
	    });
	    
	    baidu.ajax.setup({
	        accepts: {script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'},
	        contents: {script: /javascript|ecmascript/},
	        converters: {'text script': function(txt){
	            globalEval(txt);
	            return txt;
	        }}
	    });
	    
	    baidu.ajax.prefilter('script', function(opts){
	        opts.cache === undefined && (opts.cache = false);
	        if(opts.crossDomain){
	            opts.type = 'GET';
	            opts.global = false;
	        }
	    });
	    
	    baidu.ajax.transport('script', function(opts){
	        if(opts.crossDomain){
	            var script,
	                head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
	            return {
	                send: function(arg, callback){
	                    script = document.createElement('script');
	                    script.async = 'async';
	                    opts.scriptCharset && (script.charset = opts.scriptCharset);
	                    script.src = opts.url;
	                    script.onload = script.onreadystatechange = function(arg, isAbort){
	                        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState)){
	                            script.onload = script.onreadystatechange = null;
	                            head && script.parentNode && head.removeChild( script );
	                            script = undefined;
	                            !isAbort && callback(200, 'success');
	                        }
	                    }
	                    head.insertBefore(script, head.firstChild);
	                },
	                
	                abort: function(){
	                    script && script.onload(0, 1);
	                }
	            };
	        }
	    });
	    
	    var xhrCallbacks,
	        xhrId = 0,
	        xhrOnUnloadAbort = window.ActiveXObject ? function(){
	            for ( var key in xhrCallbacks ) {
	                xhrCallbacks[ key ]( 0, 1 );
	            }
	        } : false;
	        
	    function createStandardXHR() {
	        try {
	            return new window.XMLHttpRequest();
	        } catch( e ) {}
	    }
	    
	    function createActiveXHR() {
	        try {
	            return new window.ActiveXObject('Microsoft.XMLHTTP');
	        } catch( e ) {}
	    }
	    
	    baidu.ajax.settings.xhr = window.ActiveXObject ? function(){
	        return !this.isLocal && createStandardXHR() || createActiveXHR();
	    } : createStandardXHR;
	    
	    void function(xhr){
	        baidu.extend(baidu.support, {
	            ajax: !!xhr,
	            cors: !!xhr && ('withCredentials' in xhr)
	        });
	    }(baidu.ajax.settings.xhr());
	    
	    if(baidu.support.ajax){
	        baidu.ajax.transport(function(opts){
	            if(!opts.crossDomain || baidu.support.cors){
	                var callback;
	                return {
	                    send: function(headers, complete){
	                        var handle, xhr = opts.xhr();
	                        //it's can not use apply here
	                        if(opts.username){
	                            xhr.open(opts.type, opts.url, opts.async, opts.username, opts.password);
	                        }else{
	                            xhr.open(opts.type, opts.url, opts.async);
	                        }
	                        
	                        if(opts.xhrFields){
	                            for(var i in opts.xhrFields){
	                                xhr[i] = opts.xhrFields[i];
	                            }
	                        }
	                        
	                        if(opts.mimeType && xhr.overrideMimeType){
	                            xhr.overrideMimeType(opts.mimeType);
	                        }
	                        
	                        if(!opts.crossDomain && !headers['X-Requested-With']){
	                            headers['X-Requested-With'] = 'XMLHttpRequest';
	                        }
	                        
	                        try{
	                            for(var i in headers){
	                                xhr.setRequestHeader(i, headers[i]);
	                            }
	                        }catch(e){}
	
	                        xhr.send((opts.hasContent && opts.data) || null);
	                        
	                        callback = function(arg, isAbort){
	                            var status,
	                                statusText,
	                                responseHeaders,
	                                responses,
	                                xml;
	                            try{
	                                if(callback && (isAbort || xhr.readyState === 4)){
	                                    callback = undefined;
	                                    if (handle){
	                                        xhr.onreadystatechange = function(){};
	                                        xhrOnUnloadAbort && (delete xhrCallbacks[handle]);
	                                    }
	                                    
	                                    if(isAbort){
	                                        xhr.readyState !== 4 && xhr.abort();
	                                    }else{
	                                        status = xhr.status;
	                                        responseHeaders = xhr.getAllResponseHeaders();
	                                        responses = {};
	                                        xml = xhr.responseXML;
	                                        xml && xml.documentElement && (responses.xml = xml);
	                                        try{
	                                            responses.text = xhr.responseText;
	                                        }catch(e){}
	                                        
	                                        try{
	                                            statusText = xhr.statusText;
	                                        }catch(e){statusText = '';}
	                                        if(!status && opts.isLocal && !opts.crossDomain){
	                                            status = responses.text ? 200 : 404;
	                                        }else if(status === 1223){
	                                            status = 204;
	                                        }
	                                    }
	                                }
	                            }catch(firefoxAccessException){
	                                !isAbort && complete(-1, firefoxAccessException);
	                            }
	                            responses && complete(status, statusText, responses, responseHeaders);
	                        }
	                        
	                        if(!opts.async){
	                            callback();
	                        }else if(xhr.readyState === 4){
	                            setTimeout(callback, 0)
	                        }else{
	                            handle = ++xhrId;
	                            if(xhrOnUnloadAbort){
	                                if(!xhrCallbacks){
	                                    xhrCallbacks = {};
	                                    baidu.dom(window).on('unload', xhrOnUnloadAbort);
	                                }
	                                xhrCallbacks[handle] = callback;
	                            }
	                            xhr.onreadystatechange = callback;
	                        }
	                    },
	                    
	                    abort: function(){
	                        callback && callback(0, 1);
	                    }
	                };
	            }
	        });
	    }
	}();
	baidu._util_.smartAjax = baidu._util_.smartAjax || function(method){
	    return function(url, data, callback, type){
	        if(baidu.type(data) === 'function'){
	            type = type || callback;
	            callback = data;
	            data = undefined;
	        }
	        baidu.ajax({
	            type: method,
	            url: url,
	            data: data,
	            success: callback,
	            dataType: type
	        });
	    };
	}
	
	baidu._util_.smartScroll = function(axis){
	    var orie = {scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset'}[axis],
	        is = axis === 'scrollLeft',
	        ret = {};
	    function isDocument(ele){
	        return ele && ele.nodeType === 9;
	    }
	    function getWindow(ele){
	        return baidu.type(ele) == "Window" ? ele
	            : isDocument(ele) ? ele.defaultView || ele.parentWindow : false;
	    }
	    return {
	        get: function(ele){
	            var win = getWindow(ele);
	            return win ? (orie in win) ? win[orie]
	                : baidu.browser.isStrict && win.document.documentElement[axis]
	                    || win.document.body[axis] : ele[axis];
	        },
	        
	        set: function(ele, val){
	            if(!ele){return;}
	            var win = getWindow(ele);
	            win ? win.scrollTo(is ? val : this.get(ele), !is ? val : this.get(ele))
	                : ele[axis] = val;
	        }
	    };
	};
	
	baidu.makeArray = function(array, results){
	    var ret = results || [];
	    if(!array){return ret;}
	    array.length == null || ~'string|function|regexp'.indexOf(baidu.type(array)) ?
	        Array.prototype.push.call(ret, array) : baidu.merge(ret, array);
	    return ret;
	}
	
	baidu.extend(baidu._util_,{
	
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
		},
	
		valHooks: {
			option: {
				get: function( elem ) {
					// attributes.value is undefined in Blackberry 4.7 but
					// uses .value. See #6932
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text;
				}
			},
			select: {
				get: function( elem ) {
					var value, i, max, option,
						index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";
	
					// Nothing was selected
					if ( index < 0 ) {
						return null;
					}
	
					// Loop through all the selected options
					i = one ? index : 0;
					max = one ? index + 1 : options.length;
					for ( ; i < max; i++ ) {
						option = options[ i ];
	
						// Don't return options that are disabled or in a disabled optgroup
						if ( option.selected && (baidu.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
								(!option.parentNode.disabled || !baidu._util_.nodeName( option.parentNode, "optgroup" )) ) {
	
							// Get the specific value for the option
							value = baidu.dom( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
					if ( one && !values.length && options.length ) {
						return baidu( options[ index ] ).val();
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var values = baidu.makeArray( value );
	
					baidu(elem).find("option").each(function() {
						this.selected = baidu.array(values).indexOf( baidu(this).val()) >= 0;
					});
	
					if ( !values.length ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	//	
	});
	
	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !baidu.support.getSetAttribute ) {
	
		var fixSpecified = {
			name: true,
			id: true,
			coords: true
		};
	
		// Use this for any attribute in IE6/7
		// This fixes almost every IE6/7 issue
		baidu._util_.valHooks.button = {
			get: function( elem, name ) {
				var ret;
				ret = elem.getAttributeNode( name );
				return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
					ret.value :
					undefined;
			},
			set: function( elem, value, name ) {
				// Set the existing or create a new attribute node
				var ret = elem.getAttributeNode( name );
				if ( !ret ) {
					ret = document.createAttribute( name );
					elem.setAttributeNode( ret );
				}
				return ( ret.value = value + "" );
			}
		};
	}
	
	// Radios and checkboxes getter/setter
	if ( !baidu.support.checkOn ) {
		baidu.forEach([ "radio", "checkbox" ], function() {
			baidu._util_.valHooks[ this ] = {
				get: function( elem ) {
					// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
					return elem.getAttribute("value") === null ? "on" : elem.value;
				}
			};
		});
	}
	
	baidu.forEach([ "radio", "checkbox" ], function(item) {
		baidu._util_.valHooks[ item ] = baidu.extend( baidu._util_.valHooks[ item ], {
			set: function( elem, value ) {
				if ( baidu.isArray( value ) ) {
					return ( elem.checked = baidu.array(value).indexOf(baidu(elem).val()) >= 0 );
				}
			}
		});
	});
	
	baidu.createChain("fn",
	
	// 执行方法
	function(fn){
	    return new baidu.fn.$Fn(~'function|string'.indexOf(baidu.type(fn)) ? fn : function(){});
	},
	
	// constructor
	function(fn){
		this.fn = fn;
	});
	/// Tangram 1.x Code Start
	
	baidu.fn.blank = function () {};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	 
	baidu.ajax.request = function (url, opt_options) {
	    var options     = opt_options || {},
	        data        = options.data || "",
	        async       = !(options.async === false),
	        username    = options.username || "",
	        password    = options.password || "",
	        method      = (options.method || "GET").toUpperCase(),
	        headers     = options.headers || {},
	        // 基本的逻辑来自lili同学提供的patch
	        timeout     = options.timeout || 0,
	        eventHandlers = {},
	        tick, key, xhr;
	
	    
	    function stateChangeHandler() {
	        if (xhr.readyState == 4) {
	            try {
	                var stat = xhr.status;
	            } catch (ex) {
	                // 在请求时，如果网络中断，Firefox会无法取得status
	                fire('failure');
	                return;
	            }
	            
	            fire(stat);
	            
	            // http://www.never-online.net/blog/article.asp?id=261
	            // case 12002: // Server timeout      
	            // case 12029: // dropped connections
	            // case 12030: // dropped connections
	            // case 12031: // dropped connections
	            // case 12152: // closed by server
	            // case 13030: // status and statusText are unavailable
	            
	            // IE error sometimes returns 1223 when it 
	            // should be 204, so treat it as success
	            if ((stat >= 200 && stat < 300)
	                || stat == 304
	                || stat == 1223) {
	                fire('success');
	            } else {
	                fire('failure');
	            }
	            
	            
	            window.setTimeout(
	                function() {
	                    // 避免内存泄露.
	                    // 由new Function改成不含此作用域链的 baidu.fn.blank 函数,
	                    // 以避免作用域链带来的隐性循环引用导致的IE下内存泄露. By rocy 2011-01-05 .
	                    xhr.onreadystatechange = baidu.fn.blank;
	                    if (async) {
	                        xhr = null;
	                    }
	                }, 0);
	        }
	    }
	    
	    
	    function getXHR() {
	        if (window.ActiveXObject) {
	            try {
	                return new ActiveXObject("Msxml2.XMLHTTP");
	            } catch (e) {
	                try {
	                    return new ActiveXObject("Microsoft.XMLHTTP");
	                } catch (e) {}
	            }
	        }
	        if (window.XMLHttpRequest) {
	            return new XMLHttpRequest();
	        }
	    }
	    
	    
	    function fire(type) {
	        type = 'on' + type;
	        var handler = eventHandlers[type],
	            globelHandler = baidu.ajax[type];
	        
	        // 不对事件类型进行验证
	        if (handler) {
	            if (tick) {
	              clearTimeout(tick);
	            }
	
	            if (type != 'onsuccess') {
	                handler(xhr);
	            } else {
	                //处理获取xhr.responseText导致出错的情况,比如请求图片地址.
	                try {
	                    xhr.responseText;
	                } catch(error) {
	                    return handler(xhr);
	                }
	                handler(xhr, xhr.responseText);
	            }
	        } else if (globelHandler) {
	            //onsuccess不支持全局事件
	            if (type == 'onsuccess') {
	                return;
	            }
	            globelHandler(xhr);
	        }
	    }
	    
	    
	    for (key in options) {
	        // 将options参数中的事件参数复制到eventHandlers对象中
	        // 这里复制所有options的成员，eventHandlers有冗余
	        // 但是不会产生任何影响，并且代码紧凑
	        eventHandlers[key] = options[key];
	    }
	    
	    headers['X-Requested-With'] = 'XMLHttpRequest';
	    
	    
	    try {
	        xhr = getXHR();
	        
	        if (method == 'GET') {
	            if (data) {
	                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
	                data = null;
	            }
	            if(options['noCache'])
	                url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + (+ new Date) + '=1';
	        }
	        
	        if (username) {
	            xhr.open(method, url, async, username, password);
	        } else {
	            xhr.open(method, url, async);
	        }
	        
	        if (async) {
	            xhr.onreadystatechange = stateChangeHandler;
	        }
	        
	        // 在open之后再进行http请求头设定
	        // FIXME 是否需要添加; charset=UTF-8呢
	        if (method == 'POST') {
	            xhr.setRequestHeader("Content-Type",
	                (headers['Content-Type'] || "application/x-www-form-urlencoded"));
	        }
	        
	        for (key in headers) {
	            if (headers.hasOwnProperty(key)) {
	                xhr.setRequestHeader(key, headers[key]);
	            }
	        }
	        
	        fire('beforerequest');
	
	        if (timeout) {
	          tick = setTimeout(function(){
	            xhr.onreadystatechange = baidu.fn.blank;
	            xhr.abort();
	            fire("timeout");
	          }, timeout);
	        }
	        xhr.send(data);
	        
	        if (!async) {
	            stateChangeHandler();
	        }
	    } catch (ex) {
	        fire('failure');
	    }
	    
	    return xhr;
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.url = baidu.url || {};
	
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.url.escapeSymbol = function(source) {
	    
	    //TODO: 之前使用\s来匹配任意空白符
	    //发现在ie下无法匹配中文全角空格和纵向指标符\v，所以改\s为\f\r\n\t\v以及中文全角空格和英文空格
	    //但是由于ie本身不支持纵向指标符\v,故去掉对其的匹配，保证各浏览器下效果一致
	    return String(source).replace(/[#%&+=\/\\\ \　\f\r\n\t]/g, function(all) {
	        return '%' + (0x100 + all.charCodeAt()).toString(16).substring(1).toUpperCase();
	    });
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.ajax.form = function (form, options) {
	    options = options || {};
	    var elements    = form.elements,
	        len         = elements.length,
	        method      = form.getAttribute('method'),
	        url         = form.getAttribute('action'),
	        replacer    = options.replacer || function (value, name) {
	            return value;
	        },
	        sendOptions = {},
	        data = [],
	        i, item, itemType, itemName, itemValue, 
	        opts, oi, oLen, oItem;
	        
	    
	    function addData(name, value) {
	        data.push(name + '=' + value);
	    }
	    
	    // 复制发送参数选项对象
	    for (i in options) {
	        if (options.hasOwnProperty(i)) {
	            sendOptions[i] = options[i];
	        }
	    }
	    
	    for (i = 0; i < len; i++) {
	        item = elements[i];
	        itemName = item.name;
	        
	        // 处理：可用并包含表单name的表单项
	        if (!item.disabled && itemName) {
	            itemType = item.type;
	            itemValue = baidu.url.escapeSymbol(item.value);
	        
	            switch (itemType) {
	            // radio和checkbox被选中时，拼装queryString数据
	            case 'radio':
	            case 'checkbox':
	                if (!item.checked) {
	                    break;
	                }
	                
	            // 默认类型，拼装queryString数据
	            case 'textarea':
	            case 'text':
	            case 'password':
	            case 'hidden':
	            case 'select-one':
	                addData(itemName, replacer(itemValue, itemName));
	                break;
	                
	            // 多行选中select，拼装所有选中的数据
	            case 'select-multiple':
	                opts = item.options;
	                oLen = opts.length;
	                for (oi = 0; oi < oLen; oi++) {
	                    oItem = opts[oi];
	                    if (oItem.selected) {
	                        addData(itemName, replacer(oItem.value, itemName));
	                    }
	                }
	                break;
	            }
	        }
	    }
	    
	    // 完善发送请求的参数选项
	    sendOptions.data = data.join('&');
	    sendOptions.method = form.getAttribute('method') || 'GET';
	    
	    // 发送请求
	    return baidu.ajax.request(url, sendOptions);
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.ajax.get = function (url, onsuccess) {
	    return baidu.ajax.request(url, {'onsuccess': onsuccess});
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.ajax.post = function (url, data, onsuccess) {
	    return baidu.ajax.request(
	        url, 
	        {
	            'onsuccess': onsuccess,
	            'method': 'POST',
	            'data': data
	        }
	    );
	};
	/// Tangram 1.x Code End
	
	baidu.array.extend({
	    contains : function (item) {
	        return this.indexOf(item) > -1;
	    }
	});
	
	void function () {
	
	    Array.prototype.each = function(iterator, context){
	        return baidu.each(this, iterator, context);
	    };
	    
	    Array.prototype.forEach = function(iterator, context){
	        return baidu.forEach(this, iterator, context);
	    };
	
	    // TODO: delete in tangram 3.0
	    baidu.array.each = baidu.array.forEach = function(array, iterator, context) {
	        var fn = function(index, item, array){
	            return iterator.call(context || array, item, index, array);
	        };
	        return baidu.isEnumerable(array) ? baidu.each(array, typeof iterator == "function" ? fn : "", context) : array;
	    };
	}();
	
	baidu.array.extend({
	    empty : function () {
	        this.length = 0;
	        return this;
	    }
	});
	
	Array.prototype.every = function(iterator, context) {
	    baidu.check("function(,.+)?", "baidu.array.every");
	    var i, n;
	
	    for (i=0, n=this.length; i<n; i++) {
	        if (!iterator.call(context || this, this[i], i, this)) {
	            return false;
	        }
	    }
	    return true;
	};
	/// Tangram 1.x Code Start
	// TODO: delete in tangram 3.0
	baidu.array.every = function(array, iterator, context) {
	    return baidu.isArray(array) ? array.every(iterator, context) : array;
	};
	/// Tangram 1.x Code End
	
	Array.prototype.filter = function(iterator, context) {
	    var result = baidu.array([]),
	        i, n, item, index=0;
	
	    if (baidu.type(iterator) === "function") {
	        for (i=0, n=this.length; i<n; i++) {
	            item = this[i];
	
	            if (iterator.call(context || this, item, i, this) === true) {
	                result[index ++] = item;
	            }
	        }
	    }
	
	    return result;
	};
	/// Tangram 1.x Code Start
	// TODO: delete in tangram 3.0
	baidu.array.filter = function(array, filter, context) {
	    return baidu.isArray(array) ? array.filter(filter, context) : [];
	};
	/// Tangram 1.x Code End
	
	baidu.array.extend({
	    find : function (iterator) {
	        var i, item, n=this.length;
	
	        if (baidu.type(iterator) == "function") {
	            for (i=0; i<n; i++) {
	                item = this[i];
	                if (iterator.call(this, item, i, this) === true) {
	                    return item;
	                }
	            }
	        }
	
	        return null;
	    }
	});
	
	baidu.array.extend({
	    hash : function (values) {
	        var result = {},
	            vl = values && values.length,
	            i, n;
	
	        for (i=0, n=this.length; i < n; i++) {
	            result[this[i]] = (vl && vl > i) ? values[i] : true;
	        }
	        return result;
	    }
	});
	
	baidu.array.extend({
	    lastIndexOf : function (match, fromIndex) {
	        baidu.check(".+(,number)?", "baidu.array.lastIndexOf");
	        var len = this.length;
	
	        (!(fromIndex = fromIndex | 0) || fromIndex >= len) && (fromIndex = len - 1);
	        fromIndex < 0 && (fromIndex += len);
	
	        for(; fromIndex >= 0; fromIndex --){
	            if(fromIndex in this && this[fromIndex] === match){
	                return fromIndex;
	            }
	        }
	        
	        return -1;
	    }
	});
	
	Array.prototype.map = function (iterator, context) {
	    baidu.check("function(,.+)?","baidu.array.map");
	    var i, n,
	        array = baidu.array([]);
	
	    for (i=0, n=this.length; i < n; i++) {
	        array[i] = iterator.call(context || this, this[i], i, this);
	    }
	    return array;
	};
	
	/// Tangram 1.x Code Start
	baidu.array.map = function(array, iterator, context){
	    return baidu.isArray(array) ? array.map(iterator, context) : array;
	};
	/// Tangram 1.x Code End
	
	Array.prototype.reduce = function (iterator, initializer) {
	    baidu.check("function(,.+)?","baidu.array.reduce");
	    var i = 0, 
	        n = this.length,
	        found = false;
	
	    if (typeof initializer == "undefined") {
	        initializer = this[i++];
	
	        if (typeof initializer == "undefined") {
	            return ;
	        }
	    }
	
	    for (; i < n; i++) {
	        initializer = iterator(initializer, this[i] , i , this);
	    }
	    return initializer;
	};
	/// Tangram 1.x Code Start
	// TODO: delete in tangram 3.0
	baidu.array.reduce = function(array, iterator, initializer) {
	    return baidu.isArray(array) ? array.reduce(iterator, initializer) : array;
	};
	/// Tangram 1.x Code End
	
	baidu.array.extend({
	    remove : function (match) {
	        var n = this.length;
	            
	        while (n--) {
	            if (this[n] === match) {
	                this.splice(n, 1);
	            }
	        }
	        return this;
	    }
	});
	
	baidu.array.extend({
	    removeAt : function (index) {
	        baidu.check("number", "baidu.array.removeAt");
	        return this.splice(index, 1)[0];
	    }
	});
	
	Array.prototype.some = function(iterator, context){
	    baidu.check("function(,.+)?", "baidu.array.some");
	    var i, n;
	
	    for (i=0, n=this.length; i<n; i++) {
	        if (iterator.call(context || this, this[i], i, this)) {
	            return true;
	        }
	    }
	    return false;
	};
	/// Tangram 1.x Code Start
	// TODO: delete in tangram 3.0
	baidu.array.some = function(array, iterator, context) {
	    return array.some(iterator, context);
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.createChain("async",
	
	// 执行方法
	function(url){
		return typeof url === 'string'? new baidu.async.$Async(url):new baidu.async.$Async();
	},
	
	// constructor
	function(url){
		this.url = url;
	});
	
	/// Tangram 1.x Code End
	
	//baidu.lang.isFunction = function (source) {
	    // chrome下,'function' == typeof /a/ 为true.
	//    return '[object Function]' == Object.prototype.toString.call(source);
	//};
	baidu.lang.isFunction = baidu.isFunction;
	/// Tangram 1.x Code Start
	
	baidu.async._isDeferred = function(obj) {
	    var isFn = baidu.lang.isFunction;
	    return obj && isFn(obj.success) && isFn(obj.then)
	        && isFn(obj.fail) && isFn(obj.cancel);
	};
	/// Tangram 1.x Code End
	
	//baidu.object.extend = function (target, source) {
	//    for (var p in source) {
	//        if (source.hasOwnProperty(p)) {
	//            target[p] = source[p];
	//        }
	//    }
	//    
	//    return target;
	//};
	baidu.object.extend = baidu.extend;
	
	/// Tangram 1.x Code Start
	
	 
	baidu.async.extend({
	    Deferred:function(){
	        baidu.async.Deferred.apply(this,arguments);
	        return this;
	    }
	});
	
	baidu.async.Deferred = function() {
	    var me = this;
	    baidu.extend(me, {
	        _fired: 0,
	        _firing: 0,
	        _cancelled: 0,
	        _resolveChain: [],
	        _rejectChain: [],
	        _result: [],
	        _isError: 0
	    });
	
	    function fire() {
	        if (me._cancelled || me._firing) {
	            return;
	        }
	        //如果已有nextDeferred对象,则转移到nextDeferred上.
	        if (me._nextDeferred) {
	            me._nextDeferred.then(me._resolveChain[0], me._rejectChain[0]);
	            return;
	        }
	        me._firing = 1;
	        var chain = me._isError ? me._rejectChain : me._resolveChain,
	            result = me._result[me._isError ? 1 : 0];
	        // 此处使用while而非for循环,是为了避免firing时插入新函数.
	        while (chain[0] && (! me._cancelled)) {
	            //所有函数仅调用一次.
	            //TODO: 支持传入 this 和 arguments, 而不是仅仅一个值.
	            try {
	                var chainResult = chain.shift().call(me, result);
	                //若方法返回Deferred,则将剩余方法延至Deferred中执行
	                if (baidu.async._isDeferred(chainResult)) {
	                    me._nextDeferred = chainResult;
	                    [].push.apply(chainResult._resolveChain, me._resolveChain);
	                    [].push.apply(chainResult._rejectChain, me._rejectChain);
	                    chain = me._resolveChain = [];
	                    me._rejectChain = [];
	                }
	            } catch (error) {
	                throw error;
	            } finally {
	                me._fired = 1;
	                me._firing = 0;
	            }
	        }
	    }
	
	    
	    me.resolve = me.fireSuccess = function(value) {
	        me._result[0] = value;
	        fire();
	        return me;
	    };
	
	    
	    me.reject = me.fireFail = function(error) {
	        me._result[1] = error;
	        me._isError = 1;
	        fire();
	        return me;
	    };
	
	    
	    me.then = function(onSuccess, onFail) {
	        me._resolveChain.push(onSuccess);
	        me._rejectChain.push(onFail);
	        if (me._fired) {
	            fire();
	        }
	        return me;
	    };
	    
	    
	    me.success = function(onSuccess) {
	        return me.then(onSuccess, baidu.fn.blank);
	    };
	
	    
	    me.fail = function(onFail) {
	        return me.then(baidu.fn.blank, onFail);
	    };
	     
	    
	    me.cancel = function() {
	        me._cancelled = 1;
	    };
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.async.extend({
	    get : function(){
	        var url = this.url;
	        var deferred = new baidu.async.Deferred();
	        baidu.ajax.request(url, {
	            onsuccess: function(xhr, responseText) {
	                deferred.resolve({xhr: xhr, responseText: responseText}); 
	            },
	            onfailure: function(xhr) {
	                deferred.reject({xhr: xhr});
	            }
	        });
	        return deferred;
	    }
	});
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.async.extend({
	post : function(data){
	    var url = this.url;
	    var deferred = new baidu.async.Deferred();
	    baidu.ajax.request(url, {
	        method: 'POST',
	        data: data,
	        onsuccess: function(xhr, responseText) {
	            deferred.resolve({xhr: xhr, responseText: responseText}); 
	        },
	        onfailure: function(xhr) {
	            deferred.reject({xhr: xhr});
	        }
	    });
	    return deferred;
	}    
	});
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.async.when = function(deferredOrValue, onResolve, onReject) {
	    if (baidu.async._isDeferred(deferredOrValue)) {
	        deferredOrValue.then(onResolve, onReject);
	        return deferredOrValue;
	    }
	    var deferred = new baidu.async.Deferred();
	    deferred.then(onResolve, onReject).resolve(deferredOrValue);
	    return deferred;
	};
	/// Tangram 1.x Code End
	
	baidu.base = baidu.base || {};
	
	baidu.base.Class = (function() {
	    baidu._global_ = window[ baidu.guid ];
	    var instances = baidu._global_._instances_;
	    !instances && (instances = baidu._global_._instances_ = {});
	
	    // constructor
	    return function() {
	        this.guid = baidu.id();
	        !this._decontrol_ && (instances[this.guid] = this);
	    }
	})();
	
	baidu.extend(baidu.base.Class.prototype, {
	    
	    toString: function(){
	        return "[object " + ( this._type_ || "Object" ) + "]";
	    }
	
	    
	    ,dispose: function() {
	        if (this.fire("ondispose")) {
	            // decontrol
	            delete baidu._global_._instances_[this.guid];
	
	            if (this._listeners_) {
	                for (var item in this._listeners_) {
	                    this._listeners_[item].length = 0;
	                    delete this._listeners_[item];
	                }
	            }
	
	            for (var pro in this) {
	                typeof this[pro] != "function" && delete this[pro];
	            }
	
	            this.disposed = true;   //20100716
	        }
	    }
	
	    
	    ,fire: function(event, options) {
	        baidu.isString(event) && (event = new baidu.base.Event(event));
	
	        var i, n, list
	            , t=this._listeners_
	            , type=event.type
	            // 20121023 mz 修正事件派发多参数时，参数的正确性验证
	            , argu=[event].concat( Array.prototype.slice.call(arguments, 1) );
	        !t && (t = this._listeners_ = {});
	
	        // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
	        baidu.extend(event, options || {});
	
	        event.target = event.target || this;
	        event.currentTarget = this;
	
	        type.indexOf("on") != 0 && (type = "on" + type);
	
	        baidu.isFunction(this[type]) && this[type].apply(this, argu);
	
	        if (baidu.isArray(list = t[type])) {
	            for (i=0, n=list.length; i<n; i++) {
	                list[i].apply(this, argu);
	            }
	
	            if (list.once) {
	                for(i=list.once.length-1; i>-1; i--) list.splice(list.once[i], 1);
	                delete list.once;
	            }
	        }
	
	        return event.returnValue;
	    }
	
	    
	    ,on: function(type, handler, once) {
	        if (!baidu.isFunction(handler)) {
	            return this;
	        }
	
	        var list, t = this._listeners_;
	        !t && (t = this._listeners_ = {});
	
	        type.indexOf("on") != 0 && (type = "on" + type);
	
	        !baidu.isArray(list = t[type]) && (list = t[type] = []);
	        if (once) {
	            !list.once && (list.once = []);
	            list.once.push(list.length);
	        }
	        t[type].push( handler );
	
	        return this;
	    }
	    // 20120928 mz 取消on()的指定key
	
	    ,once: function(type, handler) {
	        return this.on(type, handler, true);
	    }
	    ,one: function(type, handler) {
	        return this.on(type, handler, true);
	    }
	
	    
	    ,off: function(type, handler) {
	        var i, list,
	            t = this._listeners_;
	        if (!t) return;
	
	        // remove all event listener
	        if (typeof type == "undefined") {
	            for (i in t) {
	                delete t[i];
	            }
	            return;
	        }
	
	        type.indexOf("on") && (type = "on" + type);
	
	        // 移除某类事件监听
	        if (typeof handler == "undefined") {
	            delete t[type];
	        } else if (list = t[type]) {
	
	            for (i = list.length - 1; i >= 0; i--) {
	                list[i] === handler && list.splice(i, 1);
	            }
	        }
	
	        return this;
	    }
	});
	
	window["baiduInstance"] = function(guid) {
	    return baidu._global_._instances_[ guid ];
	}
	
	baidu.base.Event = function(type, target) {
	    this.type = type;
	    this.returnValue = true;
	    this.target = target || null;
	    this.currentTarget = null;
	    this.preventDefault = function() {this.returnValue = false;};
	};
	
	//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
	//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性
	
	baidu.base.inherits = function (subClass, superClass, type) {
	    var key, proto, 
	        selfProps = subClass.prototype, 
	        clazz = new Function();
	        
	    clazz.prototype = superClass.prototype;
	    proto = subClass.prototype = new clazz();
	
	    for (key in selfProps) {
	        proto[key] = selfProps[key];
	    }
	    subClass.prototype.constructor = subClass;
	    subClass.superClass = superClass.prototype;
	
	    // 类名标识，兼容Class的toString，基本没用
	    typeof type == "string" && (proto._type_ = type);
	
	    subClass.extend = function(json) {
	        for (var i in json) proto[i] = json[i];
	        return subClass;
	    }
	    
	    return subClass;
	};
	
	//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写
	
	baidu.base.register = function (Class, constructorHook, methods) {
	    (Class._reg_ || (Class._reg_ = [])).push( constructorHook );
	
	    for (var method in methods) {
	    	Class.prototype[method] = methods[method];
	    }
	};
	
	// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
	// 20111129	meizz	添加第三个参数，可以直接挂载方法到目标类原型链上
	
	//baidu.browser.chrome = /chrome\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined;
	
	//baidu.browser.firefox = /firefox\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined;
	
	//IE 8下，以documentMode为准
	//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
	
	//baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;
	
	//baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
	
	//baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
	
	//try {
	//    if (/(\d+\.\d+)/.test(external.max_version)) {
	
	//        baidu.browser.maxthon = + RegExp['\x241'];
	//    }
	//} catch (e) {}
	
	//baidu.browser.opera = /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(navigator.userAgent) ?  + ( RegExp["\x246"] || RegExp["\x242"] ) : undefined;
	
	//(function(){
	//    var ua = navigator.userAgent;
	    
	    
	    
	//    baidu.browser.safari = /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) ? + (RegExp['\x241'] || RegExp['\x242']) : undefined;
	//})();
	
	baidu.cookie = baidu.cookie || {};
	
	baidu.cookie._isValidKey = function (key) {
	    // http://www.w3.org/Protocols/rfc2109/rfc2109
	    // Syntax:  General
	    // The two state management headers, Set-Cookie and Cookie, have common
	    // syntactic properties involving attribute-value pairs.  The following
	    // grammar uses the notation, and tokens DIGIT (decimal digits) and
	    // token (informally, a sequence of non-special, non-white space
	    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
	    // their syntax.
	    // av-pairs   = av-pair *(";" av-pair)
	    // av-pair    = attr ["=" value] ; optional value
	    // attr       = token
	    // value      = word
	    // word       = token | quoted-string
	    
	    // http://www.ietf.org/rfc/rfc2068.txt
	    // token      = 1*<any CHAR except CTLs or tspecials>
	    // CHAR       = <any US-ASCII character (octets 0 - 127)>
	    // CTL        = <any US-ASCII control character
	    //              (octets 0 - 31) and DEL (127)>
	    // tspecials  = "(" | ")" | "<" | ">" | "@"
	    //              | "," | ";" | ":" | "\" | <">
	    //              | "/" | "[" | "]" | "?" | "="
	    //              | "{" | "}" | SP | HT
	    // SP         = <US-ASCII SP, space (32)>
	    // HT         = <US-ASCII HT, horizontal-tab (9)>
	        
	    return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
	};
	
	baidu.cookie.getRaw = function (key) {
	    if (baidu.cookie._isValidKey(key)) {
	        var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
	            result = reg.exec(document.cookie);
	            
	        if (result) {
	            return result[2] || null;
	        }
	    }
	
	    return null;
	};
	
	 
	baidu.cookie.get = function (key) {
	    var value = baidu.cookie.getRaw(key);
	    if ('string' == typeof value) {
	        value = decodeURIComponent(value);
	        return value;
	    }
	    return null;
	};
	
	baidu.cookie.setRaw = function (key, value, options) {
	    if (!baidu.cookie._isValidKey(key)) {
	        return;
	    }
	    
	    options = options || {};
	    //options.path = options.path || "/"; // meizz 20100402 设定一个初始值，方便后续的操作
	    //berg 20100409 去掉，因为用户希望默认的path是当前路径，这样和浏览器对cookie的定义也是一致的
	    
	    // 计算cookie过期时间
	    var expires = options.expires;
	    if ('number' == typeof options.expires) {
	        expires = new Date();
	        expires.setTime(expires.getTime() + options.expires);
	    }
	    
	    document.cookie =
	        key + "=" + value
	        + (options.path ? "; path=" + options.path : "")
	        + (expires ? "; expires=" + expires.toGMTString() : "")
	        + (options.domain ? "; domain=" + options.domain : "")
	        + (options.secure ? "; secure" : ''); 
	};
	
	baidu.cookie.remove = function (key, options) {
	    options = options || {};
	    options.expires = new Date(0);
	    baidu.cookie.setRaw(key, '', options);
	};
	
	baidu.cookie.set = function (key, value, options) {
	    baidu.cookie.setRaw(key, encodeURIComponent(value), options);
	};
	
	baidu.createClass = function(constructor, type, options) {
	    options = options || {};
	
	    // 创建新类的真构造器函数
	    var fn = function(){
	        var me = this;
	
	        // 20101030 某类在添加该属性控制时，guid将不在全局instances里控制
	        options.decontrolled && (me._decontrol_ = true);
	
	        // 继承父类的构造器
	        fn.superClass.apply(me, arguments);
	
	        // 全局配置
	        for (var i in fn.options) me[i] = fn.options[i];
	
	        constructor.apply(me, arguments);
	
	        for (var i=0, reg=fn._reg_; reg && i<reg.length; i++) {
	            reg[i].apply(me, arguments);
	        }
	    };
	
	    baidu.extend(fn, {
	        superClass: options.superClass || baidu.base.Class
	
	        ,inherits: function(superClass){
	            if (typeof superClass != "function") return fn;
	
	            var C = function(){};
	            C.prototype = (fn.superClass = superClass).prototype;
	
	            // 继承父类的原型（prototype)链
	            var fp = fn.prototype = new C();
	            // 继承传参进来的构造器的 prototype 不会丢
	            baidu.extend(fn.prototype, constructor.prototype);
	            // 修正这种继承方式带来的 constructor 混乱的问题
	            fp.constructor = constructor;
	
	            return fn;
	        }
	        ,register: function(hook, methods) {
	            (fn._reg_ || (fn._reg_ = [])).push( hook );
	            methods && baidu.extend(fn.prototype, methods);
	            return fn;
	        }
	        ,extend: function(json){baidu.extend(fn, json); return fn;}
	    });
	
	    type = type || options.className || options.type;
	    typeof type == "string" && (constructor.prototype._type_ = type);
	    typeof fn.superClass == "function" && fn.inherits(fn.superClass);
	
	    return fn;
	};
	
	// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
	// 20121105 meizz   给类添加了几个静态属性方法：.options .superClass .inherits() .extend() .register()
	
	baidu.createSingle = function (json) {
	    var c = new baidu.base.Class();
	
	    for (var key in json) {
	        c[key] = json[key];
	    }
	    return c;
	};
	
	baidu.date = baidu.date || {};
	
	baidu.createChain('number', function(number){
	    var nan = parseFloat(number),
	        val = isNaN(nan) ? nan : number,
	        clazz = typeof val === 'number' ? Number : String,
	        pro = clazz.prototype;
	    val = new clazz(val);
	    baidu.forEach(baidu.number.$Number.prototype, function(value, key){
	        pro[key] || (val[key] = value);
	    });
	    return val;
	});
	
	baidu.number.extend({
	    pad : function (length) {
	    	var source = this;
	        var pre = "",
	            negative = (source < 0),
	            string = String(Math.abs(source));
	    
	        if (string.length < length) {
	            pre = (new Array(length - string.length + 1)).join('0');
	        }
	    
	        return (negative ?  "-" : "") + pre + string;
	    }
	});
	
	baidu.date.format = function (source, pattern) {
	    if ('string' != typeof pattern) {
	        return source.toString();
	    }
	
	    function replacer(patternPart, result) {
	        pattern = pattern.replace(patternPart, result);
	    }
	    
	    var pad     = baidu.number.pad,
	        year    = source.getFullYear(),
	        month   = source.getMonth() + 1,
	        date2   = source.getDate(),
	        hours   = source.getHours(),
	        minutes = source.getMinutes(),
	        seconds = source.getSeconds();
	
	    replacer(/yyyy/g, pad(year, 4));
	    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
	    replacer(/MM/g, pad(month, 2));
	    replacer(/M/g, month);
	    replacer(/dd/g, pad(date2, 2));
	    replacer(/d/g, date2);
	
	    replacer(/HH/g, pad(hours, 2));
	    replacer(/H/g, hours);
	    replacer(/hh/g, pad(hours % 12, 2));
	    replacer(/h/g, hours % 12);
	    replacer(/mm/g, pad(minutes, 2));
	    replacer(/m/g, minutes);
	    replacer(/ss/g, pad(seconds, 2));
	    replacer(/s/g, seconds);
	
	    return pattern;
	};
	
	baidu.date.parse = function (source) {
	    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
	    if ('string' == typeof source) {
	        if (reg.test(source) || isNaN(Date.parse(source))) {
	            var d = source.split(/ |T/),
	                d1 = d.length > 1 
	                        ? d[1].split(/[^\d]/) 
	                        : [0, 0, 0],
	                d0 = d[0].split(/[^\d]/);
	            return new Date(d0[0] - 0, 
	                            d0[1] - 1, 
	                            d0[2] - 0, 
	                            d1[0] - 0, 
	                            d1[1] - 0, 
	                            d1[2] - 0);
	        } else {
	            return new Date(source);
	        }
	    }
	    
	    return new Date();
	};
	
	/// Tangram 1.x Code Start
	//为兼容Tangram1.x的magic增加的接口
	
	baidu.dom._matchNode = function (element, direction, start) {
	    element = baidu.dom.g(element);
	
	    for (var node = element[start]; node; node = node[direction]) {
	        if (node.nodeType == 1) {
	            return node;
	        }
	    }
	
	    return null;
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.dom._NAME_ATTRS = (function () {
	    var result = {
	        'cellpadding': 'cellPadding',
	        'cellspacing': 'cellSpacing',
	        'colspan': 'colSpan',
	        'rowspan': 'rowSpan',
	        'valign': 'vAlign',
	        'usemap': 'useMap',
	        'frameborder': 'frameBorder'
	    };
	    
	    if (baidu.browser.ie < 8) {
	        result['for'] = 'htmlFor';
	        result['class'] = 'className';
	    } else {
	        result['htmlFor'] = 'for';
	        result['className'] = 'class';
	    }
	    
	    return result;
	})();
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.dom._styleFilter = baidu.dom._styleFilter || [];
	/// support magic - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
	    get: function (key, value) {
	        if (/color/i.test(key) && value.indexOf("rgb(") != -1) {
	            var array = value.split(",");
	
	            value = "#";
	            for (var i = 0, color; color = array[i]; i++){
	                color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
	                value += color.length == 1 ? "0" + color : color;
	            }
	
	            value = value.toUpperCase();
	        }
	
	        return value;
	    }
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.dom._styleFilter.filter = function (key, value, method) {
	    for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
	        if (filter = filter[method]) {
	            value = filter(key, value);
	        }
	    }
	
	    return value;
	};
	/// support magic - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
	    set: function (key, value) {
	        if (value.constructor == Number 
	            && !/zIndex|fontWeight|opacity|zoom|lineHeight/i.test(key)){
	            value = value + "px";
	        }
	
	        return value;
	    }
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.dom._styleFixer = baidu.dom._styleFixer || {};
	/// support magic - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFixer.display = baidu.browser.ie && baidu.browser.ie < 8 ? { // berg: 修改到<8，因为ie7同样存在这个问题，from 先伟
	    set: function (element, value) {
	        element = element.style;
	        if (value == 'inline-block') {
	            element.display = 'inline';
	            element.zoom = 1;
	        } else {
	            element.display = value;
	        }
	    }
	} : baidu.browser.firefox && baidu.browser.firefox < 3 ? {
	    set: function (element, value) {
	        element.style.display = value == 'inline-block' ? '-moz-inline-box' : value;
	    }
	} : null;
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFixer["float"] = baidu.browser.ie ? "styleFloat" : "cssFloat";
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFixer.opacity = baidu.browser.ie ? {
	    get: function (element) {
	        var filter = element.style.filter;
	        return filter && filter.indexOf("opacity=") >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + "" : "1";
	    },
	
	    set: function (element, value) {
	        var style = element.style;
	        // 只能Quirks Mode下面生效??
	        style.filter = (style.filter || "").replace(/alpha\([^\)]*\)/gi, "") + (value == 1 ? "" : "alpha(opacity=" + value * 100 + ")");
	        // IE filters only apply to elements with "layout."
	        style.zoom = 1;
	    }
	} : null;
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFixer.width = baidu.dom._styleFixer.height = {
	    get: function(element, key, value) {
	        var key = key.replace(/^[a-z]/, function($1){
		            return $1.toUpperCase();
		        }),
	        	val = element['client' + key] || element['offset' + key];
	
	        return val > 0 ? val + 'px' : !value || value == 'auto' ? 0 + 'px' : val;
	    },
	
	    set: function(element, value, key){
	    	element.style[key] = value;
	    }
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	// TODO
	// 1. 无法解决px/em单位统一的问题（IE）
	// 2. 无法解决样式值为非数字值的情况（medium等 IE）
	baidu.dom.getStyle = function (element, key) {
	    var dom = baidu.dom;
	
	    element = dom.g(element);
	    key = baidu.string.toCamelCase(key);
	    //computed style, then cascaded style, then explicitly set style.
	    var value = element.style[key] ||
	                (element.currentStyle ? element.currentStyle[key] : "") || 
	                dom.getComputedStyle(element, key);
	
	    // 在取不到值的时候，用fixer进行修正
	    if (!value || value == 'auto') {
	        var fixer = dom._styleFixer[key];
	        if(fixer){
	            value = fixer.get ? fixer.get(element, key, value) : baidu.dom.getStyle(element, fixer);
	        }
	    }
	    
	    
	    if (fixer = dom._styleFilter) {
	        value = fixer.filter(key, value, 'get');
	    }
	
	    return value;
	};
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.dom._styleFixer.textOverflow = (function () {
	    var fontSizeCache = {};
	
	    function pop(list) {
	        var o = list.length;
	        if (o > 0) {
	            o = list[o - 1];
	            list.length--;
	        } else {
	            o = null;
	        }
	        return o;
	    }
	
	    function setText(element, text) {
	        element[baidu.browser.firefox ? "textContent" : "innerText"] = text;
	    }
	
	    function count(element, width, ellipsis) {
	        
	        var o = baidu.browser.ie ? element.currentStyle || element.style : getComputedStyle(element, null),
	            fontWeight = o.fontWeight,
	            cacheName =
	                "font-family:" + o.fontFamily + ";font-size:" + o.fontSize
	                + ";word-spacing:" + o.wordSpacing + ";font-weight:" + ((parseInt(fontWeight) || 0) == 401 ? 700 : fontWeight)
	                + ";font-style:" + o.fontStyle + ";font-variant:" + o.fontVariant,
	            cache = fontSizeCache[cacheName];
	
	        if (!cache) {
	            o = element.appendChild(document.createElement("div"));
	
	            o.style.cssText = "float:left;" + cacheName;
	            cache = fontSizeCache[cacheName] = [];
	
	            
	            for (var i=0; i < 256; i++) {
	                i == 32 ? (o.innerHTML = "&nbsp;") : setText(o, String.fromCharCode(i));
	                cache[i] = o.offsetWidth;
	            }
	
	            
	            setText(o, "\u4e00");
	            cache[256] = o.offsetWidth;
	            setText(o, "\u4e00\u4e00");
	            cache[257] = o.offsetWidth - cache[256] * 2;
	            cache[258] = cache[".".charCodeAt(0)] * 3 + cache[257] * 3;
	
	            element.removeChild(o);
	        }
	
	        for (
	            
	            var node = element.firstChild, charWidth = cache[256], wordSpacing = cache[257], ellipsisWidth = cache[258],
	                wordWidth = [], ellipsis = ellipsis ? ellipsisWidth : 0;
	            node;
	            node = node.nextSibling
	        ) {
	            if (width < ellipsis) {
	                element.removeChild(node);
	            }
	            else if (node.nodeType == 3) {
	                for (var i = 0, text = node.nodeValue, length = text.length; i < length; i++) {
	                    o = text.charCodeAt(i);
	                    
	                    wordWidth[wordWidth.length] = [width, node, i];
	                    width -= (i ? wordSpacing : 0) + (o < 256 ? cache[o] : charWidth);
	                    if (width < ellipsis) {
	                        break;
	                    }
	                }
	            }
	            else {
	                o = node.tagName;
	                if (o == "IMG" || o == "TABLE") {
	                    
	                    o = node;
	                    node = node.previousSibling;
	                    element.removeChild(o);
	                }
	                else {
	                    wordWidth[wordWidth.length] = [width, node];
	                    width -= node.offsetWidth;
	                }
	            }
	        }
	
	        if (width < ellipsis) {
	            
	            while (o = pop(wordWidth)) {
	                width = o[0];
	                node = o[1];
	                o = o[2];
	                if (node.nodeType == 3) {
	                    if (width >= ellipsisWidth) {
	                        node.nodeValue = node.nodeValue.substring(0, o) + "...";
	                        return true;
	                    }
	                    else if (!o) {
	                        element.removeChild(node);
	                    }
	                }
	                else if (count(node, width, true)) {
	                    return true;
	                }
	                else {
	                    element.removeChild(node);
	                }
	            }
	
	            
	            element.innerHTML = "";
	        }
	    }
	
	    return {
			get: function (element) {
	            var browser = baidu.browser,
	                getStyle = dom.getStyle;
				return (browser.opera ?
	                        getStyle("OTextOverflow") :
	                        browser.firefox ?
	                            element._baiduOverflow :
	                            getStyle("textOverflow")) ||
	                   "clip";
			},
	
			set: function (element, value) {
	            var browser = baidu.browser;
				if (element.tagName == "TD" || element.tagName == "TH" || browser.firefox) {
					element._baiduHTML && (element.innerHTML = element._baiduHTML);
	
					if (value == "ellipsis") {
						element._baiduHTML = element.innerHTML;
						var o = document.createElement("div"), width = element.appendChild(o).offsetWidth;
						element.removeChild(o);
						count(element, width);
					}
					else {
						element._baiduHTML = "";
					}
				}
	
				o = element.style;
				browser.opera ? (o.OTextOverflow = value) : browser.firefox ? (element._baiduOverflow = value) : (o.textOverflow = value);
			}
	    };
	})();
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    add : function (object, context) {
	        var a = baidu.array(this.get());
	
	        switch (baidu.type(object)) {
	            case "HTMLElement" :
	                a.push(object);
	                break;
	
	            case "$DOM" :
	            case "array" :
	                baidu.merge(a, object)
	                break;
	
	            // HTMLString or selector
	            case "string" :
	                baidu.merge(a, baidu.dom(object, context));
	                break;
	            // [TODO] case "NodeList" :
	            default :
	                if (typeof object == "object" && object.length) {
	                    baidu.merge(a, object)
	                }
	        }
	        return baidu.dom( a.unique() );
	    }
	});
	
	// meizz 20120601 add方法可以完全使用 baidu.merge(this, baidu.dom(object, context)) 这一句代码完成所有功能，但为节约内存和提高效率的原因，将几个常用分支单独处理了
	
	baidu.dom.extend({
	    addClass: function(value){
	    	
	        //异常处理
	        if(arguments.length <= 0 ){
	            return this;
	        };
	
	        switch(typeof value){
	            case 'string':
	
	                //对输入进行处理
	                value = value.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+/g,' ');
	                
	                var arr = value.split(' ');
	                baidu.forEach(this, function(item, index){
	                    var str = '';
	                    if(item.className){
	                        str = item.className;
	                    };
	                    for(var i = 0; i<arr.length; i++){
	                        if((' '+str+' ').indexOf(' '+arr[i]+' ') == -1){
	                            str += (' '+arr[i]);
	                        };
	                    };
	                    item.className = str.replace(/^\s+/g,'') ;
	                });
	
	            break;
	            case 'function':
	                baidu.forEach(this, function(item, index){
	                    baidu.dom(item).addClass(value.call(item, index, item.className));
	                });
	
	            break;
	        };
	
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    after: function(){
	        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.after');
	        var parentNode = this[0] && this[0].parentNode,
	            array = !parentNode && [];
	        baidu._util_.smartInsert(this, arguments, function(node){
	            parentNode ? parentNode.insertBefore(node, this.nextSibling)
	                : baidu.merge(array, node.childNodes);
	        });
	        array && baidu.merge(this, array);
	        return this;
	    }
	});
	
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
	
	 
	
	 
	
	baidu.dom.extend({
	    val: function(value){
	        var bd = baidu.dom,
	            bu = baidu._util_,
	            me = this,
	            isSet = false,
	            result;
	
	        //当dom选择器为空时
	        if(this.size()<=0){
	            switch(typeof value){
	                case 'undefined':
	                    return undefined;
	                break;
	                default:
	                    return me;
	                break;
	            }            
	        }
	                
	        baidu.forEach(me,function(elem, index){
	            
	            var hooks,
	                rreturn = /\r/g;
	
	            if(result){
	                return;
	            }
	
	            switch(typeof value){
	                case 'undefined':
	        
	                    //get first
	                    if ( elem ) {
	                        hooks = bu.valHooks[ elem.type ] || bu.valHooks[ elem.nodeName.toLowerCase() ];
	                        if ( hooks && "get" in hooks && (result = hooks.get( elem, "value" )) !== undefined ) {
	                            return result;
	                        }
	                        result = elem.value;
	
	                        return typeof result === "string" ?
	                        
	                        // handle most common string cases
	                        result.replace(rreturn, "") :
	                        
	                        // handle cases where value is null/undef or number
	                        result == null ? "" : result;
	                    }
	                
	                    return result;
	
	                break;
	
	                case 'function':
	
	                    //set all
	                    isSet = true;
	                    var tangramDom = bd(elem);
	                    tangramDom.val(value.call(elem, index, tangramDom.val()));
	
	                break;
	
	                default:
	
	                    //set all
	                    isSet = true;
	
	                    if ( elem.nodeType !== 1 ) {
	                        return;
	                    }
	
	                    // Treat null/undefined as ""; convert numbers to string
	                    if ( value == null ) {
	                        value = "";
	                    } else if ( typeof value === "number" ) {
	                        value += "";
	                    } else if ( baidu.isArray( value ) ) {
	                        value = baidu.forEach(value,function ( value, index ) {
	                            return value == null ? "" : value + "";
	                        });
	                    }
	
	                    hooks = bu.valHooks[ elem.type ] || bu.valHooks[ elem.nodeName.toLowerCase() ];
	
	                    // If set returns undefined, fall back to normal setting
	                    if ( !hooks || !("set" in hooks) || hooks.set( elem, value, "value" ) === undefined ) {
	                        elem.value = value;
	                    }
	
	                break;
	            };
	        });
	
	        return isSet?me:result;
	    }
	});
	
	baidu.dom.extend({
	    text: function(value){
	
	        var bd = baidu.dom,
	            me = this,
	            isSet = false,
	            result;
	
	        //当dom选择器为空时
	        if(this.size()<=0){
	            switch(typeof value){
	                case 'undefined':
	                    return undefined;
	                break;
	                default:
	                    return me;
	                break;
	            }            
	        }
	
	        
	        var getText = function( elem ) {
	            var node,
	                ret = "",
	                i = 0,
	                nodeType = elem.nodeType;
	
	            if ( nodeType ) {
	                if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
	                    // Use textContent for elements
	                    // innerText usage removed for consistency of new lines (see #11153)
	                    if ( typeof elem.textContent === "string" ) {
	                        return elem.textContent;
	                    } else {
	                        // Traverse its children
	                        for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
	                            ret += getText( elem );
	                        }
	                    }
	                } else if ( nodeType === 3 || nodeType === 4 ) {
	                    return elem.nodeValue;
	                }
	                // Do not include comment or processing instruction nodes
	            } else {
	
	                // If no nodeType, this is expected to be an array
	                for ( ; (node = elem[i]); i++ ) {
	                    // Do not traverse comment nodes
	                    ret += getText( node );
	                }
	            }
	            return ret;
	        };
	
	        baidu.forEach(me,function(elem, index){
	            
	            var tangramDom = bd(elem);
	            if(result){
	                return;
	            };
	
	            switch(typeof value){
	                case 'undefined':
	        
	                    //get first
	                    result = getText(elem);
	                    return result;
	
	                break;
	
	                case 'number':
	                    value = String(value);
	                case 'string':
	
	                    //set all
	                    isSet = true;
	                    tangramDom.empty().append( ( elem && elem.ownerDocument || document ).createTextNode( value ) );
	                break;
	
	                case 'function':
	
	                    //set all
	                    isSet = true;
	                    tangramDom.text(value.call(elem, index, tangramDom.text()));
	
	                break;
	            };
	        });
	
	        return isSet?me:result;
	    }
	});
	
	baidu.dom.extend({
	    width: function(value){
	        return baidu._util_.access(this, 'width', value, function(ele, key, val){
	            var hasValue = val !== undefined,
	                parseValue = hasValue && parseFloat(val),
	                type = ele != null && ele == ele.window ? 'window'
	                    : (ele.nodeType === 9 ? 'document' : false);
	            if(hasValue && parseValue < 0 || isNaN(parseValue)){return;}
	            hasValue && /^(?:\d*\.)?\d+$/.test(val += '') && (val += 'px');
	            return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, key)
	                : (hasValue ? ele.style.width = val : baidu._util_.getWidthOrHeight(ele, key));
	        });
	    }
	});
	
	 
	
	baidu.dom.extend({
	    height: function(value){
	        return baidu._util_.access(this, 'height', value, function(ele, key, val){
	            var hasValue = val !== undefined,
	                parseValue = hasValue && parseFloat(val),
	                type = ele != null && ele == ele.window ? 'window'
	                    : (ele.nodeType === 9 ? 'document' : false);
	            if(hasValue && parseValue < 0 || isNaN(parseValue)){return;}
	            hasValue && /^(?:\d*\.)?\d+$/.test(val += '') && (val += 'px');
	            return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, key)
	                : (hasValue ? ele.style.height = val : baidu._util_.getWidthOrHeight(ele, key));
	        });
	    }
	});
	
	baidu.dom.extend({
	    getWindow: function(){
	        var doc = this.getDocument();
	        return (this.size()<=0)? undefined :(doc.parentWindow || doc.defaultView);
	    }
	});
	
	baidu.dom.extend({
	    offset: function(){
	        var offset = {
	            getDefaultOffset: function(ele, doc){
	                var docElement = doc.documentElement,
	                    body = doc.body,
	                    defaultView = doc.defaultView,
	                    computedStyle = defaultView ? defaultView.getComputedStyle(ele, null) : ele.currentStyle,
	                    patrn = /^t(?:able|h|d)/i,
	                    offsetParent = ele.offsetParent,
	                    l = ele.offsetLeft,
	                    t = ele.offsetTop;
	                //
	                while((ele = ele.parentNode) && ele !== body && ele !== docElement){
	                    if(baidu.support.fixedPosition && computedStyle.position === 'fixed'){break;}
	                    computedStyle = defaultView ? defaultView.getComputedStyle(ele, null) : ele.currentStyle;
	                    l -= ele.scrollLeft;
	                    t -= ele.scrollTop;
	                    if(ele === offsetParent){
	                        l += ele.offsetLeft;
	                        t += ele.offsetTop;
	                        //当浏览器不会自动包含元素的border运算时
	                        if(!baidu.support.hasBorderWidth
	                            && !(baidu.support.hasTableCellBorderWidth && patrn.test(ele.nodeName))){
	                                l += parseFloat(computedStyle.borderLeftWidth) || 0;
	                                t += parseFloat(computedStyle.borderTopWidth) || 0;
	                        }
	                        offsetParent = ele.offsetParent;
	                    }
	                }
	                if(~'static,relative'.indexOf(computedStyle.position)){
	                    l += body.offsetLeft;
	                    t += body.offsetTop;
	                }
	                if(baidu.support.fixedPosition && computedStyle.position === 'fixed'){
	                    l += Math.max(docElement.scrollLeft, body.scrollLeft);
	                    t += Math.max(docElement.scrollTop, body.scrollTop);
	                }
	                return {left: l, top: t};
	            },
	            //
	            setOffset: function(ele, options, index){
	                var tang = baidu.dom(ele),
	                    type = baidu.type(options),
	                    currOffset = tang.offset(),
	                    currLeft = tang.getCurrentStyle('left'),
	                    currTop = tang.getCurrentStyle('top');
	                type === 'function' && (options = options.call(ele, index, currOffset));
	                // TODO
	                if(!options || options.left === undefined
	                    && options.top === undefined){
	                        return;
	                }
	                currLeft = parseFloat(currLeft) || 0;
	                currTop = parseFloat(currTop) || 0;
	                options.left != undefined && (ele.style.left = options.left - currOffset.left + currLeft + 'px');
	                options.top != undefined && (ele.style.top = options.top - currOffset.top + currTop + 'px');
	                tang.getCurrentStyle('position') === 'static'
	                    && (ele.style.position = 'relative');
	            },
	            //
	            bodyOffset: function(body){
	                var tang = baidu.dom(body);
	                return {
	                    left: body.offsetLeft + parseFloat(tang.getCurrentStyle('marginLeft')) || 0,
	                    top: body.offsetTop + parseFloat(tang.getCurrentStyle('marginTop')) || 0
	                }
	            }
	        };
	        
	        offset.getOffset = 'getBoundingClientRect' in document.documentElement ?
	            function(ele, doc){
	                //IE6有时会出现找不到方法的奇葩现像
	                if(!ele.getBoundingClientRect){return offset.getDefaultOffset(ele, doc);}
	                var rect = ele.getBoundingClientRect(),
	                    win = baidu.dom(doc).getWindow(),
	                    docElement = doc.documentElement,
	                    body = doc.body;
	                return {
	                    left: rect.left + (win.pageXOffset || Math.max(docElement.scrollLeft, body.scrollLeft)) - (docElement.clientLeft || body.clientLeft),
	                    top: rect.top + (win.pageYOffset || Math.max(docElement.scrollTop, body.scrollTop)) - (docElement.clientTop || body.clientTop)
	                };
	            } : offset.getDefaultOffset;
	        
	        
	        
	        return function(options){
	            if(!options){
	                var ele = this[0],
	                    doc = baidu.dom(ele).getDocument();
	                return offset[ele === doc.body ? 'bodyOffset' : 'getOffset'](ele, doc);
	            }else{
	                baidu.check('^(?:object|function)$', 'baidu.dom.offset');
	                for(var i = 0, item; item = this[i]; i++){
	                    offset.setOffset(item, options, i);
	                }
	                return this;
	           }
	        }
	    }()
	});
	
	 
	
	/// baidu._util_.propHooks;
	
	baidu.dom.extend({
	    removeAttr: function(value){
	        if(!value || baidu.type(value) !== 'string'){return this;}//异常处理
	        var util = baidu._util_, attrNames;
	        this.each(function(index, item){
	            if(item.nodeType !== 1){return;}
	            attrNames = value.toLowerCase().split(/\s+/);
	            for(var i = 0, attr; attr = attrNames[i]; i++){
	                util
	            }
	            
	            
	        });
	        
	        
	
	        baidu.forEach(this, function(item){
	            var propName, attrNames, name, l, isBool, i = 0;
	
	            if ( item.nodeType === 1 ) {
	                var bd = baidu.dom,
	                    bu = baidu._util_;
	
	                attrNames = value.toLowerCase().split(/\s+/);
	                l = attrNames.length;
	
	                for ( ; i < l; i++ ) {
	                    name = attrNames[ i ];
	
	                    if ( name ) {
	                        propName = bu.propFix[ name ] || name;
	                        isBool = bu.rboolean.test( name );
	
	                        // See #9699 for explanation of this approach (setting first, then removal)
	                        // Do not do this for boolean attributes (see #10870)
	                        if ( !isBool ) {
	                            bd(item).attr(name,"");
	                        }
	                        item.removeAttribute( baidu.support.getSetAttribute ? name : propName );
	
	                        // Set corresponding property to false for boolean attributes
	                        if ( isBool && propName in item ) {
	                            item[ propName ] = false;
	                        }
	                    }
	                }
	            }
	        });
	        
	        return this;
	    }
	});
	
	 
	
	///baidu._util_.attrHooks;
	
	baidu.dom.extend({
	    attr:function(name,value){
	
	        //异常处理
	        if(arguments.length <= 0 || typeof name === 'function'){
	            return this;
	        };
	
	        //返回结果
	        var result,
	            me = this,
	            isSet = false;
	
	        //当dom选择器为空时
	        if(this.size()<=0){
	            if(name&&value){
	                return me;
	            }else if(name&&!value){
	                return undefined;
	            }else{
	                return me;
	            }
	        }
	
	        baidu.forEach(this, function(item, index){
	
	            if(result){
	                return;
	            };
	
	            var ret, 
	                hooks,
	                notxml,
	                bd = baidu.dom,
	                bu = baidu._util_,
	                nType = item.nodeType;
	
	            // don't get/set properties on text, comment and attribute nodes
	            if ( !item || nType === 3 || nType === 8 || nType === 2 ) {
	                return;
	            };
	
	            // Fallback to prop when attributes are not supported
	            if ( typeof item.getAttribute === "undefined" ) {
	                var ele = bd(item); 
	                result = ele.prop( name, value );
	                
	            };
	
	            switch(typeof name){
	                case 'string':
	                    notxml = nType !== 1 || !baidu._util_.isXML( item );
	
	                    // All attributes are lowercase
	                    // Grab necessary hook if one is defined
	                    if ( notxml ) {
	                        name = name.toLowerCase();
	                        hooks = bu.attrHooks[ name ] || ( bu.rboolean.test( name ) ? bu.boolHook : bu.nodeHook );
	                    };
	
	                    if( typeof value === 'undefined' ){
	                        
	                        //get first
	                        if ( hooks && "get" in hooks && notxml && (ret = hooks.get( item, name )) !== null ) {
	                            //return ret;
	                            result = ret;
	                        } else {
	
	                            ret = item.getAttribute( name );
	
	                            // Non-existent attributes return null, we normalize to undefined
	                            //return ret === null ? undefined : ret;
	                            result = ret === null ? undefined : ret;
	                        };
	
	                    }else if( typeof value === 'function' ){
	
	                        isSet = true;
	                        var ele = bd(item);
	                        ele.attr(name,value.call(item, index, ele.attr(name)));
	                    
	                    }else{
	                        
	                        //set all
	                        isSet = true;
	                        var attrFn = {
	                            val: true,
	                            css: true,
	                            html: true,
	                            text: true,
	                            //data: true,
	                            width: true,
	                            height: true,
	                            offset: true
	                        };
	
	                        if ( name in attrFn ) {
	                            result = bd( item )[ name ]( value );
	                            return;
	                        };
	
	                        if ( value === null ) {
	                            bd(item).removeAttr( name );
	                            return;
	
	                        } else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( item, value, name )) !== undefined ) {
	                            return ret;
	
	                        } else {
	                            item.setAttribute( name, "" + value );
	                            return value;
	                        };
	                    };
	
	                break;
	                case 'object':
	
	                    //set all
	                    isSet = true;
	                    var ele = bd(item);
	                    for(key in name){
	                        ele.attr(key,name[key]);
	                    };
	
	                break;
	                default:
	                    result = me;
	                break;
	            };
	        });
	    
	        return isSet?this:result;
	    }
	});
	
	baidu.dom.extend({
	    before: function(){
	        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.before');
	        var parentNode = this[0] && this[0].parentNode,
	            array = !parentNode && [], set;
	        
	        baidu._util_.smartInsert(this, arguments, function(node){
	            parentNode ? parentNode.insertBefore(node, this)
	                : baidu.merge(array, node.childNodes);
	        });
	        if(array){
	            array = baidu.merge(array, this);
	            this.length = 0;
	            baidu.merge(this, array);
	        }
	        return this;
	    }
	});
	
	baidu.dom.extend({
		bind: function(type, data, fn){
			return this.on(type, undefined, data, fn);
		}
	});
	
	baidu.dom.match = function(){
	    var reg = /^[\w\#\-\$\.\*]+$/,
	
	        // 使用这个临时的 div 作为CSS选择器过滤
	        div = document.createElement("DIV");
	        div.id = "__tangram__";
	
	    return function( array, selector, context ){
	        var root, results = baidu.array();
	
	        switch ( baidu.type(selector) ) {
	            // 取两个 TangramDom 的交集
	            case "$DOM" :
	                for (var x=array.length-1; x>-1; x--) {
	                    for (var y=selector.length-1; y>-1; y--) {
	                        array[x] === selector[y] && results.push(array[x]);
	                    }
	                }
	                break;
	
	            // 使用过滤器函数，函数返回值是 Array
	            case "function" :
	                baidu.forEach(array, function(item, index){
	                    selector.call(item, index) && results.push(item);
	                });
	                break;
	            
	            case "HTMLElement" :
	                baidu.forEach(array, function(item){
	                    item == selector && results.push(item);
	                });
	                break;
	
	            // CSS 选择器
	            case "string" :
	                var da = baidu.query(selector, context || document);
	                baidu.forEach(array, function(item){
	                    if ( root = getRoot(item) ) {
	                        var t = root.nodeType == 1
	                            // in DocumentFragment
	                            ? baidu.query(selector, root)
	                            : da;
	
	                        for (var i=0, n=t.length; i<n; i++) {
	                            if (t[i] === item) {
	                                results.push(item);
	                                break;
	                            }
	                        }
	                    }
	                });
	                results = results.unique();
	                break;
	
	            default :
	                results = baidu.array( array ).unique();
	                break;
	        }
	        return results;
	
	    };
	
	    function getRoot(dom) {
	        var result = [], i;
	
	        while(dom = dom.parentNode) {
	            dom.nodeType && result.push(dom);
	        }
	
	        for (var i=result.length - 1; i>-1; i--) {
	            // 1. in DocumentFragment
	            // 9. Document
	            if (result[i].nodeType == 1 || result[i].nodeType == 9) {
	                return result[i];
	            }
	        }
	        return null;
	    }
	}();
	
	baidu.dom.extend({
	    children : function (selector) {
	        var result, a = [];
	
	        this.each(function(index){
	            baidu.forEach(this.children || this.childNodes, function(dom){
	                dom.nodeType == 1 && a.push(dom);
	            });
	        });
	
	        return baidu.dom( baidu.dom.match(a, selector) );
	    }
	});
	
	/// Tangram 1.x Code Start
	
	baidu.dom.children = function(dom) {
	    baidu.check("string|HTMLElement","baidu.dom.children");
	    return baidu.dom( baidu.isString(dom) ? "#"+ dom : dom ).children().toArray();
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    closest : function (selector, context) {
	        var results = baidu.array();
	
	        baidu.forEach ( this, function(dom) {
	            var t = [dom];
	            while ( dom = dom.parentNode ) {
	                dom.nodeType && t.push( dom );
	            }
	            t = baidu.dom.match( t, selector, context );
	
	            t.length && results.push(t[0]);
	        });
	        
	        return baidu.dom( results.unique() );
	    }
	});
	
	baidu.dom.extend({
	    contents: function(){
	        var ret = [], nodeName;
	        for(var i = 0, ele; ele = this[i]; i++){
	            nodeName = ele.nodeName;
	            ret.push.apply(ret, baidu.makeArray(nodeName && nodeName.toLowerCase() === 'iframe' ?
	                ele.contentDocument || ele.contentWindow.document
	                    : ele.childNodes));
	        }
	        this.length = 0;
	        return baidu.merge(this, ret);
	    }
	});
	/// Tangram 1.x Code Start
	
	 
	
	 
	baidu.dom.extend({
	    setAttr : function (key, value) {
	        var element = this[0];
	        if ('style' == key){
	            element.style.cssText = value;
	        } else {
	            key = baidu.dom._NAME_ATTRS[key] || key;
	            element.setAttribute(key, value);
	        }
	    
	        return element;
	    }
	});
	
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.create = function(tagName, opt_attributes) {
	    var el = document.createElement(tagName),
	        attributes = opt_attributes || {};
	    for(var i in attributes){
	        baidu.dom.setAttr(el, i, attributes[i]);
	    }
	    return el;
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.lang.Class = function() {
	    this.guid = baidu.id( this );
	};
	
	baidu.lang.Class.prototype.dispose = function(){
	    baidu.id( this.guid, "delete" );
	
	    // this.__listeners && (for (var i in this.__listeners) delete this.__listeners[i]);
	
	    for(var property in this){
	        typeof this[property] != "function" && delete this[property];
	    }
	    this.disposed = true;   // 20100716
	};
	
	baidu.lang.Class.prototype.toString = function(){
	    return "[object " + (this._type_ || this.__type || this._className || "Object") + "]";
	};
	
	 window["baiduInstance"] = function(guid) {
	     return baidu.id( guid );
	 }
	
	//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
	//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性
	//  2011.11.22  meizz   废除 baidu.lang._instances 模块，由统一的global机制完成；
	
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	 
	
	baidu.lang.Class.prototype.un =
	baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
	    var i,
	        t = this.__listeners;
	    if (!t) return;
	
	    // remove all event listener
	    if (typeof type == "undefined") {
	        for (i in t) {
	            delete t[i];
	        }
	        return;
	    }
	
	    type.indexOf("on") && (type = "on" + type);
	
	    // 移除某类事件监听
	    if (typeof handler == "undefined") {
	        delete t[type];
	    } else if (t[type]) {
	        // [TODO delete 2013] 支持按 key 删除注册的函数
	        typeof handler=="string" && (handler=t[type][handler]) && delete t[type][handler];
	
	        for (i = t[type].length - 1; i >= 0; i--) {
	            if (t[type][i] === handler) {
	                t[type].splice(i, 1);
	            }
	        }
	    }
	};
	
	// 2011.12.19 meizz 为兼容老版本的按 key 删除，添加了一行代码
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.lang.guid = function() {
	    return baidu.id();
	};
	
	//不直接使用window，可以提高3倍左右性能
	//baidu.$$._counter = baidu.$$._counter || 1;
	
	// 20111129	meizz	去除 _counter.toString(36) 这步运算，节约计算量
	/// support magic - Tangram 1.x Code End
	
	//baidu.lang.isString = function (source) {
	//    return '[object String]' == Object.prototype.toString.call(source);
	//};
	baidu.lang.isString = baidu.isString;
	/// support magic - Tangram 1.x Code Start
	
	baidu.lang.Event = function (type, target) {
	    this.type = type;
	    this.returnValue = true;
	    this.target = target || null;
	    this.currentTarget = null;
	};
	 
	
	baidu.lang.Class.prototype.fire =
	baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
	    baidu.lang.isString(event) && (event = new baidu.lang.Event(event));
	
	    !this.__listeners && (this.__listeners = {});
	
	    // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
	    options = options || {};
	    for (var i in options) {
	        event[i] = options[i];
	    }
	
	    var i, n, me = this, t = me.__listeners, p = event.type;
	    event.target = event.target || (event.currentTarget = me);
	
	    // 支持非 on 开头的事件名
	    p.indexOf("on") && (p = "on" + p);
	
	    typeof me[p] == "function" && me[p].apply(me, arguments);
	
	    if (typeof t[p] == "object") {
	        for (i=0, n=t[p].length; i<n; i++) {
	            t[p][i] && t[p][i].apply(me, arguments);
	        }
	    }
	    return event.returnValue;
	};
	
	baidu.lang.Class.prototype.on =
	baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
	    if (typeof handler != "function") {
	        return;
	    }
	
	    !this.__listeners && (this.__listeners = {});
	
	    var i, t = this.__listeners;
	
	    type.indexOf("on") && (type = "on" + type);
	
	    typeof t[type] != "object" && (t[type] = []);
	
	    // 避免函数重复注册
	    for (i = t[type].length - 1; i >= 0; i--) {
	        if (t[type][i] === handler) return handler;
	    };
	
	    t[type].push(handler);
	
	    // [TODO delete 2013] 2011.12.19 兼容老版本，2013删除此行
	    key && typeof key == "string" && (t[type][key] = handler);
	
	    return handler;
	};
	
	//  2011.12.19  meizz   很悲剧，第三个参数 key 还需要支持一段时间，以兼容老版本脚本
	//  2011.11.24  meizz   事件添加监听方法 addEventListener 移除第三个参数 key，添加返回值 handler
	//  2011.11.23  meizz   事件handler的存储对象由json改成array，以保证注册函数的执行顺序
	//  2011.11.22  meizz   将 removeEventListener 方法分拆到 baidu.lang.Class.removeEventListener 中，以节约主程序代码
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.createSingle = function (json) {
	    var c = new baidu.lang.Class();
	
	    for (var key in json) {
	        c[key] = json[key];
	    }
	    return c;
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	//为兼容Tangram1.x的magic增加的接口
	
	baidu.dom.ddManager = baidu.lang.createSingle({
		_targetsDroppingOver:{}
	});
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
		delegate: function( selector, type, data, fn ){
	        if( typeof data == "function" )
	            fn = data,
	            data = null;
	    	return this.on( type, selector, data, fn );
		}
	});
	
	baidu.dom.extend({
	    filter : function (selector) {
	        return baidu.dom(baidu.dom.match(this, selector));
	    }
	});
	
	 
	
	baidu.dom.extend({
	    remove: function(selector, keepData){
	        arguments.length > 0
	            && baidu.check('^string(?:,boolean)?$', 'baidu.dom.remove');
	        var array = selector ? this.filter(selector) : this;
	        for(var i = 0, ele; ele = array[i]; i++){
	           if(!keepData && ele.nodeType === 1){
	               baidu._util_.cleanData(ele.getElementsByTagName('*'));
	               baidu._util_.cleanData([ele]);
	            }
	            ele.parentNode && ele.parentNode.removeChild(ele);
	        }
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    detach: function(selector){
	        selector && baidu.check('^string$', 'baidu.dom.detach');
	        return this.remove(selector, true);
	    }
	});
	/// support magic - Tangram 1.x Code Start
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.page = baidu.page || {};
	
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.page.getScrollTop = function () {
	    var d = document;
	    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
	};
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.page.getScrollLeft = function () {
	    var d = document;
	    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
	};
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	(function(){
	
	 baidu.page.getMousePosition = function(){
		 return {
			x : baidu.page.getScrollLeft() + xy.x,
			y : baidu.page.getScrollTop() + xy.y
		 };
	 };
	
	 var xy = {x:0, y:0};
	
	 // 监听当前网页的 mousemove 事件以获得鼠标的实时坐标
	 baidu.event.on(document, "onmousemove", function(e){
	    e = window.event || e;
	    xy.x = e.clientX;
	    xy.y = e.clientY;
	 });
	
	})();
	/// support magic - Tangram 1.x Code End
	
	baidu.dom.extend({
	    off: function( events, selector, fn ){
	        var eb = baidu._util_.eventBase.core, me = this;
	        if( !events )
	            baidu.forEach( this, function( item ){
	                eb.remove( item );
	            } );
	        else if( typeof events == "string" ){
	            if( typeof selector == "function" )
	                fn = selector,
	                selector = null;
	            events = events.split(/[ ,]/);
	            baidu.forEach( this, function( item ){
	                baidu.forEach( events, function( event ){
	                    eb.remove( item, event, fn, selector );
	                });
	            });
	        }else if( typeof events == "object" )
	            baidu.forEach( events, function(fn, event){
	                me.off( event, selector, fn );
	            } );
	
	        return this;
	    }
	});
	
	/// support - magic Tangram 1.x Code Start
	baidu.event.un = baidu.un = function(element, evtName, handler){
	    element = baidu.dom.g(element);
	    baidu.dom(element).off(evtName.replace(/^\s*on/, ''), handler);
	    return element;
	 };
	 /// support - magic Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.event.preventDefault = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    if (event.preventDefault) {
	        event.preventDefault();
	    } else {
	        event.returnValue = false;
	    }
	};
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	(function(){
	    var dragging = false,
	        target, // 被拖曳的DOM元素
	        op, ox, oy, timer, left, top, lastLeft, lastTop, mozUserSelect;
	    baidu.dom.drag = function(element, options){
	        if(!(target = baidu.dom.g(element))){return false;}
	        op = baidu.object.extend({
	            autoStop: true, // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
	            capture: true,  // 鼠标拖曳粘滞
	            interval: 16    // 拖曳行为的触发频度（时间：毫秒）
	        }, options);
	        lastLeft = left = parseInt(baidu.dom.getStyle(target, 'left')) || 0;
	        lastTop = top = parseInt(baidu.dom.getStyle(target, 'top')) || 0;
	        dragging = true;
	        setTimeout(function(){
	            var mouse = baidu.page.getMousePosition();  // 得到当前鼠标坐标值
	            ox = op.mouseEvent ? (baidu.page.getScrollLeft() + op.mouseEvent.clientX) : mouse.x;
	            oy = op.mouseEvent ? (baidu.page.getScrollTop() + op.mouseEvent.clientY) : mouse.y;
	            clearInterval(timer);
	            timer = setInterval(render, op.interval);
	        }, 1);
	        // 这项为 true，缺省在 onmouseup 事件终止拖曳
	        var tangramDom = baidu.dom(document);
	        op.autoStop && tangramDom.on('mouseup', stop);
	        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
	        tangramDom.on('selectstart', unselect);
	        // 设置鼠标粘滞
	        if (op.capture && target.setCapture) {
	            target.setCapture();
	        } else if (op.capture && window.captureEvents) {
	            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
	        }
	        // fixed for firefox
	        mozUserSelect = document.body.style.MozUserSelect;
	        document.body.style.MozUserSelect = 'none';
	        baidu.isFunction(op.ondragstart)
	            && op.ondragstart(target, op);
	        return {
	            stop: stop, dispose: stop,
	            update: function(options){
	                baidu.object.extend(op, options);
	            }
	        }
	    }
	    // 停止拖曳
	    function stop() {
	        dragging = false;
	        clearInterval(timer);
	        // 解除鼠标粘滞
	        if (op.capture && target.releaseCapture) {
	            target.releaseCapture();
	        } else if (op.capture && window.captureEvents) {
	            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
	        }
	        // 拖曳时网页内容被框选
	        document.body.style.MozUserSelect = mozUserSelect;
	        var tangramDom = baidu.dom(document);
	        tangramDom.off('selectstart', unselect);
	        op.autoStop && tangramDom.off('mouseup', stop);
	        // ondragend 事件
	        baidu.isFunction(op.ondragend)
	            && op.ondragend(target, op, {left: lastLeft, top: lastTop});
	    }
	    // 对DOM元素进行top/left赋新值以实现拖曳的效果
	    function render(e) {
	        if(!dragging){
	            clearInterval(timer);
	            return;
	        }
	        var rg = op.range || [],
	            mouse = baidu.page.getMousePosition(),
	            el = left + mouse.x - ox,
	            et = top  + mouse.y - oy;
	
	        // 如果用户限定了可拖动的范围
	        if (baidu.isObject(rg) && rg.length == 4) {
	            el = Math.max(rg[3], el);
	            el = Math.min(rg[1] - target.offsetWidth, el);
	            et = Math.max(rg[0], et);
	            et = Math.min(rg[2] - target.offsetHeight, et);
	        }
	        target.style.left = el + 'px';
	        target.style.top  = et + 'px';
	        lastLeft = el;
	        lastTop = et;
	        baidu.isFunction(op.ondrag)
	            && op.ondrag(target, op, {left: lastLeft, top: lastTop});
	    }
	    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
	    function unselect(e) {
	        return baidu.event.preventDefault(e, false);
	    }
	})();
	// [TODO] 20100625 添加cursorAt属性，absolute定位的定位的元素在不设置top|left值时，初始值有问题，得动态计算
	// [TODO] 20101101 在drag方法的返回对象中添加 dispose() 方法析构drag
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.dom.extend({
	    setStyle : function ( key, value) {
	        var dom = baidu.dom, 
	            fixer;
	        
	        // 放弃了对firefox 0.9的opacity的支持
	        element = this[0];
	        key = baidu.string.toCamelCase(key);
	    
	        if (fixer = dom._styleFilter) {
	            value = fixer.filter(key, value, 'set');
	        }
	    
	        fixer = dom._styleFixer[key];
	        (fixer && fixer.set) ? fixer.set(element, value, key) : (element.style[fixer || key] = value);
	    
	        return element;
	    }
	
	});
	
	/// Tangram 1.x Code End
	
	/// support maigc - Tangram 1.x Code Start
	/// support maigc - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	//为兼容Tangram1.x的magic增加的接口
	
	baidu.dom.draggable = function(element, options) {
	    options = baidu.object.extend({toggle: function() {return true}}, options);
	    options.autoStop = true;
	    element = baidu.dom.g(element);
	    options.handler = options.handler || element;
	    var manager,
	        events = ['ondragstart', 'ondrag', 'ondragend'],
	        i = events.length - 1,
	        eventName,
	        dragSingle,
	        draggableSingle = {
	            dispose: function() {
	                dragSingle && dragSingle.stop();
	                baidu.event.un(options.handler, 'onmousedown', handlerMouseDown);
	                baidu.lang.Class.prototype.dispose.call(draggableSingle);
	            }
	        },
	        me = this;
	    //如果存在ddManager, 将事件转发到ddManager中
	    if (manager = baidu.dom.ddManager) {
	        for (; i >= 0; i--) {
	            eventName = events[i];
	            options[eventName] = (function(eventName) {
	                var fn = options[eventName];
	                return function() {
	                    baidu.lang.isFunction(fn) && fn.apply(me, arguments);
	                    manager.dispatchEvent(eventName, {DOM: element});
	                }
	            })(eventName);
	        }
	    }
	
	    // 拖曳只针对有 position 定位的元素
	    if (element) {
	        function handlerMouseDown(e) {
	            var event = options.mouseEvent = window.event || e;
	            options.mouseEvent = {clientX: event.clientX, clientY: event.clientY};
	            if (event.button > 1 //只支持鼠标左键拖拽; 左键代码: IE为1,W3C为0
	                // 可以通过配置项里的这个开关函数暂停或启用拖曳功能
	                || (baidu.lang.isFunction(options.toggle) && !options.toggle())) {
	                return;
	            }
	//            if (baidu.dom.getStyle(element, 'position') == 'static') {
	//                baidu.dom.setStyle(element, 'position', 'relative');
	//            }
	            if (baidu.lang.isFunction(options.onbeforedragstart)) {
	                options.onbeforedragstart(element);
	            }
	            dragSingle = baidu.dom.drag(element, options);
	            draggableSingle.stop = dragSingle.stop;
	            draggableSingle.update = dragSingle.update;
	            //防止ff下出现禁止拖拽的图标
	            baidu.event.preventDefault(event);
	        }
	
	        // 对拖曳的扳机元素监听 onmousedown 事件，以便进行拖曳行为
	        baidu.event.on(options.handler, 'onmousedown', handlerMouseDown);
	    }
	    return {
	        cancel: function() {
	            draggableSingle.dispose();
	        }
	    };
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.getPosition = function (element) {
	    element = baidu.dom.g(element);
	    var doc = baidu.dom.getDocument(element), 
	        browser = baidu.browser,
	        getStyle = baidu.dom.getStyle,
	    // Gecko 1.9版本以下用getBoxObjectFor计算位置
	    // 但是某些情况下是有bug的
	    // 对于这些有bug的情况
	    // 使用递归查找的方式
	        BUGGY_GECKO_BOX_OBJECT = browser.isGecko > 0 && 
	                                 doc.getBoxObjectFor &&
	                                 getStyle(element, 'position') == 'absolute' &&
	                                 (element.style.top === '' || element.style.left === ''),
	        pos = {"left":0,"top":0},
	        viewport = (browser.ie && !browser.isStrict) ? doc.body : doc.documentElement,
	        parent,
	        box;
	    
	    if(element == viewport){
	        return pos;
	    }
	
	    if(element.getBoundingClientRect){ // IE and Gecko 1.9+
	        
	    	//当HTML或者BODY有border width时, 原生的getBoundingClientRect返回值是不符合预期的
	    	//考虑到通常情况下 HTML和BODY的border只会设成0px,所以忽略该问题.
	        box = element.getBoundingClientRect();
	
	        pos.left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
	        pos.top  = Math.floor(box.top)  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop);
		    
	        // IE会给HTML元素添加一个border，默认是medium（2px）
	        // 但是在IE 6 7 的怪异模式下，可以被html { border: 0; } 这条css规则覆盖
	        // 在IE7的标准模式下，border永远是2px，这个值通过clientLeft 和 clientTop取得
	        // 但是。。。在IE 6 7的怪异模式，如果用户使用css覆盖了默认的medium
	        // clientTop和clientLeft不会更新
	        pos.left -= doc.documentElement.clientLeft;
	        pos.top  -= doc.documentElement.clientTop;
	        
	        var htmlDom = doc.body,
	            // 在这里，不使用element.style.borderLeftWidth，只有computedStyle是可信的
	            htmlBorderLeftWidth = parseInt(getStyle(htmlDom, 'borderLeftWidth')),
	            htmlBorderTopWidth = parseInt(getStyle(htmlDom, 'borderTopWidth'));
	        if(browser.ie && !browser.isStrict){
	            pos.left -= isNaN(htmlBorderLeftWidth) ? 2 : htmlBorderLeftWidth;
	            pos.top  -= isNaN(htmlBorderTopWidth) ? 2 : htmlBorderTopWidth;
	        }
	    
	    } else { // safari/opera/firefox
	        parent = element;
	
	        do {
	            pos.left += parent.offsetLeft;
	            pos.top  += parent.offsetTop;
	      
	            // safari里面，如果遍历到了一个fixed的元素，后面的offset都不准了
	            if (browser.isWebkit > 0 && getStyle(parent, 'position') == 'fixed') {
	                pos.left += doc.body.scrollLeft;
	                pos.top  += doc.body.scrollTop;
	                break;
	            }
	            
	            parent = parent.offsetParent;
	        } while (parent && parent != element);
	
	        // 对body offsetTop的修正
	        if(browser.opera > 0 || (browser.isWebkit > 0 && getStyle(element, 'position') == 'absolute')){
	            pos.top  -= doc.body.offsetTop;
	        }
	
	        // 计算除了body的scroll
	        parent = element.offsetParent;
	        while (parent && parent != doc.body) {
	            pos.left -= parent.scrollLeft;
	            // see https://bugs.opera.com/show_bug.cgi?id=249965
	//            if (!b.opera || parent.tagName != 'TR') {
	            if (!browser.opera || parent.tagName != 'TR') {
	                pos.top -= parent.scrollTop;
	            }
	            parent = parent.offsetParent;
	        }
	    }
	
	    return pos;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.intersect = function (element1, element2) {
	    var g = baidu.dom.g, 
	        getPosition = baidu.dom.getPosition, 
	        max = Math.max, 
	        min = Math.min;
	
	    element1 = g(element1);
	    element2 = g(element2);
	
	    var pos1 = getPosition(element1),
	        pos2 = getPosition(element2);
	
	    return max(pos1.left, pos2.left) <= min(pos1.left + element1.offsetWidth, pos2.left + element2.offsetWidth)
	        && max(pos1.top, pos2.top) <= min(pos1.top + element1.offsetHeight, pos2.top + element2.offsetHeight);
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	//为兼容Tangram1.x的magic增加的接口
	
	//TODO: 添加对 accept, hoverclass 等参数的支持.
	
	baidu.dom.droppable = function(element, options){
		options = options || {};
		var manager = baidu.dom.ddManager,
			target = baidu.dom.g(element),
		    guid = baidu.lang.guid(),
			//拖拽进行时判断
			_dragging = function(event){
				var _targetsDroppingOver = manager._targetsDroppingOver,
				    eventData = {trigger:event.DOM,reciever: target};
				//判断被拖拽元素和容器是否相撞
				if(baidu.dom.intersect(target, event.DOM)){
					//进入容器区域
					if(! _targetsDroppingOver[guid]){
						//初次进入
						(typeof options.ondropover == 'function') && options.ondropover.call(target,eventData);
						manager.dispatchEvent("ondropover", eventData);
						_targetsDroppingOver[guid] = true;
					}
				} else {
					//出了容器区域
					if(_targetsDroppingOver[guid]){
						(typeof options.ondropout == 'function') && options.ondropout.call(target,eventData);
						manager.dispatchEvent("ondropout", eventData);
					}
					delete _targetsDroppingOver[guid];
				}
			},
			//拖拽结束时判断
			_dragend = function(event){
				var eventData = {trigger:event.DOM,reciever: target};
				if(baidu.dom.intersect(target, event.DOM)){
					typeof options.ondrop == 'function' && options.ondrop.call(target, eventData);
					manager.dispatchEvent("ondrop", eventData);
				}
				delete manager._targetsDroppingOver[guid];
			};
		//事件注册,return object提供事件解除
		manager.addEventListener("ondrag", _dragging);
		manager.addEventListener("ondragend", _dragend);
		return {
			cancel : function(){
				manager.removeEventListener("ondrag", _dragging);
				manager.removeEventListener("ondragend",_dragend);
			}
		};
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    eq : function (index) {
	        baidu.check("number","baidu.dom.eq");
	        return baidu.dom(this.get(index));
	    }
	});
	
	baidu.dom.extend({
	    find : function (selector) {
	        var a=[],
	            expr,
	            id = "__tangram__find__",
	            td = baidu.dom();
	
	        switch (baidu.type(selector)) {
	        case "string" :
	            this.each(function(){baidu.merge(td, baidu.query(selector, this));});
	            break;
	        case "HTMLElement" :
	            expr = selector.tagName +"#"+ (selector.id ? selector.id : (selector.id = id));
	            this.each(function(){if(baidu.query(expr, this).length > 0) a.push(selector);});
	            selector.id == id && (selector.id = "");
	            if (a.length > 0) baidu.merge(td, a);
	            break;
	        case "$DOM" :
	            a = selector.get();
	            this.each(function(){
	                baidu.forEach(baidu.query("*", this), function(dom){
	                    for (var i=0, n=a.length; i<n; i++) {
	                        dom === a[i] && (td[td.length ++] = a[i]);
	                    }
	                });
	            });
	            break;        
	        }
	        return td;
	    }
	});
	
	baidu.dom.extend({
	    first : function () {
	        return baidu.dom(this[0]);
	    }
	});
	
	baidu.dom.first = function(e) {
	    baidu.isString(e) && (e = "#"+ e);
	
	    return baidu.dom(e).children()[0];
	};
	/// Tangram 1.x Code Start
	
	baidu.dom.getAncestorBy = function (element, method) {
	    element = baidu.dom.g(element);
	
	    while ((element = element.parentNode) && element.nodeType == 1) {
	        if (method(element)) {
	            return element;
	        }
	    }
	
	    return null;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.getAncestorByClass = function (element, className) {
	    element = baidu.dom.g(element);
	    className = new RegExp("(^|\\s)" + baidu.string.trim(className) + "(\\s|\x24)");
	
	    while ((element = element.parentNode) && element.nodeType == 1) {
	        if (className.test(element.className)) {
	            return element;
	        }
	    }
	
	    return null;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.getAncestorByTag = function (element, tagName) {
	    element = baidu.dom.g(element);
	    tagName = tagName.toUpperCase();
	
	    while ((element = element.parentNode) && element.nodeType == 1) {
	        if (element.tagName == tagName) {
	            return element;
	        }
	    }
	
	    return null;
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	 
	
	baidu.dom.extend({
	    getAttr: function (key) {
	        element = this[0];
	        if ('style' == key){
	            return element.style.cssText;
	        };
	        key = baidu.dom._NAME_ATTRS[key] || key;
	        return element.getAttribute(key);
	    }
	});
	
	/// support magic - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.getParent = function (element) {
	    element = baidu.dom._g(element);
	    //parentElement在IE下准确，parentNode在ie下可能不准确
	    return element.parentElement || element.parentNode || null;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.extend({
	    getText : function () {
	        var ret = "", childs, i=0, l;
	        element = this[0];
	        //  text 和 CDATA 节点，取nodeValue
	        if ( element.nodeType === 3 || element.nodeType === 4 ) {
	            ret += element.nodeValue;
	        } else if ( element.nodeType !== 8 ) {// 8 是 comment Node
	            childs = element.childNodes;
	            for(l = childs.length; i < l; i++){
	                ret += baidu.dom.getText(childs[i]);
	            }
	        }
	        return ret;
	    }
	}); 
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    has: function (selector) {
	        var a = []
	            ,td = baidu.dom(document.body);
	
	        baidu.forEach(this, function(dom){
	            td[0] = dom;
	            td.find(selector).length && a.push(dom);
	        });
	
	        return baidu.dom(a);
	    }
	});
	
	/// Tangram 1.x Code Start
	
	baidu.dom.extend({
	    hasAttr : function (name){
	        element = this[0];
	        var attr = element.attributes.getNamedItem(name);
	        return !!( attr && attr.specified );
	    }
	});
	/// Tangram 1.x Code End
	
	 
	
	baidu.dom.extend({
	    hasClass: function(value){
	        //异常处理
	        if(arguments.length <= 0 || typeof value === 'function'){
	            return this;
	        };
	        
	        if(this.size()<=0){
	            return false;
	        };
	
	        //对输入进行处理
	        value = value.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+/g,' ');
	        var arr = value.split(' ');
	        var result;
	        baidu.forEach(this, function(item){
	            var str = item.className;
	            for(var i = 0;i<arr.length;i++){
	                if((' '+str+' ').indexOf(' '+arr[i]+' ') == -1){
	                    //有一个不含有
	                    result = false;
	                    return;
	                };
	            };
	            if(result!==false){
	                result = true;
	                return;
	            };
	        });
	        return result;
	    }
	});
	
	baidu.dom.extend({
	    hide: function() {
	        baidu._util_.showHide( this );
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    innerHeight: function(){
	    	if(this.size()<=0){
	    		return 0;
	    	}
	        var ele = this[0],
	            type = ele != null && ele === ele.window ? 'window'
	                : (ele.nodeType === 9 ? 'document' : false);
	        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'height')
	            : baidu._util_.getWidthOrHeight(ele, 'height', 'padding');
	    }
	});
	
	baidu.dom.extend({
	    innerWidth: function(){
	    	if(this.size()<=0){return 0;}
	        var ele = this[0],
	            type = ele != null && ele === ele.window ? 'window'
	                : (ele.nodeType === 9 ? 'document' : false);
	        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'width')
	            : baidu._util_.getWidthOrHeight(ele, 'width', 'padding');
	    }
	});
	
	baidu.dom.extend({
	    insertAfter: function(target){
	        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.insertAfter');
	        baidu._util_.smartInsertTo(this, target, function(node){
	            this.parentNode.insertBefore(node, this.nextSibling);
	        }, 'after');
	        return this;
	    }
	});
	
	/// Tangram 1.x Code Start
	
	baidu.dom.insertAfter = function(newElement, existElement){
	    var get = baidu.dom._g;
	    return baidu.dom(get(newElement)).insertAfter(get(existElement))[0];
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    insertBefore: function(target){
	        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.insertBefore');
	        baidu._util_.smartInsertTo(this, target, function(node){
	            this.parentNode.insertBefore(node, this);
	        }, 'before');
	        return this;
	    }
	});
	
	/// Tangram 1.x Code Start
	
	baidu.dom.insertBefore = function(newElement, existElement){
	    var get = baidu.dom._g;
	    return baidu.dom(get(newElement)).insertBefore(get(existElement))[0];
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    insertHTML: function ( position, html) {
	        element = this[0];
	        var range,begin;
	    
	        //在opera中insertAdjacentHTML方法实现不标准，如果DOMNodeInserted方法被监听则无法一次插入多element
	        //by lixiaopeng @ 2011-8-19
	        if (element.insertAdjacentHTML && !baidu.browser.opera) {
	            element.insertAdjacentHTML(position, html);
	        } else {
	            // 这里不做"undefined" != typeof(HTMLElement) && !window.opera判断，其它浏览器将出错？！
	            // 但是其实做了判断，其它浏览器下等于这个函数就不能执行了
	            range = element.ownerDocument.createRange();
	            // FF下range的位置设置错误可能导致创建出来的fragment在插入dom树之后html结构乱掉
	            // 改用range.insertNode来插入html, by wenyuxiang @ 2010-12-14.
	            position = position.toUpperCase();
	            if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
	                range.selectNodeContents(element);
	                range.collapse(position == 'AFTERBEGIN');
	            } else {
	                begin = position == 'BEFOREBEGIN';
	                range[begin ? 'setStartBefore' : 'setEndAfter'](element);
	                range.collapse(begin);
	            }
	            range.insertNode(range.createContextualFragment(html));
	        }
	        return element;
	    }
	});
	
	baidu.dom.extend({
	    is : function (selector) {
	        return baidu.dom.match(this, selector).length > 0;
	    }
	});
	
	baidu.dom.extend({
	    last : function () {
	        return baidu.dom(this.get(-1));
	    }
	});
	/// Tangram 1.x Code Start
	baidu.dom.last = function(element) {
	    element = baidu.dom.g(element);
	
	    for (var node = element.lastChild; node; node = node.previousSibling) {
	        if (node.nodeType == 1) {
	            return node;
	        }
	    }
	
	    return null;
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    next : function (filter) {
	        var td = baidu.dom();
	
	        baidu.forEach(this, function(dom){
	            while((dom = dom.nextSibling) && dom && dom.nodeType != 1);
	            dom && (td[td.length ++] = dom);
	        });
	
	        return filter ? td.filter(filter) : td;
	    }
	});
	
	baidu.dom.extend({
	    nextAll : function (selector) {
	        var array = [];
	
	        baidu.forEach(this, function(dom){
	            while(dom = dom.nextSibling) {
	                dom && (dom.nodeType == 1) && array.push(dom);
	            };
	        });
	
	        return baidu.dom( baidu.dom.match(array, selector) );
	    }
	});
	
	baidu.dom.extend({
	    nextUntil : function (selector, filter) {
	        var array = baidu.array();
	
	        baidu.forEach(this, function(dom){
	            var a = baidu.array();
	
	            while(dom = dom.nextSibling) {
	                dom && (dom.nodeType == 1) && a.push(dom);
	            };
	
	            if (selector && a.length) {
	                var b = baidu.dom.match(a, selector);
	                // 有符合 selector 的目标存在
	                if (b.length) {
	                    a = a.slice(0, a.indexOf(b[0]));
	                }
	            }
	            baidu.merge(array, a);
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.dom.extend({
	    not : function (selector) {
	        var i, j, n
	            ,all= this.get()
	            ,a  = baidu.isArray(selector) ? selector
	                : baidu.dom.match(this, selector);
	
	        for (i=all.length - 1; i>-1; i--) {
	            for (j=0, n=a.length; j<n; j++) {
	                a[j] === all[i] && all.splice(i, 1);
	            }
	        }
	
	        return baidu.dom(all);
	    }
	});
	
	baidu.dom.extend({
	    offsetParent: function(){
	        return this.map(function(){
	            var offsetParent = this.offsetParent || document.body,
	                exclude = /^(?:body|html)$/i;
	            while(offsetParent && baidu.dom(offsetParent).getCurrentStyle('position') === 'static'
	                && !exclude.test(offsetParent.nodeName)){
	                    offsetParent = offsetParent.offsetParent;
	            }
	            return offsetParent;
	        });
	    }
	});
	
	baidu.dom.extend({
	    one: function( types, selector, data, fn  ){
	        return this.on( types, selector, data, fn, 1 );
	    }
	});
	/// Tangram 1.x Code Start
	
	baidu.dom.opacity = function(element, opacity){
	    element = baidu.dom.g(element);
	
	    if (!baidu.browser.ie) {
	        element.style.opacity = opacity;
	        element.style.KHTMLOpacity = opacity;
	    } else {
	        element.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
	            Math.floor(opacity * 100) +")";
	    }
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    outerHeight: function(margin){
	    	if(this.size()<=0){return 0;}
	        var ele = this[0],
	            type = ele != null && ele === ele.window ? 'window'
	                : (ele.nodeType === 9 ? 'document' : false);
	        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'height')
	            : baidu._util_.getWidthOrHeight(ele, 'height', 'padding|border' + (margin ? '|margin' : ''));
	    }
	});
	
	baidu.dom.extend({
	    outerWidth: function(margin){
	    	if(this.size()<=0){return 0;} 	
	        var ele = this[0],
	            type = ele != null && ele === ele.window ? 'window'
	                : (ele.nodeType === 9 ? 'document' : false);
	        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'width')
	            : baidu._util_.getWidthOrHeight(ele, 'width', 'padding|border' + (margin ? '|margin' : ''));
	    }
	});
	
	baidu.dom.extend({
	    parent : function (filter) {
	        var array = [];
	
	        baidu.forEach(this, function(dom) {
	            (dom = dom.parentNode) && dom.nodeType == 1 && array.push(dom);
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.dom.extend({
	    parents : function (filter) {
	        var array = [];
	
	        baidu.forEach(this, function(dom) {
	            var a = [];
	
	            while ((dom = dom.parentNode) && dom.nodeType == 1) a.push(dom);
	
	            baidu.merge(array, a);
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.dom.extend({
	    parentsUntil : function (selector, filter) {
	        baidu.check("(string|HTMLElement)(,.+)?","baidu.dom.parentsUntil");
	        var array = [];
	
	        baidu.forEach(this, function(dom){
	            var a = baidu.array();
	
	            while ((dom = dom.parentNode) && dom.nodeType == 1) a.push(dom);
	
	            if (selector && a.length) {
	                var b = baidu.dom.match(a, selector);
	                // 有符合 selector 的目标存在
	                if (b.length) {
	                    a = a.slice(0, a.indexOf(b[0]));
	                }
	            }
	            baidu.merge(array, a);
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.dom.extend({
	    position: function(){
	        if(this.size()<=0){return 0;}        
	        var patrn = /^(?:body|html)$/i,
	            coordinate = this.offset(),
	            offsetParent = this.offsetParent(),
	            parentCoor = patrn.test(offsetParent[0].nodeName) ? {left: 0, top: 0}
	                : offsetParent.offset();
	        coordinate.left -= parseFloat(this.getCurrentStyle('marginLeft')) || 0;
	        coordinate.top -= parseFloat(this.getCurrentStyle('marginTop')) || 0;
	        parentCoor.left += parseFloat(offsetParent.getCurrentStyle('borderLeftWidth')) || 0;
	        parentCoor.top += parseFloat(offsetParent.getCurrentStyle('borderTopWidth')) || 0;
	        return {
	            left: coordinate.left - parentCoor.left,
	            top: coordinate.top - parentCoor.top
	        }
	    }
	});
	
	baidu.dom.extend({
	    prepend: function(){
	        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.prepend');
	        baidu._util_.smartInsert(this, arguments, function(child){
	            this.nodeType === 1 && this.insertBefore(child, this.firstChild);
	        });
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    prependTo: function(target){
	        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.prependTo');
	        baidu._util_.smartInsertTo(this, target, function(child){
	            this.insertBefore(child, this.firstChild);
	        });
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    prev : function (filter) {
	        var array = [];
	
	        baidu.forEach(this, function(dom) {
	            while (dom = dom.previousSibling) {
	                if (dom.nodeType == 1) {
	                    array.push(dom);
	                    break;
	                }
	            }
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.dom.extend({
	    prevAll : function (filter) {
	        var array = baidu.array();
	
	        baidu.forEach(this, function(dom) {
	            var a = [];
	            while (dom = dom.previousSibling) dom.nodeType == 1 && a.push(dom);
	
	            baidu.merge(array, a.reverse());
	        });
	
	        return baidu.dom(typeof filter == "string" ? baidu.dom.match(array, filter) : array.unique());
	    }
	});
	
	baidu.dom.extend({
	    prevUntil : function (selector, filter) {
	        baidu.check("(string|HTMLElement)(,.+)?", "baidu.dom.prevUntil");
	        var array = [];
	
	        baidu.forEach(this, function(dom) {
	            var a = baidu.array();
	
	            while(dom = dom.previousSibling) {
	                dom && (dom.nodeType == 1) && a.push(dom);
	            };
	
	            if (selector && a.length) {
	                var b = baidu.dom.match(a, selector);
	                // 有符合 selector 的目标存在
	                if (b.length) {
	                    a = a.slice(0, a.indexOf(b[0]));
	                }
	            }
	
	            baidu.merge(array, a);
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.string.extend({
	    escapeReg : function () {
	        return this.replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
	    }
	});
	
	/// Tangram 1.x Code Start
	
	baidu.dom.q = function (className, element, tagName) {
	    var result = [], 
	    trim = baidu.string.trim, 
	    len, i, elements, node;
	
	    if (!(className = trim(className))) {
	        return result;
	    }
	    
	    // 初始化element参数
	    if ('undefined' == typeof element) {
	        element = document;
	    } else {
	        element = baidu.dom.g(element);
	        if (!element) {
	            return result;
	        }
	    }
	    
	    // 初始化tagName参数
	    tagName && (tagName = trim(tagName).toUpperCase());
	    
	    // 查询元素
	    if (element.getElementsByClassName) {
	        elements = element.getElementsByClassName(className); 
	        len = elements.length;
	        for (i = 0; i < len; i++) {
	            node = elements[i];
	            if (tagName && node.tagName != tagName) {
	                continue;
	            }
	            result[result.length] = node;
	        }
	    } else {
	        className = new RegExp(
	                        "(^|\\s)" 
	                        + baidu.string.escapeReg(className)
	                        + "(\\s|\x24)");
	        elements = tagName 
	                    ? element.getElementsByTagName(tagName) 
	                    : (element.all || element.getElementsByTagName("*"));
	        len = elements.length;
	        for (i = 0; i < len; i++) {
	            node = elements[i];
	            className.test(node.className) && (result[result.length] = node);
	        }
	    }
	
	    return result;
	};
	
	/// Tangram 1.x Code End
	
	(function( window, undefined ) {
	
	 //在用户选择使用 Sizzle 时会被覆盖原有简化版本的baidu.query方法
	
	    baidu.query = function( selector, context, results ) {
	        return baidu.merge( results || [], baidu.sizzle(selector, context) );
	    };
	
	var document = window.document,
		docElem = document.documentElement,
	
		expando = "sizcache" + (Math.random() + '').replace('.', ''),
		done = 0,
	
		toString = Object.prototype.toString,
		strundefined = "undefined",
	
		hasDuplicate = false,
		baseHasDuplicate = true,
	
		// Regex
		rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
		chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	
		rbackslash = /\\/g,
		rnonWord = /\W/,
		rstartsWithWord = /^\w/,
		rnonDigit = /\D/,
		rnth = /(-?)(\d*)(?:n([+\-]?\d*))?/,
		radjacent = /^\+|\s*/g,
		rheader = /h\d/i,
		rinputs = /input|select|textarea|button/i,
		rtnfr = /[\t\n\f\r]/g,
	
		characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
		matchExpr = {
			ID: new RegExp("#(" + characterEncoding + "+)"),
			CLASS: new RegExp("\\.(" + characterEncoding + "+)"),
			NAME: new RegExp("\\[name=['\"]*(" + characterEncoding + "+)['\"]*\\]"),
			TAG: new RegExp("^(" + characterEncoding.replace( "[-", "[-\\*" ) + "+)"),
			ATTR: new RegExp("\\[\\s*(" + characterEncoding + "+)\\s*(?:(\\S?=)\\s*(?:(['\"])(.*?)\\3|(#?" + characterEncoding + "*)|)|)\\s*\\]"),
			PSEUDO: new RegExp(":(" + characterEncoding + "+)(?:\\((['\"]?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\2\\))?"),
			CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
		},
	
		origPOS = matchExpr.POS,
	
		leftMatchExpr = (function() {
			var type,
				// Increments parenthetical references
				// for leftMatch creation
				fescape = function( all, num ) {
					return "\\" + ( num - 0 + 1 );
				},
				leftMatch = {};
	
			for ( type in matchExpr ) {
				// Modify the regexes ensuring the matches do not end in brackets/parens
				matchExpr[ type ] = new RegExp( matchExpr[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
				// Adds a capture group for characters left of the match
				leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + matchExpr[ type ].source.replace( /\\(\d+)/g, fescape ) );
			}
	
			// Expose origPOS
			// "global" as in regardless of relation to brackets/parens
			matchExpr.globalPOS = origPOS;
	
			return leftMatch;
		})(),
	
		// Used for testing something on an element
		assert = function( fn ) {
			var pass = false,
				div = document.createElement("div");
			try {
				pass = fn( div );
			} catch (e) {}
			// release memory in IE
			div = null;
			return pass;
		},
	
		// Check to see if the browser returns elements by name when
		// querying by getElementById (and provide a workaround)
		assertGetIdNotName = assert(function( div ) {
			var pass = true,
				id = "script" + (new Date()).getTime();
			div.innerHTML = "<a name ='" + id + "'/>";
	
			// Inject it into the root element, check its status, and remove it quickly
			docElem.insertBefore( div, docElem.firstChild );
	
			if ( document.getElementById( id ) ) {
				pass = false;
			}
			docElem.removeChild( div );
			return pass;
		}),
	
		// Check to see if the browser returns only elements
		// when doing getElementsByTagName("*")
		assertTagNameNoComments = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return div.getElementsByTagName("*").length === 0;
		}),
	
		// Check to see if an attribute returns normalized href attributes
		assertHrefNotNormalized = assert(function( div ) {
			div.innerHTML = "<a href='#'></a>";
			return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
				div.firstChild.getAttribute("href") === "#";
		}),
	
		// Determines a buggy getElementsByClassName
		assertUsableClassName = assert(function( div ) {
			// Opera can't find a second classname (in 9.6)
			div.innerHTML = "<div class='test e'></div><div class='test'></div>";
			if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
				return false;
			}
	
			// Safari caches class attributes, doesn't catch changes (in 3.2)
			div.lastChild.className = "e";
			return div.getElementsByClassName("e").length !== 1;
		});
	
	// Check if the JavaScript engine is using some sort of
	// optimization where it does not always call our comparision
	// function. If that is the case, discard the hasDuplicate value.
	//   Thus far that includes Google Chrome.
	[0, 0].sort(function() {
		baseHasDuplicate = false;
		return 0;
	});
	
	var Sizzle = function( selector, context, results ) {
		results = results || [];
		context = context || document;
		var match, elem, contextXML,
			nodeType = context.nodeType;
	
		if ( nodeType !== 1 && nodeType !== 9 ) {
			return [];
		}
	
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}
	
		contextXML = isXML( context );
	
		if ( !contextXML ) {
			if ( (match = rquickExpr.exec( selector )) ) {
				// Speed-up: Sizzle("#ID")
				if ( match[1] ) {
					if ( nodeType === 9 ) {
						elem = context.getElementById( match[1] );
						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE, Opera, and Webkit return items
							// by name instead of ID
							if ( elem.id === match[1] ) {
								return makeArray( [ elem ], results );
							}
						} else {
							return makeArray( [], results );
						}
					} else {
						// Context is not a document
						if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( match[1] )) &&
							contains( context, elem ) && elem.id === match[1] ) {
							return makeArray( [ elem ], results );
						}
					}
	
				// Speed-up: Sizzle("TAG")
				} else if ( match[2] ) {
					// Speed-up: Sizzle("body")
					if ( selector === "body" && context.body ) {
						return makeArray( [ context.body ], results );
					}
					return makeArray( context.getElementsByTagName( selector ), results );
				// Speed-up: Sizzle(".CLASS")
				} else if ( assertUsableClassName && match[3] && context.getElementsByClassName ) {
					return makeArray( context.getElementsByClassName( match[3] ), results );
				}
			}
		}
	
		// All others
		return select( selector, context, results, undefined, contextXML );
	};
	
	var select = function( selector, context, results, seed, contextXML ) {
		var m, set, checkSet, extra, ret, cur, pop, i,
			origContext = context,
			prune = true,
			parts = [],
			soFar = selector;
	
		do {
			// Reset the position of the chunker regexp (start from head)
			chunker.exec( "" );
			m = chunker.exec( soFar );
	
			if ( m ) {
				soFar = m[3];
	
				parts.push( m[1] );
	
				if ( m[2] ) {
					extra = m[3];
					break;
				}
			}
		} while ( m );
	
		if ( parts.length > 1 && origPOS.exec( selector ) ) {
	
			if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
				set = posProcess( parts[0] + parts[1], context, seed, contextXML );
	
			} else {
				set = Expr.relative[ parts[0] ] ?
					[ context ] :
					Sizzle( parts.shift(), context );
	
				while ( parts.length ) {
					selector = parts.shift();
	
					if ( Expr.relative[ selector ] ) {
						selector += parts.shift();
					}
	
					set = posProcess( selector, set, seed, contextXML );
				}
			}
	
		} else {
			// Take a shortcut and set the context if the root selector is an ID
			// (but not if it'll be faster if the inner selector is an ID)
			if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					matchExpr.ID.test( parts[0] ) && !matchExpr.ID.test( parts[parts.length - 1] ) ) {
	
				ret = Sizzle.find( parts.shift(), context, contextXML );
				context = ret.expr ?
					Sizzle.filter( ret.expr, ret.set )[0] :
					ret.set[0];
			}
	
			if ( context ) {
				ret = seed ?
					{ expr: parts.pop(), set: makeArray( seed ) } :
					Sizzle.find( parts.pop(), (parts.length >= 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode) || context, contextXML );
	
				set = ret.expr ?
					Sizzle.filter( ret.expr, ret.set ) :
					ret.set;
	
				if ( parts.length > 0 ) {
					checkSet = makeArray( set );
	
				} else {
					prune = false;
				}
	
				while ( parts.length ) {
					cur = parts.pop();
					pop = cur;
	
					if ( !Expr.relative[ cur ] ) {
						cur = "";
					} else {
						pop = parts.pop();
					}
	
					if ( pop == null ) {
						pop = context;
					}
	
					Expr.relative[ cur ]( checkSet, pop, contextXML );
				}
	
			} else {
				checkSet = parts = [];
			}
		}
	
		if ( !checkSet ) {
			checkSet = set;
		}
	
		if ( !checkSet ) {
			Sizzle.error( cur || selector );
		}
	
		if ( toString.call(checkSet) === "[object Array]" ) {
			if ( !prune ) {
				results.push.apply( results, checkSet );
	
			} else if ( context && context.nodeType === 1 ) {
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains( context, checkSet[i] )) ) {
						results.push( set[i] );
					}
				}
	
			} else {
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
						results.push( set[i] );
					}
				}
			}
	
		} else {
			makeArray( checkSet, results );
		}
	
		if ( extra ) {
			select( extra, origContext, results, seed, contextXML );
			uniqueSort( results );
		}
	
		return results;
	};
	
	var isXML = Sizzle.isXML = baidu._util_.isXML;
	//var isXML = Sizzle.isXML = function( elem ) {
	//	// documentElement is verified for cases where it doesn't yet exist
	//	// (such as loading iframes in IE - #4833)
	//	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	//	return documentElement ? documentElement.nodeName !== "HTML" : false;
	//};
	
	// Slice is no longer used
	// It is not actually faster
	// Results is expected to be an array or undefined
	// typeof len is checked for if array is a form nodelist containing an element with name "length" (wow)
	//var makeArray = function( array, results ) {
	//	results = results || [];
	//	var i = 0,
	//		len = array.length;
	//	if ( typeof len === "number" ) {
	//		for ( ; i < len; i++ ) {
	//			results.push( array[i] );
	//		}
	//	} else {
	//		for ( ; array[i]; i++ ) {
	//			results.push( array[i] );
	//		}
	//	}
	//	return results;
	//};
	var makeArray = baidu.makeArray;
	
	var uniqueSort = Sizzle.uniqueSort = function( results ) {
		if ( sortOrder ) {
			hasDuplicate = baseHasDuplicate;
			results.sort( sortOrder );
	
			if ( hasDuplicate ) {
				for ( var i = 1; i < results.length; i++ ) {
					if ( results[i] === results[ i - 1 ] ) {
						results.splice( i--, 1 );
					}
				}
			}
		}
	
		return results;
	};
	
	// Element contains another
	//var contains = Sizzle.contains = docElem.compareDocumentPosition ?
	//	function( a, b ) {
	//		return !!(a.compareDocumentPosition( b ) & 16);
	//	} :
	//	docElem.contains ?
	//	function( a, b ) {
	//		return a !== b && ( a.contains ? a.contains( b ) : false );
	//	} :
	//	function( a, b ) {
	//		while ( (b = b.parentNode) ) {
	//			if ( b === a ) {
	//				return true;
	//			}
	//		}
	//		return false;
	//	};
	var contains = Sizzle.contains = baidu._util_.contains;
	
	Sizzle.matches = function( expr, set ) {
		return select( expr, document, [], set, isXML( document ) );
	};
	
	Sizzle.matchesSelector = function( node, expr ) {
		return select( expr, document, [], [ node ], isXML( document ) ).length > 0;
	};
	
	Sizzle.find = function( expr, context, contextXML ) {
		var set, i, len, match, type, left;
	
		if ( !expr ) {
			return [];
		}
	
		for ( i = 0, len = Expr.order.length; i < len; i++ ) {
			type = Expr.order[i];
	
			if ( (match = leftMatchExpr[ type ].exec( expr )) ) {
				left = match[1];
				match.splice( 1, 1 );
	
				if ( left.substr( left.length - 1 ) !== "\\" ) {
					match[1] = (match[1] || "").replace( rbackslash, "" );
					set = Expr.find[ type ]( match, context, contextXML );
	
					if ( set != null ) {
						expr = expr.replace( matchExpr[ type ], "" );
						break;
					}
				}
			}
		}
	
		if ( !set ) {
			set = typeof context.getElementsByTagName !== strundefined ?
				context.getElementsByTagName( "*" ) :
				[];
		}
	
		return { set: set, expr: expr };
	};
	
	Sizzle.filter = function( expr, set, inplace, not ) {
		var match, anyFound,
			type, found, item, filter, left,
			i, pass,
			old = expr,
			result = [],
			curLoop = set,
			isXMLFilter = set && set[0] && isXML( set[0] );
	
		while ( expr && set.length ) {
			for ( type in Expr.filter ) {
				if ( (match = leftMatchExpr[ type ].exec( expr )) != null && match[2] ) {
					filter = Expr.filter[ type ];
					left = match[1];
	
					anyFound = false;
	
					match.splice( 1, 1 );
	
					if ( left.substr( left.length - 1 ) === "\\" ) {
						continue;
					}
	
					if ( curLoop === result ) {
						result = [];
					}
	
					if ( Expr.preFilter[ type ] ) {
						match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
	
						if ( !match ) {
							anyFound = found = true;
	
						} else if ( match === true ) {
							continue;
						}
					}
	
					if ( match ) {
						for ( i = 0; (item = curLoop[i]) != null; i++ ) {
							if ( item ) {
								found = filter( item, match, i, curLoop );
								pass = not ^ found;
	
								if ( inplace && found != null ) {
									if ( pass ) {
										anyFound = true;
	
									} else {
										curLoop[i] = false;
									}
	
								} else if ( pass ) {
									result.push( item );
									anyFound = true;
								}
							}
						}
					}
	
					if ( found !== undefined ) {
						if ( !inplace ) {
							curLoop = result;
						}
	
						expr = expr.replace( matchExpr[ type ], "" );
	
						if ( !anyFound ) {
							return [];
						}
	
						break;
					}
				}
			}
	
			// Improper expression
			if ( expr === old ) {
				if ( anyFound == null ) {
					Sizzle.error( expr );
	
				} else {
					break;
				}
			}
	
			old = expr;
		}
	
		return curLoop;
	};
	
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	var getText = Sizzle.getText = function( elem ) {
		var i, node,
			nodeType = elem.nodeType,
			ret = "";
	
		if ( nodeType ) {
			if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
				// Use textContent for elements
				// innerText usage removed for consistency of new lines (see #11153)
				if ( typeof elem.textContent === "string" ) {
					return elem.textContent;
				} else {
					// Traverse it's children
					for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
						ret += getText( elem );
					}
				}
			} else if ( nodeType === 3 || nodeType === 4 ) {
				return elem.nodeValue;
			}
		} else {
	
			// If no nodeType, this is expected to be an array
			for ( i = 0; (node = elem[i]); i++ ) {
				// Do not traverse comment nodes
				if ( node.nodeType !== 8 ) {
					ret += getText( node );
				}
			}
		}
		return ret;
	};
	
	var Expr = Sizzle.selectors = {
	
		match: matchExpr,
		leftMatch: leftMatchExpr,
	
		order: [ "ID", "NAME", "TAG" ],
	
		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},
	
		attrHandle: {
			href: assertHrefNotNormalized ?
				function( elem ) {
					return elem.getAttribute( "href" );
				} :
				function( elem ) {
					return elem.getAttribute( "href", 2 );
				},
			type: function( elem ) {
				return elem.getAttribute( "type" );
			}
		},
	
		relative: {
			"+": function( checkSet, part ) {
				var isPartStr = typeof part === "string",
					isTag = isPartStr && !rnonWord.test( part ),
					isPartStrNotTag = isPartStr && !isTag;
	
				if ( isTag ) {
					part = part.toLowerCase();
				}
	
				for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
					if ( (elem = checkSet[i]) ) {
						while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
	
						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
							elem || false :
							elem === part;
					}
				}
	
				if ( isPartStrNotTag ) {
					Sizzle.filter( part, checkSet, true );
				}
			},
	
			">": function( checkSet, part ) {
				var elem,
					isPartStr = typeof part === "string",
					i = 0,
					l = checkSet.length;
	
				if ( isPartStr && !rnonWord.test( part ) ) {
					part = part.toLowerCase();
	
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}
	
				} else {
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							checkSet[i] = isPartStr ?
								elem.parentNode :
								elem.parentNode === part;
						}
					}
	
					if ( isPartStr ) {
						Sizzle.filter( part, checkSet, true );
					}
				}
			},
	
			"": function( checkSet, part, xml ) {
				dirCheck( "parentNode", checkSet, part, xml );
			},
	
			"~": function( checkSet, part, xml ) {
				dirCheck( "previousSibling", checkSet, part, xml );
			}
		},
	
		find: {
			ID: assertGetIdNotName ?
				function( match, context, xml ) {
					if ( typeof context.getElementById !== strundefined && !xml ) {
						var m = context.getElementById( match[1] );
						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						return m && m.parentNode ? [m] : [];
					}
				} :
				function( match, context, xml ) {
					if ( typeof context.getElementById !== strundefined && !xml ) {
						var m = context.getElementById( match[1] );
	
						return m ?
							m.id === match[1] || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").nodeValue === match[1] ?
								[m] :
								undefined :
							[];
					}
				},
	
			NAME: function( match, context ) {
				if ( typeof context.getElementsByName !== strundefined ) {
					var ret = [],
						results = context.getElementsByName( match[1] ),
						i = 0,
						len = results.length;
	
					for ( ; i < len; i++ ) {
						if ( results[i].getAttribute("name") === match[1] ) {
							ret.push( results[i] );
						}
					}
	
					return ret.length === 0 ? null : ret;
				}
			},
	
			TAG: assertTagNameNoComments ?
				function( match, context ) {
					if ( typeof context.getElementsByTagName !== strundefined ) {
						return context.getElementsByTagName( match[1] );
					}
				} :
				function( match, context ) {
					var results = context.getElementsByTagName( match[1] );
	
					// Filter out possible comments
					if ( match[1] === "*" ) {
						var tmp = [],
							i = 0;
	
						for ( ; results[i]; i++ ) {
							if ( results[i].nodeType === 1 ) {
								tmp.push( results[i] );
							}
						}
	
						results = tmp;
					}
					return results;
				}
		},
	
		preFilter: {
			CLASS: function( match, curLoop, inplace, result, not, xml ) {
				match = " " + match[1].replace( rbackslash, "" ) + " ";
	
				if ( xml ) {
					return match;
				}
	
				for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
					if ( elem ) {
						if ( not ^ (elem.className && (" " + elem.className + " ").replace( rtnfr, " " ).indexOf( match ) >= 0) ) {
							if ( !inplace ) {
								result.push( elem );
							}
	
						} else if ( inplace ) {
							curLoop[i] = false;
						}
					}
				}
	
				return false;
			},
	
			ID: function( match ) {
				return match[1].replace( rbackslash, "" );
			},
	
			TAG: function( match, curLoop ) {
				return match[1].replace( rbackslash, "" ).toLowerCase();
			},
	
			CHILD: function( match ) {
				if ( match[1] === "nth" ) {
					if ( !match[2] ) {
						Sizzle.error( match[0] );
					}
	
					match[2] = match[2].replace( radjacent, "" );
	
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					var test = rnth.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!rnonDigit.test( match[2] ) && "0n+" + match[2] || match[2] );
	
					// calculate the numbers (first)n+(last) including if they are negative
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
				} else if ( match[2] ) {
					Sizzle.error( match[0] );
				}
	
				// TODO: Move to normal caching system
				match[0] = done++;
	
				return match;
			},
	
			ATTR: function( match, curLoop, inplace, result, not, xml ) {
				var name = match[1] = match[1].replace( rbackslash, "" );
	
				if ( !xml && Expr.attrMap[ name ] ) {
					match[1] = Expr.attrMap[ name ];
				}
	
				// Handle if an un-quoted value was used
				match[4] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );
	
				if ( match[2] === "~=" ) {
					match[4] = " " + match[4] + " ";
				}
	
				return match;
			},
	
			PSEUDO: function( match, curLoop, inplace, result, not, xml ) {
				if ( match[1] === "not" ) {
					// If we're dealing with a complex expression, or a simple one
					if ( ( chunker.exec( match[3] ) || "" ).length > 1 || rstartsWithWord.test( match[3] ) ) {
						match[3] = select( match[3], document, [], curLoop, xml );
	
					} else {
						var ret = Sizzle.filter( match[3], curLoop, inplace, !not );
	
						if ( !inplace ) {
							result.push.apply( result, ret );
						}
	
						return false;
					}
	
				} else if ( matchExpr.POS.test( match[0] ) || matchExpr.CHILD.test( match[0] ) ) {
					return true;
				}
	
				return match;
			},
	
			POS: function( match ) {
				match.unshift( true );
	
				return match;
			}
		},
	
		filters: {
			enabled: function( elem ) {
				return elem.disabled === false;
			},
	
			disabled: function( elem ) {
				return elem.disabled === true;
			},
	
			checked: function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !!elem.selected);
			},
	
			selected: function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	
			parent: function( elem ) {
				return !!elem.firstChild;
			},
	
			empty: function( elem ) {
				return !elem.firstChild;
			},
	
			has: function( elem, i, match ) {
				return !!Sizzle( match[3], elem ).length;
			},
	
			header: function( elem ) {
				return rheader.test( elem.nodeName );
			},
	
			text: function( elem ) {
				var attr = elem.getAttribute( "type" ), type = elem.type;
				// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
				// use getAttribute instead to test this case
				return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === null || attr.toLowerCase() === type );
			},
	
			radio: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
			},
	
			checkbox: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
			},
	
			file: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
			},
	
			password: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
			},
	
			submit: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "submit" === elem.type;
			},
	
			image: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
			},
	
			reset: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "reset" === elem.type;
			},
	
			button: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && "button" === elem.type || name === "button";
			},
	
			input: function( elem ) {
				return rinputs.test( elem.nodeName );
			},
	
			focus: function( elem ) {
				var doc = elem.ownerDocument;
				return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
			},
	
			active: function( elem ) {
				return elem === elem.ownerDocument.activeElement;
			},
	
			contains: function( elem, i, match ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( match[3] ) >= 0;
			}
		},
	
		setFilters: {
			first: function( elem, i ) {
				return i === 0;
			},
	
			last: function( elem, i, match, array ) {
				return i === array.length - 1;
			},
	
			even: function( elem, i ) {
				return i % 2 === 0;
			},
	
			odd: function( elem, i ) {
				return i % 2 === 1;
			},
	
			lt: function( elem, i, match ) {
				return i < match[3] - 0;
			},
	
			gt: function( elem, i, match ) {
				return i > match[3] - 0;
			},
	
			nth: function( elem, i, match ) {
				return match[3] - 0 === i;
			},
	
			eq: function( elem, i, match ) {
				return match[3] - 0 === i;
			}
		},
	
		filter: {
			PSEUDO: function( elem, match, i, array ) {
				var name = match[1],
					filter = Expr.filters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
	
				} else if ( name === "not" ) {
					var not = match[3],
						j = 0,
						len = not.length;
	
					for ( ; j < len; j++ ) {
						if ( not[j] === elem ) {
							return false;
						}
					}
	
					return true;
	
				} else {
					Sizzle.error( name );
				}
			},
	
			CHILD: function( elem, match ) {
				var first, last,
					doneName, parent, cache,
					count, diff,
					type = match[1],
					node = elem;
	
				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}
	
						if ( type === "first" ) {
							return true;
						}
	
						node = elem;
	
						
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}
	
						return true;
	
					case "nth":
						first = match[2];
						last = match[3];
	
						if ( first === 1 && last === 0 ) {
							return true;
						}
	
						doneName = match[0];
						parent = elem.parentNode;
	
						if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
							count = 0;
	
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									node.nodeIndex = ++count;
								}
							}
	
							parent[ expando ] = doneName;
						}
	
						diff = elem.nodeIndex - last;
	
						if ( first === 0 ) {
							return diff === 0;
	
						} else {
							return ( diff % first === 0 && diff / first >= 0 );
						}
				}
			},
	
			ID: assertGetIdNotName ?
				function( elem, match ) {
					return elem.nodeType === 1 && elem.getAttribute("id") === match;
				} :
				function( elem, match ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return elem.nodeType === 1 && node && node.nodeValue === match;
				},
	
			TAG: function( elem, match ) {
				return ( match === "*" && elem.nodeType === 1 ) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
			},
	
			CLASS: function( elem, match ) {
				return ( " " + ( elem.className || elem.getAttribute("class") ) + " " ).indexOf( match ) > -1;
			},
	
			ATTR: function( elem, match ) {
				var name = match[1],
					result = Sizzle.attr ?
						Sizzle.attr( elem, name ) :
						Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ]( elem ) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute( name ),
					value = result + "",
					type = match[2],
					check = match[4];
	
				return result == null ?
					type === "!=" :
					!type && Sizzle.attr ?
					result != null :
					type === "=" ?
					value === check :
					type === "*=" ?
					value.indexOf( check ) >= 0 :
					type === "~=" ?
					( " " + value + " " ).indexOf( check ) >= 0 :
					!check ?
					value && result !== false :
					type === "!=" ?
					value !== check :
					type === "^=" ?
					value.indexOf( check ) === 0 :
					type === "$=" ?
					value.substr( value.length - check.length ) === check :
					type === "|=" ?
					value === check || value.substr( 0, check.length + 1 ) === check + "-" :
					false;
			},
	
			POS: function( elem, match, i, array ) {
				var name = match[2],
					filter = Expr.setFilters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
				}
			}
		}
	};
	
	// Add getElementsByClassName if usable
	if ( assertUsableClassName ) {
		Expr.order.splice( 1, 0, "CLASS" );
		Expr.find.CLASS = function( match, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( match[1] );
			}
		};
	}
	
	var sortOrder, siblingCheck;
	
	if ( docElem.compareDocumentPosition ) {
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
				return a.compareDocumentPosition ? -1 : 1;
			}
	
			return a.compareDocumentPosition(b) & 4 ? -1 : 1;
		};
	
	} else {
		sortOrder = function( a, b ) {
			// The nodes are identical, we can exit early
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
	
			// Fallback to using sourceIndex (in IE) if it's available on both nodes
			} else if ( a.sourceIndex && b.sourceIndex ) {
				return a.sourceIndex - b.sourceIndex;
			}
	
			var al, bl,
				ap = [],
				bp = [],
				aup = a.parentNode,
				bup = b.parentNode,
				cur = aup;
	
			// If the nodes are siblings (or identical) we can do a quick check
			if ( aup === bup ) {
				return siblingCheck( a, b );
	
			// If no parents were found then the nodes are disconnected
			} else if ( !aup ) {
				return -1;
	
			} else if ( !bup ) {
				return 1;
			}
	
			// Otherwise they're somewhere else in the tree so we need
			// to build up a full list of the parentNodes for comparison
			while ( cur ) {
				ap.unshift( cur );
				cur = cur.parentNode;
			}
	
			cur = bup;
	
			while ( cur ) {
				bp.unshift( cur );
				cur = cur.parentNode;
			}
	
			al = ap.length;
			bl = bp.length;
	
			// Start walking down the tree looking for a discrepancy
			for ( var i = 0; i < al && i < bl; i++ ) {
				if ( ap[i] !== bp[i] ) {
					return siblingCheck( ap[i], bp[i] );
				}
			}
	
			// We ended someplace up the tree so do a sibling check
			return i === al ?
				siblingCheck( a, bp[i], -1 ) :
				siblingCheck( ap[i], b, 1 );
		};
	
		siblingCheck = function( a, b, ret ) {
			if ( a === b ) {
				return ret;
			}
	
			var cur = a.nextSibling;
	
			while ( cur ) {
				if ( cur === b ) {
					return -1;
				}
	
				cur = cur.nextSibling;
			}
	
			return 1;
		};
	}
	
	if ( document.querySelectorAll ) {
		(function(){
			var oldSelect = select,
				id = "__sizzle__",
				rrelativeHierarchy = /^\s*[+~]/,
				rapostrophe = /'/g,
				// Build QSA regex
				// Regex strategy adopted from Diego Perini
				rbuggyQSA = [];
	
			assert(function( div ) {
				div.innerHTML = "<select><option selected></option></select>";
	
				// IE8 - Some boolean attributes are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push("\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
				}
	
				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here (do not put tests after this one)
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}
			});
	
			assert(function( div ) {
	
				// Opera 10/IE - ^= $= *= and empty values
				div.innerHTML = "<p class=''></p>";
				// Should not select anything
				if ( div.querySelectorAll("[class^='']").length ) {
					rbuggyQSA.push("[*^$]=[\\x20\\t\\n\\r\\f]*(?:\"\"|'')");
				}
	
				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here (do not put tests after this one)
				div.innerHTML = "<input type='hidden'>";
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push(":enabled", ":disabled");
				}
			});
	
			rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	
			select = function( selector, context, results, seed, contextXML ) {
				// Only use querySelectorAll when not filtering,
				// when this is not xml,
				// and when no QSA bugs apply
				if ( !seed && !contextXML && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
					if ( context.nodeType === 9 ) {
						try {
							return makeArray( context.querySelectorAll( selector ), results );
						} catch(qsaError) {}
					// qSA works strangely on Element-rooted queries
					// We can work around this by specifying an extra ID on the root
					// and working up from there (Thanks to Andrew Dupont for the technique)
					// IE 8 doesn't work on object elements
					} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
						var oldContext = context,
							old = context.getAttribute( "id" ),
							nid = old || id,
							parent = context.parentNode,
							relativeHierarchySelector = rrelativeHierarchy.test( selector );
	
						if ( !old ) {
							context.setAttribute( "id", nid );
						} else {
							nid = nid.replace( rapostrophe, "\\$&" );
						}
						if ( relativeHierarchySelector && parent ) {
							context = parent;
						}
	
						try {
							if ( !relativeHierarchySelector || parent ) {
								return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + selector ), results );
							}
						} catch(qsaError) {
						} finally {
							if ( !old ) {
								oldContext.removeAttribute( "id" );
							}
						}
					}
				}
	
				return oldSelect( selector, context, results, seed, contextXML );
			};
		})();
	}
	
	function dirCheck( dir, checkSet, part, xml ) {
		var elem, match, isElem, nodeCheck,
			doneName = done++,
			i = 0,
			len = checkSet.length;
	
		if ( typeof part === "string" && !rnonWord.test( part ) ) {
			part = part.toLowerCase();
			nodeCheck = part;
		}
	
		for ( ; i < len; i++ ) {
			elem = checkSet[i];
	
			if ( elem ) {
				match = false;
				elem = elem[ dir ];
	
				while ( elem ) {
					if ( elem[ expando ] === doneName ) {
						match = checkSet[ elem.sizset ];
						break;
					}
	
					isElem = elem.nodeType === 1;
					if ( isElem && !xml ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}
	
					if ( nodeCheck ) {
						if ( elem.nodeName.toLowerCase() === part ) {
							match = elem;
							break;
						}
					} else if ( isElem ) {
						if ( typeof part !== "string" ) {
							if ( elem === part ) {
								match = true;
								break;
							}
	
						} else if ( Sizzle.filter( part, [elem] ).length > 0 ) {
							match = elem;
							break;
						}
					}
	
					elem = elem[ dir ];
				}
	
				checkSet[i] = match;
			}
		}
	}
	
	var posProcess = function( selector, context, seed, contextXML ) {
		var match,
			tmpSet = [],
			later = "",
			root = context.nodeType ? [ context ] : context,
			i = 0,
			len = root.length;
	
		// Position selectors must be done after the filter
		// And so must :not(positional) so we move all PSEUDOs to the end
		while ( (match = matchExpr.PSEUDO.exec( selector )) ) {
			later += match[0];
			selector = selector.replace( matchExpr.PSEUDO, "" );
		}
	
		if ( Expr.relative[ selector ] ) {
			selector += "*";
		}
	
		for ( ; i < len; i++ ) {
			select( selector, root[i], tmpSet, seed, contextXML );
		}
	
		return Sizzle.filter( later, tmpSet );
	};
	
	// EXPOSE
	
	window.Sizzle = baidu.sizzle = Sizzle;
	baidu.query.matches = Sizzle.matches;
	
	})( window );
	
	/// Tangram 1.x Code Start
	
	baidu.dom.query = baidu.query;
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    removeClass: function(value){
	        if(arguments.length <= 0 ){
	            baidu.forEach(this, function(item){
	                item.className = '';
	            });
	        };
	        switch(typeof value){
	            case 'string':
	                //对输入进行处理
	                value = String(value).replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+/g,' ');
	                var arr = value.split(' ');
	                baidu.forEach(this, function(item){
	                    var str = item.className ;
	                    for(var i = 0;i<arr.length;i++){
	                        while((' '+str+' ').indexOf(' '+arr[i]+' ') >= 0){
	                           str = (' '+str+' ').replace(' '+arr[i]+' ',' ');
	                        };
	                    };
	                    item.className = str.replace(/^\s+/g,'').replace(/\s+$/g,'');
	                });
	            break;
	            case 'function':
	                baidu.forEach(this, function(item, index ,className){
	                    baidu.dom(item).removeClass(value.call(item, index, item.className));
	                });
	            break;
	        };
	
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    removeData : function () {
	        var   guid = baidu.key
	            , maps = baidu.global("_maps_HTMLElementData");
	
	        return function( key ) {
	            baidu.forEach( this, function( dom ) {
	                !dom[ guid ] && ( dom[ guid ] = baidu.id() );
	            });
	
	            // set all
	            baidu.forEach(this, function(dom){
	                var map = maps[dom[ guid ]];
	
	                if (typeof key == "string") {
	                    map && delete map[ key ];
	
	                } else if (baidu.type( key) == "array") {
	                    baidu.forEach( key, function(i) {
	                        map && delete map[ i ];
	                    });
	                }
	            });
	
	            return this;
	        }
	    }()
	});
	
	///baidu._util_.propHooks;
	
	baidu.dom.extend({
	    removeProp: function(value){
	
	        //异常处理
	        if(arguments.length <= 0 || !value || typeof value !== 'string'){
	            return this;
	        };
	
	        var bd = baidu.dom,
	            bu = baidu._util_;
	
	        value = bu.propFix[ value ] || value;
	        baidu.forEach(this, function(item){
	            // try/catch handles cases where IE balks (such as removing a property on window)
	            try {
	                item[ value ] = undefined;
	                delete item[ value ];
	            } catch( e ) {
	
	            };
	        });
	
	        return this;
	    }
	});
	/// Tangram 1.x Code Start
	
	 
	// todo: 1. 只支持现代浏览器，有一些老浏览器可能不支持; 2. 有部分属性无法被正常移除
	baidu.dom.removeStyle = function (){
	    var ele = document.createElement("DIV"),
	        fn,
	        _g = baidu.dom._g;
	    
	    if (ele.style.removeProperty) {// W3C, (gecko, opera, webkit)
	        fn = function (el, st){
	            el = _g(el);
	            el.style.removeProperty(st);
	            return el;
	        };
	    } else if (ele.style.removeAttribute) { // IE
	        fn = function (el, st){
	            el = _g(el);
	            el.style.removeAttribute(baidu.string.toCamelCase(st));
	            return el;
	        };
	    }
	    ele = null;
	    return fn;
	}();
	/// Tangram 1.x Code End
	
	baidu.object.each = function (source, iterator) {
	    var returnValue, key, item; 
	    if ('function' == typeof iterator) {
	        for (key in source) {
	            if (source.hasOwnProperty(key)) {
	                item = source[key];
	                returnValue = iterator.call(source, item, key);
	        
	                if (returnValue === false) {
	                    break;
	                }
	            }
	        }
	    }
	    return source;
	};
	
	/// Tangram 1.x Code Start
	
	baidu.dom.extend({
	setStyles : function ( styles) {
	    element = this[0];
	
	    for (var key in styles) {
	        baidu.dom.setStyle(element, key, styles[key]);
	    }
	
	    return element;
	}	
	});
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	 
	baidu.event.getTarget = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    return event.target || event.srcElement;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.setBorderBoxSize = function (element, size) {
	    var result = {};
	    size.width && (result.width = parseFloat(size.width));
	    size.height && (result.height = parseFloat(size.height));
	
	    function getNumericalStyle(element, name){
	        return parseFloat(baidu.dom.getStyle(element, name)) || 0;
	    }
	    
	    if(baidu.browser.isStrict){
	        if(size.width){
	            result.width = parseFloat(size.width)  -
	                           getNumericalStyle(element, 'paddingLeft') - 
	                           getNumericalStyle(element, 'paddingRight') - 
	                           getNumericalStyle(element, 'borderLeftWidth') -
	                           getNumericalStyle(element, 'borderRightWidth');
	            result.width < 0 && (result.width = 0);
	        }
	        if(size.height){
	            result.height = parseFloat(size.height) -
	                            getNumericalStyle(element, 'paddingTop') - 
	                            getNumericalStyle(element, 'paddingBottom') - 
	                            getNumericalStyle(element, 'borderTopWidth') - 
	                            getNumericalStyle(element, 'borderBottomWidth');
	            result.height < 0 && (result.height = 0);
	        }
	    }
	    return baidu.dom.setStyles(element, result);
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.setOuterHeight = 
	baidu.dom.setBorderBoxHeight = function (element, height) {
	    return baidu.dom.setBorderBoxSize(element, {height : height});
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.setOuterWidth = 
	baidu.dom.setBorderBoxWidth = function (element, width) {
	    return baidu.dom.setBorderBoxSize(element, {width : width});
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.resizable = function(element,options) {
	    var target,
	        op,
	        resizeHandle = {},
	        directionHandlePosition,
	        orgStyles = {},
	        range, mozUserSelect,
	        orgCursor,
	        offsetParent,
	        currentEle,
	        handlePosition,
	        timer,
	        isCancel = false,
	        isResizabled = false,
	        defaultOptions = {
	            direction: ['e', 's', 'se'],
	            minWidth: 16,
	            minHeight: 16,
	            classPrefix: 'tangram',
	            directionHandlePosition: {}
	        };
	
	        
	    if (!(target = baidu.dom.g(element)) && baidu.dom.getStyle(target, 'position') == 'static') {
	        return false;
	    }
	    offsetParent = target.offsetParent;
	    var orgPosition = baidu.dom.getStyle(target,'position');
	
	    
	    op = baidu.extend(defaultOptions, options);
	
	    
	    baidu.forEach(['minHeight', 'minWidth', 'maxHeight', 'maxWidth'], function(style) {
	        op[style] && (op[style] = parseFloat(op[style]));
	    });
	
	    
	    range = [
	        op.minWidth || 0,
	        op.maxWidth || Number.MAX_VALUE,
	        op.minHeight || 0,
	        op.maxHeight || Number.MAX_VALUE
	    ];
	
	    render(); 
	
	    
	    function render(){
	      
	        //位置属性
	        handlePosition = baidu.extend({
	            'e' : {'right': '-5px', 'top': '0px', 'width': '7px', 'height': target.offsetHeight},
	            's' : {'left': '0px', 'bottom': '-5px', 'height': '7px', 'width': target.offsetWidth},
	            'n' : {'left': '0px', 'top': '-5px', 'height': '7px', 'width': target.offsetWidth},
	            'w' : {'left': '-5px', 'top': '0px', 'height':target.offsetHeight , 'width': '7px'},
	            'se': {'right': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
	            'sw': {'left': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
	            'ne': {'right': '1px', 'top': '1px', 'height': '16px', 'width': '16px'},
	            'nw': {'left': '1px', 'top': '1px', 'height': '16px', 'width': '16px'}
	        },op.directionHandlePosition);
	        
	        //创建resizeHandle
	        baidu.forEach(op.direction, function(key) {
	            var className = op.classPrefix.split(' ');
	            className[0] = className[0] + '-resizable-' + key;
	
	            var ele = baidu.dom.create('div', {
	                className: className.join(' ')
	            }),
	                styles = handlePosition[key];
	
	            styles['cursor'] = key + '-resize';
	            styles['position'] = 'absolute';
	            baidu.dom.setStyles(ele, styles);
	            
	            ele.key = key;
	            ele.style.MozUserSelect = 'none';
	
	            target.appendChild(ele);
	            resizeHandle[key] = ele;
	
	            baidu.dom(ele).on('mousedown',start);
	        });
	
	        isCancel = false;
	    }
	
	    
	    function cancel(){
	        currentEle && stop();
	        baidu.object.each(resizeHandle,function(item){
	            baidu.dom(item).off("mousedown",start);
	            baidu.dom.remove(item);
	        });
	        isCancel = true;    
	    }
	
	    
	    function update(options){
	        if(!isCancel){
	            op = baidu.extend(op,options || {});
	            cancel();
	            render();
	        }
	    }
	
	    
	    function start(e){
			isResizabled && stop();
	        var ele = baidu.event.getTarget(e),
	            key = ele.key;
	        currentEle = ele;
			isResizabled = true;
			
	        if (ele.setCapture) {
	            ele.setCapture();
	        } else if (window.captureEvents) {
	            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
	        }
	
	        
	        orgCursor = baidu.dom.getStyle(document.body, 'cursor');
	        baidu.dom.setStyle(document.body, 'cursor', key + '-resize');
	        var tangramDom = baidu.dom(document.body);
	        tangramDom.on('mouseup',stop);
	        tangramDom.on('selectstart', unselect);
	        mozUserSelect = document.body.style.MozUserSelect;
	        document.body.style.MozUserSelect = 'none';
	
	        
	        var orgMousePosition = baidu.page.getMousePosition();
	        orgStyles = _getOrgStyle();
	        timer = setInterval(function(){
	            resize(key,orgMousePosition);
	        }, 20);
	
	        baidu.isFunction(op.onresizestart) && op.onresizestart();
	        baidu.event.preventDefault(e);
	    }
	
	    
	    function stop() {
	        if (currentEle && currentEle.releaseCapture) {
	            currentEle.releaseCapture();
	        } else if (window.releaseEvents) {
	            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
	        }
	
	        
	        baidu.dom(document.body).off('mouseup',stop);
	        baidu.dom(document).off('selectstart', unselect);
	        document.body.style.MozUserSelect = mozUserSelect;
	        baidu.dom(document.body).off('selectstart', unselect);
	
	        clearInterval(timer);
	        baidu.dom.setStyle(document.body, 'cursor',orgCursor);
	        currentEle = null;
			isResizabled = false;
	        baidu.isFunction(op.onresizeend) && op.onresizeend();
	    }
	
	    
	    function resize(key,orgMousePosition) {
	        var xy = baidu.page.getMousePosition(),
	            width = orgStyles['width'],
	            height = orgStyles['height'],
	            top = orgStyles['top'],
	            left = orgStyles['left'],
	            styles;
	
	        if (key.indexOf('e') >= 0) {
	            width = Math.max(xy.x - orgMousePosition.x + orgStyles['width'], range[0]);
	            width = Math.min(width, range[1]);
	        }else if (key.indexOf('w') >= 0) {
	            width = Math.max(orgMousePosition.x - xy.x + orgStyles['width'], range[0]);
	            width = Math.min(width, range[1]);
	            left -= width - orgStyles['width'];
	       }
	
	        if (key.indexOf('s') >= 0) {
	            height = Math.max(xy.y - orgMousePosition.y + orgStyles['height'], range[2]);
	            height = Math.min(height, range[3]);
	        }else if (key.indexOf('n') >= 0) {
	            height = Math.max(orgMousePosition.y - xy.y + orgStyles['height'], range[2]);
	            height = Math.min(height, range[3]);
	            top -= height - orgStyles['height'];
	        }
	         
	        styles = {'width': width, 'height': height, 'top': top, 'left': left};
	        baidu.dom.setOuterHeight(target,height);
	        baidu.dom.setOuterWidth(target,width);
	        baidu.dom.setStyles(target,{"top":top,"left":left});
	
	        resizeHandle['n'] && baidu.dom.setStyle(resizeHandle['n'], 'width', width);
	        resizeHandle['s'] && baidu.dom.setStyle(resizeHandle['s'], 'width', width);
	        resizeHandle['e'] && baidu.dom.setStyle(resizeHandle['e'], 'height', height);
	        resizeHandle['w'] && baidu.dom.setStyle(resizeHandle['w'], 'height', height);
	
	        baidu.isFunction(op.onresize) && op.onresize({current:styles,original:orgStyles});
	    }
	
	    
	    function unselect(e) {
	        return baidu.event.preventDefault(e, false);
	    }
	
	    
	    function _getOrgStyle() {
	        var offset_parent = baidu.dom.getPosition(target.offsetParent),
	            offset_target = baidu.dom.getPosition(target),
	            top,
	            left;
	       
	        if(orgPosition == "absolute"){
	            top =  offset_target.top - (target.offsetParent == document.body ? 0 : offset_parent.top);
	            left = offset_target.left - (target.offsetParent == document.body ? 0 :offset_parent.left);
	        }else{
	            top = parseFloat(baidu.dom.getStyle(target,"top")) || -parseFloat(baidu.dom.getStyle(target,"bottom")) || 0;
	            left = parseFloat(baidu.dom.getStyle(target,"left")) || -parseFloat(baidu.dom.getStyle(target,"right")) || 0; 
	        }
	        baidu.dom.setStyles(target,{top:top,left:left});
	
	        return {
	            width:target.offsetWidth,
	            height:target.offsetHeight,
	            top:top,
	            left:left
	        };
	    }
	    
	    return {cancel:cancel,update:update,enable:render};
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    scrollLeft: function(){
	        var ret = baidu._util_.smartScroll('scrollLeft');
	        return function(value){
	            value && baidu.check('^(?:number|string)$', 'baidu.dom.scrollLeft');
	            if(this.size()<=0){
	            	return value === undefined ? 0 : this;
	            };
	            return value === undefined ? ret.get(this[0])
	                : ret.set(this[0], value) || this;
	        }
	    }()
	});
	
	baidu.dom.extend({
	    scrollTop: function(){
	        var ret = baidu._util_.smartScroll('scrollTop');
	        return function(value){
	            value && baidu.check('^(?:number|string)$', 'baidu.dom.scrollTop');
	            if(this.size()<=0){
	            	return value === undefined ? 0 : this;
	            };
	            return value === undefined ? ret.get(this[0])
	                : ret.set(this[0], value) || this;
	        }
	    }()
	});
	/// Tangram 1.x Code Start
	
	baidu.dom.extend({
	    setAttrs : function (attributes) {
	        element = this[0];
	    
	        for (var key in attributes) {
	            baidu.dom.setAttr(element, key, attributes[key]);
	        }
	    
	        return element;
	    }
	});
	
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.dom.setPixel = function (el, style, n) {
		typeof n != "undefined" &&
		(baidu.dom.g(el).style[style] = n +(!isNaN(n) ? "px" : ""));
	};
	/// support magic - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.dom.setPosition = function (element, position) {
	    var coor = {
	            left : position.left - (parseFloat(baidu.dom.getStyle(element, "margin-left")) || 0),
	            top  : position.top -  (parseFloat(baidu.dom.getStyle(element,  "margin-top")) || 0)
	        };
	    element = baidu.dom.g(element);
	    for(var i in coor){
	        baidu.dom.setStyle(element, i, coor[i]);
	    }
	    return element;
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    show : function() {
	        baidu._util_.showHide( this, true );
	        return this;
	    }
	});
	
	baidu.dom.extend({
	    siblings : function (filter) {
	        var array = [];
	
	        baidu.forEach(this, function(dom){
	            var p = [], n = [], t = dom;
	
	            while(t = t.previousSibling) t.nodeType == 1 && p.push(t);
	            while(dom = dom.nextSibling) dom.nodeType==1 && n.push(dom);
	
	            baidu.merge(array, p.reverse().concat(n));
	        });
	
	        return baidu.dom( baidu.dom.match(array, filter) );
	    }
	});
	
	baidu.dom.extend({
	    slice : function(){
	        var slice = Array.prototype.slice;
	
	        return function (start, end) {
	            baidu.check("number(,number)?","baidu.dom.slice");
	
	            // ie bug
	            // return baidu.dom( this.toArray().slice(start, end) );
	            return baidu.dom( slice.apply(this, arguments) );
	        }
	    }()
	});
	
	/// Tangram 1.x Code Start
	
	baidu.dom.toggle = function (element) {
	    element = baidu.dom.g(element);
	    element.style.display = element.style.display == "none" ? "" : "none";
	
	    return element;
	};
	/// Tangram 1.x Code End
	
	baidu.dom.extend({
	    toggleClass: function(value,status){
	    	var type = typeof value;
	        var status = (typeof status === 'undefined')? status : Boolean(status);
	
	        if(arguments.length <= 0 ){
	            baidu.forEach(this,function(item){
	                item.className = '';
	            });
	        };
	
	        switch(typeof value){
	            case 'string':
	
	                //对输入进行处理
	                value = value.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+/g,' ');
	
	                var arr = value.split(' ');
	                baidu.forEach(this, function(item){
	                    var str = item.className;
	                    for(var i = 0;i<arr.length;i++){
	
	                        //有这个className
	                        if(((' '+str+' ').indexOf(' '+arr[i]+' ') > -1)&&(typeof status === 'undefined')){
	                            str = (' '+str+' ').replace(' '+arr[i]+' ',' ');
	                            
	                        }else if(((' '+str+' ').indexOf(' '+arr[i]+' ') === -1)&&(typeof status === 'undefined')){
	                            str += ' '+arr[i];
	
	                        }else if(((' '+str+' ').indexOf(' '+arr[i]+' ') === -1)&&(status === true)){
	                            str += ' '+arr[i];
	
	                        }else if(((' '+str+' ').indexOf(' '+arr[i]+' ') > -1)&&(status === false)){
	                            str = str.replace(arr[i],'');
	                        };
	                    };
	                    item.className = str.replace(/^\s+/g,'').replace(/\s+$/g,'');
	                });
	            break;
	            case 'function':
	
	                baidu.forEach(this, function(item, index){
	                    baidu.dom(item).toggleClass(value.call(item, index, item.className),status);
	                });
	
	            break;
	        };
	
	        return this;
	    }
	});
	
	/// Tangram 1.x Code Start
	//兼容老接口
	
	baidu.dom.toggleClass = function (element, className) {
	    if(baidu.dom.hasClass(element, className)){
	        baidu.dom.removeClass(element, className);
	    }else{
	        baidu.dom.addClass(element, className);
	    }
	};
	/// Tangram 1.x Code End
	
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
	
		var upp = function( str ){
		    return str.replace( /^\w/, function( s ){
		        return s.toUpperCase();
		    } );
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
	
	baidu.dom.extend({
		triggerHandler: function(type, triggerData){
			var eb = baidu._util_.eventBase;
	
			baidu.forEach(this, function(item){
			    eb.fireHandler(item, type, triggerData);
			});
	
			return this;
		}
	});
	
	baidu.dom.extend({
		unbind: function(type, fn){
			return this.off(type, fn);
		}
	});
	
	baidu.dom.extend({
		undelegate: function( selector, type, fn ){
	    	return this.off( type, selector, fn );
		}
	});
	
	baidu.dom.extend({
	    unique : function (fn) {
	        return baidu.dom(baidu.array(this.toArray()).unique(fn));
	    }
	});
	
	//baidu.lang.isArray = function (source) {
	//    return '[object Array]' == Object.prototype.toString.call(source);
	//};
	baidu.lang.isArray = baidu.isArray;
	
	baidu.lang.toArray = function (source) {
	    if (source === null || source === undefined)
	        return [];
	    if (baidu.lang.isArray(source))
	        return source;
	
	    // The strings and functions also have 'length'
	    if (typeof source.length !== 'number' || typeof source === 'string' || baidu.lang.isFunction(source)) {
	        return [source];
	    }
	
	    //nodeList, IE 下调用 [].slice.call(nodeList) 会报错
	    if (source.item) {
	        var l = source.length, array = new Array(l);
	        while (l--)
	            array[l] = source[l];
	        return array;
	    }
	
	    return [].slice.call(source);
	};
	/// Tangram 1.x Code Start
	
	baidu.fn.extend({
	    methodize : function (attr) {
	    	var fn = this.fn ;
	        return function(){
	            return fn.apply(this, [(attr ? this[attr] : this)].concat([].slice.call(arguments)));
	        };
	    }
	});
	/// Tangram 1.x Code End
	
	baidu.fn.extend({
	    wrapReturnValue: function(wrapper, mode){
	        var func = this.fn;
	        mode = mode | 0;
	        return function(){
	            var ret = func.apply(this, arguments);
	            if(!mode){return new wrapper(ret);}
	            if(mode > 0){
	                return new wrapper(arguments[mode - 1]);
	            }
	            return ret;
	        }
	    }
	});
	/// Tangram 1.x Code Start
	
	baidu.fn.wrapReturnValue = function (func, wrapper, mode) {
	    return baidu.fn(func).wrapReturnValue(wrapper, mode);
	};
	/// Tangram 1.x Code End
	
	baidu.fn.extend({
	    multize: function(recursive, joinArray){
	        var func = this.fn;
	        function newFunc(){
	            var list = arguments[0],
	                fn = recursive ? newFunc : func,
	                ret = [],
	                moreArgs = Array.prototype.slice.call(arguments, 0),
	                result;
	            
	            if(list instanceof Array){
	                for(var i = 0, item; item = list[i]; i++){
	                    moreArgs[0] = item;
	                    result = fn.apply(this, moreArgs);
	                    if(joinArray){
	                        //TODO: 需要去重吗？
	                        result && (ret = ret.concat(result));
	                    }else{
	                        ret.push(result);
	                    }
	                }
	                return ret;
	            }else{
	                return func.apply(this, arguments);
	            }
	        }
	        return newFunc;
	    }
	});
	/// Tangram 1.x Code Start
	
	baidu.fn.multize = function (func, recursive, joinArray) {
	    return baidu.fn(func).multize(recursive, joinArray);
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.element = function(node){
	    var gNode = baidu.dom._g(node);
	    if(!gNode && baidu.dom.query){
	        gNode = baidu.dom.query(node);
	    }
	    return new baidu.element.Element(gNode);
	};
	
	baidu.element.Element = function(node){
	    if(!baidu.element._init){
	        //由于element可能会在其他代码之前加载，因此用这个方法来延迟加载
	        baidu.element._makeChain();
	        baidu.element._init = true;
	    }
	    
	    this._dom = (node.tagName || '').toLowerCase() == 'select' ? 
	    	[node] : baidu.lang.toArray(node);
	};
	
	baidu.element.Element.prototype.each = function(iterator) {
	    // 每一个iterator接受到的都是封装好的node
	    baidu.array.each(this._dom, function(node, i){
	        iterator.call(node, node, i);
	    });
	};
	
	baidu.element._toChainFunction = function(func, index, joinArray){
	    return baidu.fn.methodize(baidu.fn.wrapReturnValue(baidu.fn.multize(func, 0, 1), baidu.element.Element, index), '_dom');
	};
	
	baidu.element._makeChain = function(){ //将dom/event包下的东西挂到prototype里面
	    var proto = baidu.element.Element.prototype,
	        fnTransformer = baidu.element._toChainFunction;
	
	    //返回值是第一个参数的包装
	    baidu.forEach(("draggable droppable resizable fixable").split(' '),
	              function(fn){
	                  proto[fn] =  fnTransformer(baidu.dom[fn], 1);
	              });
	
	    //直接返回返回值
	    baidu.forEach(("remove getText contains getAttr getPosition getStyle hasClass intersect hasAttr getComputedStyle").split(' '),
	              function(fn){
	                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], -1);
	              });
	
	    //包装返回值
	    //包含
	    //1. methodize
	    //2. multize，结果如果是数组会被展平
	    //3. getXx == xx
	    baidu.forEach(("addClass empty hide show insertAfter insertBefore insertHTML removeClass " + 
	              "setAttr setAttrs setStyle setStyles show toggleClass toggle next first " + 
	              "getAncestorByClass getAncestorBy getAncestorByTag getDocument getParent getWindow " +
	              "last next prev g removeStyle setBorderBoxSize setOuterWidth setOuterHeight " +
	              "setBorderBoxWidth setBorderBoxHeight setPosition children query").split(' '),
	              function(fn){
	                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], 0);
	              });
	
	    //对于baidu.dom.q这种特殊情况，将前两个参数调转
	    //TODO：需要将这种特殊情况归纳到之前的情况中
	    proto['q'] = proto['Q'] = fnTransformer(function(arg1, arg2){
	        return baidu.dom.q.apply(this, [arg2, arg1].concat([].slice.call(arguments, 2)));
	    }, 0);
	
	    //包装event中的on 和 un
	    baidu.forEach(("on un").split(' '), function(fn){
	        proto[fn] = fnTransformer(baidu.event[fn], 0);
	    });
	  
	    
	    //包装event的快捷方式
	    baidu.forEach(("blur focus focusin focusout load resize scroll unload click dblclick " +
	                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + 
	                "change select submit keydown keypress keyup error").split(' '), function(fnName){
	        proto[fnName] = function(fn){
	            return this.on(fnName, fn);
	        };
	    });
	
	    
	    function stripGet(match) {  
	        return match.charAt(3).toLowerCase();
	    }
	};
	
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	 
	baidu.element.extend = function(json){
	    var e = baidu.element;
	    baidu.object.each(json, function(item, key){
	        e.Element.prototype[key] = baidu.element._toChainFunction(item, -1);
	    });
	};
	
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.EventArg = function (event, win) {
	    win = win || window;
	    event = event || win.event;
	    var doc = win.document;
	    
	    this.target =  (event.target) || event.srcElement;
	    this.keyCode = event.which || event.keyCode;
	    for (var k in event) {
	        var item = event[k];
	        // 避免拷贝preventDefault等事件对象方法
	        if ('function' != typeof item) {
	            this[k] = item;
	        }
	    }
	    
	    if (!this.pageX && this.pageX !== 0) {
	        this.pageX = (event.clientX || 0) 
	                        + (doc.documentElement.scrollLeft 
	                            || doc.body.scrollLeft);
	        this.pageY = (event.clientY || 0) 
	                        + (doc.documentElement.scrollTop 
	                            || doc.body.scrollTop);
	    }
	    this._event = event;
	};
	
	baidu.event.EventArg.prototype.preventDefault = function () {
	    if (this._event.preventDefault) {
	        this._event.preventDefault();
	    } else {
	        this._event.returnValue = false;
	    }
	    return this;
	};
	
	baidu.event.EventArg.prototype.stopPropagation = function () {
	    if (this._event.stopPropagation) {
	        this._event.stopPropagation();
	    } else {
	        this._event.cancelBubble = true;
	    }
	    return this;
	};
	
	baidu.event.EventArg.prototype.stop = function () {
	    return this.stopPropagation().preventDefault();
	};
	/// Tangram 1.x Code End
	
	baidu.object.values = function (source) {
	    var result = [], resultLen = 0, k;
	    for (k in source) {
	        if (source.hasOwnProperty(k)) {
	            result[resultLen++] = source[k];
	        }
	    }
	    return result;
	};
	
	/// Tangram 1.x Code Start
	
	//baidu.lang.isNumber = function (source) {
	//    return '[object Number]' == Object.prototype.toString.call(source) && isFinite(source);
	//};
	baidu.lang.isNumber = baidu.isNumber;
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.event.fire = function(){
	    var browser = baidu.browser,
	        keys = {
	            keydown : 1,
	            keyup : 1,
	            keypress : 1
	        },
	        mouses = {
	            click : 1,
	            dblclick : 1,
	            mousedown : 1,
	            mousemove : 1,
	            mouseup : 1,
	            mouseover : 1,
	            mouseout : 1
	        },
	        htmls = {
	            abort : 1,
	            blur : 1,
	            change : 1,
	            error : 1,
	            focus : 1,
	            load : browser.ie ? 0 : 1,
	            reset : 1,
	            resize : 1,
	            scroll : 1,
	            select : 1,
	            submit : 1,
	            unload : browser.ie ? 0 : 1
	        },
	        bubblesEvents = {
	            scroll : 1,
	            resize : 1,
	            reset : 1,
	            submit : 1,
	            change : 1,
	            select : 1,
	            error : 1,
	            abort : 1
	        },
	        parameters = {
	            "KeyEvents" : ["bubbles", "cancelable", "view", "ctrlKey", "altKey", "shiftKey", "metaKey", "keyCode", "charCode"],
	            "MouseEvents" : ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget"],
	            "HTMLEvents" : ["bubbles", "cancelable"],
	            "UIEvents" : ["bubbles", "cancelable", "view", "detail"],
	            "Events" : ["bubbles", "cancelable"]
	        };
	    baidu.object.extend(bubblesEvents, keys);
	    baidu.object.extend(bubblesEvents, mouses);
	    function parse(array, source){//按照array的项在source中找到值生成新的obj并把source中对应的array的项删除
	        var i = 0, size = array.length, obj = {};
	        for(; i < size; i++){
	            obj[array[i]] = source[array[i]];
	            delete source[array[i]];
	        }
	        return obj;
	    };
	    function eventsHelper(type, eventType, options){//非IE内核的事件辅助
	        options = baidu.object.extend({}, options);
	        var param = baidu.object.values(parse(parameters[eventType], options)),
	            evnt = document.createEvent(eventType);
	        param.unshift(type);
	        if("KeyEvents" == eventType){
	            evnt.initKeyEvent.apply(evnt, param);
	        }else if("MouseEvents" == eventType){
	            evnt.initMouseEvent.apply(evnt, param);
	        }else if("UIEvents" == eventType){
	            evnt.initUIEvent.apply(evnt, param);
	        }else{//HTMMLEvents, Events
	            evnt.initEvent.apply(evnt, param);
	        }
	        baidu.object.extend(evnt, options);//把多出来的options再附加上去,这是为解决当创建一个其它event时，当用Events代替后需要把参数附加到对象上
	        return evnt;
	    };
	    function eventObject(options){//ie内核的构建方式
	        var evnt;
	        if(document.createEventObject){
	            evnt = document.createEventObject();
	            baidu.object.extend(evnt, options);
	        }
	        return evnt;
	    };
	    function keyEvents(type, options){//keyEvents
	        options = parse(parameters["KeyEvents"], options);
	        var evnt;
	        if(document.createEvent){
	            try{//opera对keyEvents的支持极差
	                evnt = eventsHelper(type, "KeyEvents", options);
	            }catch(keyError){
	                try{
	                    evnt = eventsHelper(type, "Events", options);
	                }catch(evtError){
	                    evnt = eventsHelper(type, "UIEvents", options);
	                }
	            }
	        }else{
	            options.keyCode = options.charCode > 0 ? options.charCode : options.keyCode;
	            evnt = eventObject(options);
	        }
	        return evnt;
	    };
	    function mouseEvents(type, options){//mouseEvents
	        options = parse(parameters["MouseEvents"], options);
	        var evnt;
	        if(document.createEvent){
	            evnt = eventsHelper(type, "MouseEvents", options);//mouseEvents基本浏览器都支持
	            if(options.relatedTarget && !evnt.relatedTarget){
	                if("mouseout" == type.toLowerCase()){
	                    evnt.toElement = options.relatedTarget;
	                }else if("mouseover" == type.toLowerCase()){
	                    evnt.fromElement = options.relatedTarget;
	                }
	            }
	        }else{
	            options.button = options.button == 0 ? 1
	                                : options.button == 1 ? 4
	                                    : baidu.lang.isNumber(options.button) ? options.button : 0;
	            evnt = eventObject(options);
	        }
	        return evnt;
	    };
	    function htmlEvents(type, options){//htmlEvents
	        options.bubbles = bubblesEvents.hasOwnProperty(type);
	        options = parse(parameters["HTMLEvents"], options);
	        var evnt;
	        if(document.createEvent){
	            try{
	                evnt = eventsHelper(type, "HTMLEvents", options);
	            }catch(htmlError){
	                try{
	                    evnt = eventsHelper(type, "UIEvents", options);
	                }catch(uiError){
	                    evnt = eventsHelper(type, "Events", options);
	                }
	            }
	        }else{
	            evnt = eventObject(options);
	        }
	        return evnt;
	    };
	    
	    return function(element, type, options){
	        var evnt;
	        type = type.replace(/^on/i, "");
	        element = baidu.dom._g(element);
	        options = baidu.object.extend({
	            bubbles : true,
	            cancelable : true,
	            view : window,
	            detail : 1,
	            screenX : 0,
	            screenY : 0,
	            clientX : 0,
	            clientY : 0,
	            ctrlKey : false,
	            altKey  : false,
	            shiftKey: false,
	            metaKey : false,
	            keyCode : 0,
	            charCode: 0,
	            button  : 0,
	            relatedTarget : null
	        }, options);
	        if(keys[type]){
	            evnt = keyEvents(type, options);
	        }else if(mouses[type]){
	            evnt = mouseEvents(type, options);
	        }else if(htmls[type]){
	            evnt = htmlEvents(type, options);
	        }else{
	            throw(new Error(type + " is not support!"));
	        }
	        if(evnt){//tigger event
	            if(element.dispatchEvent){
	                element.dispatchEvent(evnt);
	            }else if(element.fireEvent){
	                element.fireEvent("on" + type, evnt);
	            }
	        }
	    }
	}();
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.get = function (event, win) {
	    return new baidu.event.EventArg(event, win);
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.getEvent = function(event) {
	    if (window.event) {
	        return window.event;
	    } else {
	        var f = arguments.callee, evt;
	        do { //此处参考Qwrap框架 see http://www.qwrap.com/ by dengping
	            evt = f.arguments[0];
	            if(evt && (/Event/.test(evt) || evt.originalEvent)){
	                return evt.originalEvent || evt;
	            }
	        } while (f = f.caller);
	        return null;
	    }
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.getKeyCode = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    return event.which || event.keyCode;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.getPageX = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    var result = event.pageX,
	        doc = document;
	    if (!result && result !== 0) {
	        result = (event.clientX || 0) 
	                    + (doc.documentElement.scrollLeft 
	                        || doc.body.scrollLeft);
	    }
	    return result;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.getPageY = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    var result = event.pageY,
	        doc = document;
	    if (!result && result !== 0) {
	        result = (event.clientY || 0) 
	                    + (doc.documentElement.scrollTop 
	                        || doc.body.scrollTop);
	    }
	    return result;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.once = function(element, type, listener){
	    return baidu.dom(baidu.dom._g(element)).one(type, listener)[0];
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.stopPropagation = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    if (event.stopPropagation) {
	        event.stopPropagation();
	    } else {
	        event.cancelBubble = true;
	    }
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.event.stop = function (event) {
	    event.originalEvent && (event = event.originalEvent);
	    baidu.event.stopPropagation(event);
	    baidu.event.preventDefault(event);
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.fn.abstractMethod = function() {
	    throw Error('unimplemented abstract method');
	};
	/// Tangram 1.x Code End
	
	baidu.fn.extend({
	    bind: function(scope){
	        var func = this.fn,
	            xargs = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;
	        return function(){
	            var fn = baidu.type(func) === 'string' ? scope[func] : func,
	                args = xargs ? xargs.concat(Array.prototype.slice.call(arguments, 0)) : arguments;
	            return fn.apply(scope || fn, args);
	        }
	    }
	});
	/// Tangram 1.x Code Start
	
	baidu.fn.bind = function(func, scope) {
	    var fn = baidu.fn(func);
	    return fn.bind.apply(fn, Array.prototype.slice.call(arguments, 1));
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.createChain("form",
	
	// 执行方法
	function(form){
		return typeof form === 'undefined'? new baidu.form.$Form():new baidu.form.$Form(form);
	},
	
	// constructor
	function(form){
		this.form = form;
	});
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.form.extend({
	    json : function (replacer) {
	        var form = this.form;
	        var elements = form.elements,
	            replacer = replacer || function (value, name) {
	                return value;
	            },
	            data = {},
	            item, itemType, itemName, itemValue, 
	            opts, oi, oLen, oItem;
	            
	        
	        function addData(name, value) {
	            var val = data[name];
	            if(val){
	                val.push || ( data[name] = [val] );
	                data[name].push(value);
	            }else{
	                data[name] = value;
	            }
	        }
	        
	        for (var i = 0, len = elements.length; i < len; i++) {
	            item = elements[i];
	            itemName = item.name;
	            
	            // 处理：可用并包含表单name的表单项
	            if (!item.disabled && itemName) {
	                itemType = item.type;
	                itemValue = baidu.url.escapeSymbol(item.value);
	            
	                switch (itemType) {
	                // radio和checkbox被选中时，拼装queryString数据
	                case 'radio':
	                case 'checkbox':
	                    if (!item.checked) {
	                        break;
	                    }
	                    
	                // 默认类型，拼装queryString数据
	                case 'textarea':
	                case 'text':
	                case 'password':
	                case 'hidden':
	                case 'file':
	                case 'select-one':
	                    addData(itemName, replacer(itemValue, itemName));
	                    break;
	                    
	                // 多行选中select，拼装所有选中的数据
	                case 'select-multiple':
	                    opts = item.options;
	                    oLen = opts.length;
	                    for (oi = 0; oi < oLen; oi++) {
	                        oItem = opts[oi];
	                        if (oItem.selected) {
	                            addData(itemName, replacer(oItem.value, itemName));
	                        }
	                    }
	                    break;
	                }
	            }
	        }
	        return data;
	    }
	});
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.form.extend({
	    serialize : function (replacer) {
	        var form = this.form;
	        var elements = form.elements,
	            replacer = replacer || function (value, name) {
	                return value;
	            },
	            data = [],
	            item, itemType, itemName, itemValue, 
	            opts, oi, oLen, oItem;
	            
	        
	        function addData(name, value) {
	            data.push(name + '=' + value);
	        }
	        
	        for (var i = 0, len = elements.length; i < len; i++) {
	            item = elements[i];
	            itemName = item.name;
	            
	            // 处理：可用并包含表单name的表单项
	            if (!item.disabled && itemName) {
	                itemType = item.type;
	                itemValue = baidu.url.escapeSymbol(item.value);
	            
	                switch (itemType) {
	                // radio和checkbox被选中时，拼装queryString数据
	                case 'radio':
	                case 'checkbox':
	                    if (!item.checked) {
	                        break;
	                    }
	                    
	                // 默认类型，拼装queryString数据
	                case 'textarea':
	                case 'text':
	                case 'password':
	                case 'hidden':
	                case 'file':
	                case 'select-one':
	                    addData(itemName, replacer(itemValue, itemName));
	                    break;
	                    
	                // 多行选中select，拼装所有选中的数据
	                case 'select-multiple':
	                    opts = item.options;
	                    oLen = opts.length;
	                    for (oi = 0; oi < oLen; oi++) {
	                        oItem = opts[oi];
	                        if (oItem.selected) {
	                            addData(itemName, replacer(oItem.value, itemName));
	                        }
	                    }
	                    break;
	                }
	            }
	        }
	        return data;
	    }
	
	});
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.fx = baidu.fx || {} ;
	
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.lang.inherits = function (subClass, superClass, type) {
	    var key, proto, 
	        selfProps = subClass.prototype, 
	        clazz = new Function();
	        
	    clazz.prototype = superClass.prototype;
	    proto = subClass.prototype = new clazz();
	
	    for (key in selfProps) {
	        proto[key] = selfProps[key];
	    }
	    subClass.prototype.constructor = subClass;
	    subClass.superClass = superClass.prototype;
	
	    // 类名标识，兼容Class的toString，基本没用
	    typeof type == "string" && (proto.__type = type);
	
	    subClass.extend = function(json) {
	        for (var i in json) proto[i] = json[i];
	        return subClass;
	    }
	    
	    return subClass;
	};
	
	//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	 
	 
	 
	
	baidu.fx.Timeline = function(options){
	    baidu.lang.Class.call(this);
	
	    this.interval = 16;
	    this.duration = 500;
	    this.dynamic  = true;
	
	    baidu.object.extend(this, options);
	};
	baidu.lang.inherits(baidu.fx.Timeline, baidu.lang.Class, "baidu.fx.Timeline").extend({
	
	    
	    launch : function(){
	        var me = this;
	        me.dispatchEvent("onbeforestart");
	
	        
	        typeof me.initialize =="function" && me.initialize();
	
	        me["\x06btime"] = new Date().getTime();
	        me["\x06etime"] = me["\x06btime"] + (me.dynamic ? me.duration : 0);
	        me["\x06pulsed"]();
	
	        return me;
	    }
	
	    
	    ,"\x06pulsed" : function(){
	        var me = this;
	        var now = new Date().getTime();
	        // 当前时间线的进度百分比
	        me.percent = (now - me["\x06btime"]) / me.duration;
	        me.dispatchEvent("onbeforeupdate");
	
	        // 时间线已经走到终点
	        if (now >= me["\x06etime"]){
	            typeof me.render == "function" && me.render(me.transition(me.percent = 1));
	
	            // [interface run] finish()接口，时间线结束时对应的操作
	            typeof me.finish == "function" && me.finish();
	
	            me.dispatchEvent("onafterfinish");
	            me.dispose();
	            return;
	        }
	
	        
	        typeof me.render == "function" && me.render(me.transition(me.percent));
	        me.dispatchEvent("onafterupdate");
	
	        me["\x06timer"] = setTimeout(function(){me["\x06pulsed"]()}, me.interval);
	    }
	    
	    ,transition: function(percent) {
	        return percent;
	    }
	
	    
	    ,cancel : function() {
	        this["\x06timer"] && clearTimeout(this["\x06timer"]);
	        this["\x06etime"] = this["\x06btime"];
	
	        // [interface run] restore() 当时间线被撤销时的恢复操作
	        typeof this.restore == "function" && this.restore();
	        this.dispatchEvent("oncancel");
	
	        this.dispose();
	    }
	
	    
	    ,end : function() {
	        this["\x06timer"] && clearTimeout(this["\x06timer"]);
	        this["\x06etime"] = this["\x06btime"];
	        this["\x06pulsed"]();
	    }
	});
	/// support magic - Tangram 1.x Code End
	/// support magic - support magic - Tangram 1.x Code Start
	
	baidu.fx.create = function(element, options, fxName) {
	    var timeline = new baidu.fx.Timeline(options);
	
	    timeline.element = element;
	    timeline.__type = fxName || timeline.__type;
	    timeline["\x06original"] = {};   // 20100708
	    var catt = "baidu_current_effect";
	
	    
	    timeline.addEventListener("onbeforestart", function(){
	        var me = this, guid;
	        me.attribName = "att_"+ me.__type.replace(/\W/g, "_");
	        guid = me.element.getAttribute(catt);
	        me.element.setAttribute(catt, (guid||"") +"|"+ me.guid +"|", 0);
	
	        if (!me.overlapping) {
	            (guid = me.element.getAttribute(me.attribName)) 
	                && window[baidu.guid]._instances[guid].cancel();
	
	            //在DOM元素上记录当前效果的guid
	            me.element.setAttribute(me.attribName, me.guid, 0);
	        }
	    });
	
	    
	    timeline["\x06clean"] = function(e) {
	    	var me = this, guid;
	        if (e = me.element) {
	            e.removeAttribute(me.attribName);
	            guid = e.getAttribute(catt);
	            guid = guid.replace("|"+ me.guid +"|", "");
	            if (!guid) e.removeAttribute(catt);
	            else e.setAttribute(catt, guid, 0);
	        }
	    };
	
	    
	    timeline.addEventListener("oncancel", function() {
	        this["\x06clean"]();
	        this["\x06restore"]();
	    });
	
	    
	    timeline.addEventListener("onafterfinish", function() {
	        this["\x06clean"]();
	        this.restoreAfterFinish && this["\x06restore"]();
	    });
	
	    
	    timeline.protect = function(key) {
	        this["\x06original"][key] = this.element.style[key];
	    };
	
	    
	    timeline["\x06restore"] = function() {
	        var o = this["\x06original"],
	            s = this.element.style,
	            v;
	        for (var i in o) {
	            v = o[i];
	            if (typeof v == "undefined") continue;
	
	            s[i] = v;    // 还原初始值
	
	            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
	            if (!v && s.removeAttribute) s.removeAttribute(i);    // IE
	            else if (!v && s.removeProperty) s.removeProperty(i); // !IE
	        }
	    };
	
	    return timeline;
	};
	
	/// support magic - support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.fx.collapse = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    var e = element, 
	        value, 
	        attr,
	        attrHV = {
	            "vertical": {
	                value: 'height',
	                offset: 'offsetHeight',
	                stylesValue: ["paddingBottom","paddingTop","borderTopWidth","borderBottomWidth"]
	            },
	            "horizontal": {
	                value: 'width',
	                offset: 'offsetWidth',
	                stylesValue: ["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
	            }
	        };
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        orientation: 'vertical'
	        
	        //[Implement Interface] initialize
	        ,initialize : function() {
	            attr = attrHV[this.orientation];
	            this.protect(attr.value);
	            this.protect("overflow");
	            this.restoreAfterFinish = true;
	            value = e[attr.offset];
	            e.style.overflow = "hidden";
	        }
	
	        //[Implement Interface] transition
	        ,transition : function(percent) {return Math.pow(1 - percent, 2);}
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            e.style[attr.value] = Math.floor(schedule * value) +"px";
	        }
	
	        //[Implement Interface] finish
	        ,finish : function(){baidu.dom.hide(e);}
	    }, options || {}), "baidu.fx.expand_collapse");
	
	    return fx.launch();
	};
	
	// [TODO] 20100509 在元素绝对定位时，收缩到最后时会有一次闪烁
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.instance = function(){
	    var maps = baidu.global("_maps_id");
	
	    return function (guid) {
	        return maps[ guid ] || null;
	    };
	}();
	
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.fx.current = function(element) {
	    if (!(element = baidu.dom.g(element))) return null;
	    var a, guids, reg = /\|([^\|]+)\|/g;
	
	    // 可以向<html>追溯
	    do {if (guids = element.getAttribute("baidu_current_effect")) break;}
	    while ((element = element.parentNode) && element.nodeType == 1);
	
	    if (!guids) return null;
	
	    if ((a = guids.match(reg))) {
	        //fix
	        //在firefox中使用g模式，会出现ture与false交替出现的问题
	        reg = /\|([^\|]+)\|/;
	        
	        for (var i=0; i<a.length; i++) {
	            reg.test(a[i]);
	//            a[i] = window[baidu.guid]._instances[RegExp["\x241"]];
	            a[i] = baidu.lang.instance(RegExp["\x241"]);
	        }
	    }
	    return a;
	};
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.expand = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    var e = element, 
	        value, 
	        attr,
	        attrHV = {
	            "vertical": {
	                value: 'height',
	                offset: 'offsetHeight',
	                stylesValue: ["paddingBottom","paddingTop","borderTopWidth","borderBottomWidth"]
	            },
	            "horizontal": {
	                value: 'width',
	                offset: 'offsetWidth',
	                stylesValue: ["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
	            }
	        };
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        orientation: 'vertical'
	        
	        //[Implement Interface] initialize
	        ,initialize : function() {
	            attr = attrHV[this.orientation];
	            baidu.dom.show(e);
	            this.protect(attr.value);
	            this.protect("overflow");
	            this.restoreAfterFinish = true;
	            value = e[attr.offset];
	            
	            function getStyleNum(d,style){
	                var result = parseInt(baidu.dom.getStyle(d,style));
	                result = isNaN(result) ? 0 : result;
	                result = baidu.lang.isNumber(result) ? result : 0;
	                return result;
	            }
	            
	            baidu.forEach(attr.stylesValue, function(item){
	                value -= getStyleNum(e,item);
	            });
	            e.style.overflow = "hidden";
	            e.style[attr.value] = "1px";
	        }
	
	        //[Implement Interface] transition
	        ,transition : function(percent) {return Math.sqrt(percent);}
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            e.style[attr.value] = Math.floor(schedule * value) +"px";
	        }
	    }, options || {}), "baidu.fx.expand_collapse");
	
	    return fx.launch();
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.opacity = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    options = baidu.object.extend({from: 0,to: 1}, options||{});
	
	    var e = element;
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {
	            baidu.dom.show(element);
	
	            if (baidu.browser.ie) {
	                this.protect("filter");
	            } else {
	                this.protect("opacity");
	                this.protect("KHTMLOpacity");
	            }
	
	            this.distance = this.to - this.from;
	        }
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            var n = this.distance * schedule + this.from;
	
	            if(!baidu.browser.ie) {
	                e.style.opacity = n;
	                e.style.KHTMLOpacity = n;
	            } else {
	                e.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
	                    Math.floor(n * 100) +")";
	            }
	        }
	    }, options), "baidu.fx.opacity");
	
	    return fx.launch();
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.fadeIn = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    var fx = baidu.fx.opacity(element,
	        baidu.object.extend({from:0, to:1, restoreAfterFinish:true}, options||{})
	    );
	    fx.__type = "baidu.fx.fadeIn";
	
	    return fx;
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.fadeOut = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    var fx = baidu.fx.opacity(element,
	        baidu.object.extend({from:1, to:0, restoreAfterFinish:true}, options||{})
	    );
	    fx.addEventListener("onafterfinish", function(){baidu.dom.hide(this.element);});
	    fx.__type = "baidu.fx.fadeOut";
	
	    return fx;
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.fx.getTransition = function(name) {
	    var a = baidu.fx.transitions;
	    if (!name || typeof a[name] != "string") name = "linear";
	    return new Function("percent", a[name]);
	};
	
	baidu.fx.transitions = {
	    none : "return 0"
	    ,full : "return 1"
	    ,linear : "return percent"  // 斜线
	    ,reverse : "return 1 - percent" // 反斜线
	    ,parabola : "return Math.pow(percent, 2)"   // 抛物线
	    ,antiparabola : "return 1 - Math.pow(1 - percent, 2)"   // 反抛物线
	    ,sinoidal : "return (-Math.cos(percent * Math.PI)/2) + 0.5" // 正弦波
	    ,wobble : "return (-Math.cos(percent * Math.PI * (9 * percent))/2) + 0.5"   // 摇晃
	    ,spring : "return 1 - (Math.cos(percent * 4.5 * Math.PI) * Math.exp(-percent * 6))" // 弹性阴尼
	};
	
	/// Tangram 1.x Code End
	
	baidu.string.extend({
	    formatColor: function(){
	        // 将正则表达式预创建，可提高效率
	        var reg1 = /^\#[\da-f]{6}$/i,
	            reg2 = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i,
	            keyword = {
	                black: '#000000',
	                silver: '#c0c0c0',
	                gray: '#808080',
	                white: '#ffffff',
	                maroon: '#800000',
	                red: '#ff0000',
	                purple: '#800080',
	                fuchsia: '#ff00ff',
	                green: '#008000',
	                lime: '#00ff00',
	                olive: '#808000',
	                yellow: '#ffff0',
	                navy: '#000080',
	                blue: '#0000ff',
	                teal: '#008080',
	                aqua: '#00ffff'
	            };
	            
	        return function(){
	            var color = this.valueOf();
	            if(reg1.test(color)) {
	                // #RRGGBB 直接返回
	                return color;
	            } else if(reg2.test(color)) {
	                // 非IE中的 rgb(0, 0, 0)
	                for (var s, i=1, color="#"; i<4; i++) {
	                    s = parseInt(RegExp["\x24"+ i]).toString(16);
	                    color += ("00"+ s).substr(s.length);
	                }
	                return color;
	            } else if(/^\#[\da-f]{3}$/.test(color)) {
	                // 简写的颜色值: #F00
	                var s1 = color.charAt(1),
	                    s2 = color.charAt(2),
	                    s3 = color.charAt(3);
	                return "#"+ s1 + s1 + s2 + s2 + s3 + s3;
	            }else if(keyword[color])
	                return keyword[color];
	            
	            return '';
	        }
	    }()
	});
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.highlight = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    var e = element;
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {
	            var me = this,
	                CS = baidu.dom.getStyle,
	                FC = baidu.string.formatColor,
	                color = FC(CS(e, "color")) || "#000000",
	                bgc   = FC(CS(e, "backgroundColor"));
	
	            // 给用户指定的四个配置参数做一个保护值
	            me.beginColor = me.beginColor || bgc || "#FFFF00";
	            me.endColor   = me.endColor   || bgc || "#FFFFFF";
	            me.finalColor = me.finalColor || me.endColor || me.element.style.backgroundColor;
	            me.textColor == color && (me.textColor = "");
	
	            this.protect("color");
	            this.protect("backgroundColor");
	
	            me.c_b = []; me.c_d = []; me.t_b = []; me.t_d = [];
	            for (var n, i=0; i<3; i++) {
	                n = 2 * i + 1;
	                me.c_b[i]=parseInt(me.beginColor.substr(n, 2), 16);
	                me.c_d[i]=parseInt(me.endColor.substr(n, 2), 16) - me.c_b[i];
	
	                // 如果指定了文字的颜色，则文字颜色也渐变
	                if (me.textColor) {
	                    me.t_b[i]=parseInt(color.substr(n, 2), 16);
	                    me.t_d[i]=parseInt(me.textColor.substr(n,2),16)-me.t_b[i];
	                }
	            }
	        }
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            for (var me=this, a="#", b="#", n, i=0; i<3; i++) {
	                n = Math.round(me.c_b[i] + me.c_d[i] * schedule).toString(16);
	                a += ("00"+ n).substr(n.length);
	
	                // 如果指定了文字的颜色，则文字颜色也渐变
	                if (me.textColor) {
	                    n = Math.round(me.t_b[i]+me.t_d[i]*schedule).toString(16);
	                    b += ("00"+ n).substr(n.length);
	                }
	            }
	            e.style.backgroundColor = a;
	            me.textColor && (e.style.color = b);
	        }
	
	        //[Implement Interface] finish
	        ,finish : function(){
	            this.textColor && (e.style.color = this.textColor);
	            e.style.backgroundColor = this.finalColor;
	        }
	    }, options || {}), "baidu.fx.highlight");
	
	    return fx.launch();
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.fx.mask = function(element, options) {
	    // mask 效果只适用于绝对定位的DOM元素
	    if (!(element = baidu.dom.g(element)) ||
	        baidu.dom.getStyle(element, "position") != "absolute")
	        return null;
	
	    var e = element, original = {};
	    options = options || {};
	
	    // [startOrigin] "0px 0px" "50% 50%" "top left"
	    var r = /^(\d+px|\d?\d(\.\d+)?%|100%|left|center|right)(\s+(\d+px|\d?\d(\.\d+)?%|100%|top|center|bottom))?/i;
	    !r.test(options.startOrigin) && (options.startOrigin = "0px 0px");
	
	    var options = baidu.object.extend({restoreAfterFinish:true, from:0, to:1}, options || {});
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {
	            e.style.display = "";
	            this.protect("clip");
	            original.width = e.offsetWidth;
	            original.height = e.offsetHeight;
	
	            // 计算效果起始点坐标
	            r.test(this.startOrigin);
	            var t1 = RegExp["\x241"].toLowerCase(),
	                t2 = RegExp["\x244"].toLowerCase(),
	                ew = this.element.offsetWidth,
	                eh = this.element.offsetHeight,
	                dx, dy;
	
	            if (/\d+%/.test(t1)) dx = parseInt(t1, 10) / 100 * ew;
	            else if (/\d+px/.test(t1)) dx = parseInt(t1);
	            else if (t1 == "left") dx = 0;
	            else if (t1 == "center") dx = ew / 2;
	            else if (t1 == "right") dx = ew;
	
	            if (!t2) dy = eh / 2;
	            else {
	                if (/\d+%/.test(t2)) dy = parseInt(t2, 10) / 100 * eh;
	                else if (/\d+px/.test(t2)) dy = parseInt(t2);
	                else if (t2 == "top") dy = 0;
	                else if (t2 == "center") dy = eh / 2;
	                else if (t2 == "bottom") dy = eh;
	            }
	            original.x = dx;
	            original.y = dy;
	        }
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            var n = this.to * schedule + this.from * (1 - schedule),
	                top = original.y * (1 - n) +"px ",
	                left = original.x * (1 - n) +"px ",
	                right = original.x * (1 - n) + original.width * n +"px ",
	                bottom = original.y * (1 - n) + original.height * n +"px ";
	            e.style.clip = "rect("+ top + right + bottom + left +")";
	        }
	
	        //[Implement Interface] finish
	        ,finish : function(){
	            if (this.to < this.from) e.style.display = "none";
	        }
	    }, options), "baidu.fx.mask");
	
	    return fx.launch();
	};
	
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	 
	
	baidu.fx.move = function(element, options) {
	    if (!(element = baidu.dom.g(element))
	        || baidu.dom.getStyle(element, "position") == "static") return null;
	    
	    options = baidu.object.extend({x:0, y:0}, options || {});
	    if (options.x == 0 && options.y == 0) return null;
	
	    var fx = baidu.fx.create(element, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {
	            this.protect("top");
	            this.protect("left");
	
	            this.originX = parseInt(baidu.dom.getStyle(element, "left"))|| 0;
	            this.originY = parseInt(baidu.dom.getStyle(element, "top")) || 0;
	        }
	
	        //[Implement Interface] transition
	        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            element.style.top  = (this.y * schedule + this.originY) +"px";
	            element.style.left = (this.x * schedule + this.originX) +"px";
	        }
	    }, options), "baidu.fx.move");
	
	    return fx.launch();
	};
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.moveBy = function(element, distance, options) {
	    if (!(element = baidu.dom.g(element))
	        || baidu.dom.getStyle(element, "position") == "static"
	        || typeof distance != "object") return null;
	
	    var d = {};
	    d.x = distance[0] || distance.x || 0;
	    d.y = distance[1] || distance.y || 0;
	
	    var fx = baidu.fx.move(element, baidu.object.extend(d, options||{}));
	
	    return fx;
	};
	
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	 
	
	baidu.fx.moveTo = function(element, point, options) {
	    if (!(element = baidu.dom.g(element))
	        || baidu.dom.getStyle(element, "position") == "static"
	        || typeof point != "object") return null;
	
	    var p = [point[0] || point.x || 0,point[1] || point.y || 0];
	    var x = parseInt(baidu.dom.getStyle(element, "left")) || 0;
	    var y = parseInt(baidu.dom.getStyle(element, "top"))  || 0;
	
	    var fx = baidu.fx.move(element, baidu.object.extend({x: p[0]-x, y: p[1]-y}, options||{}));
	
	    return fx;
	};
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.fx.scale = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	    options = baidu.object.extend({from : 0.1,to : 1}, options || {});
	
	    // "0px 0px" "50% 50%" "top left"
	    var r = /^(-?\d+px|\d?\d(\.\d+)?%|100%|left|center|right)(\s+(-?\d+px|\d?\d(\.\d+)?%|100%|top|center|bottom))?/i;
	    !r.test(options.transformOrigin) && (options.transformOrigin = "0px 0px");
	
	    var original = {},
	        fx = baidu.fx.create(element, baidu.object.extend({
	        fade: true,
	            
	        //[Implement Interface] initialize
	        initialize : function() {
	            baidu.dom.show(element);
	            var me = this,
	                o = original,
	                s = element.style,
	                save    = function(k){me.protect(k)};
	
	            // IE浏览器使用 zoom 样式放大
	            if (baidu.browser.ie) {
	                save("top");
	                save("left");
	                save("position");
	                save("zoom");
	                save("filter");
	
	                this.offsetX = parseInt(baidu.dom.getStyle(element, "left")) || 0;
	                this.offsetY = parseInt(baidu.dom.getStyle(element, "top"))  || 0;
	
	                if (baidu.dom.getStyle(element, "position") == "static") {
	                    s.position = "relative";
	                }
	
	                // IE 的ZOOM没有起始点，以下代码就是实现起始点
	                r.test(this.transformOrigin);
	                var t1 = RegExp["\x241"].toLowerCase(),
	                    t2 = RegExp["\x244"].toLowerCase(),
	                    ew = this.element.offsetWidth,
	                    eh = this.element.offsetHeight,
	                    dx, dy;
	
	                if (/\d+%/.test(t1)) dx = parseInt(t1, 10) / 100 * ew;
	                else if (/\d+px/.test(t1)) dx = parseInt(t1);
	                else if (t1 == "left") dx = 0;
	                else if (t1 == "center") dx = ew / 2;
	                else if (t1 == "right") dx = ew;
	
	                if (!t2) dy = eh / 2;
	                else {
	                    if (/\d+%/.test(t2)) dy = parseInt(t2, 10) / 100 * eh;
	                    else if (/\d+px/.test(t2)) dy = parseInt(t2);
	                    else if (t2 == "top") dy = 0;
	                    else if (t2 == "center") dy = eh / 2;
	                    else if (t2 == "bottom") dy = eh;
	                }
	
	                // 设置初始的比例
	                s.zoom = this.from;
	                o.cx = dx; o.cy = dy;   // 放大效果起始原点坐标
	            } else {
	                save("WebkitTransform");
	                save("WebkitTransformOrigin");   // Chrome Safari
	                save("MozTransform");
	                save("MozTransformOrigin");         // Firefox Mozllia
	                save("OTransform");
	                save("OTransformOrigin");             // Opera 10.5 +
	                save("transform");
	                save("transformOrigin");               // CSS3
	                save("opacity");
	                save("KHTMLOpacity");
	
	                // 设置初始的比例和效果起始点
	                s.WebkitTransform =
	                    s.MozTransform =
	                    s.OTransform =
	                    s.transform = "scale("+ this.from +")";
	
	                s.WebkitTransformOrigin = 
	                    s.MozTransformOrigin = 
	                    s.OTransformOrigin =
	                    s.transformOrigin = this.transformOrigin;
	            }
	        }
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            var s = element.style,
	                b = this.to == 1,
	                b = typeof this.opacityTrend == "boolean" ? this.opacityTrend : b,
	                p = b ? this.percent : 1 - this.percent,
	                n = this.to * schedule + this.from * (1 - schedule);
	
	            if (baidu.browser.ie) {
	                s.zoom = n;
	                if(this.fade){
	                    s.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
	                        Math.floor(p * 100) +")";
	                }
	                
	                // IE 下得计算 transform-origin 变化
	                s.top = this.offsetY + original.cy * (1 - n);
	                s.left= this.offsetX + original.cx * (1 - n);
	            } else {
	                s.WebkitTransform =
	                    s.MozTransform =
	                    s.OTransform =
	                    s.transform = "scale("+ n +")";
	                if(this.fade){
	                    s.KHTMLOpacity = s.opacity = p;
	                }
	            }
	        }
	    }, options), "baidu.fx.scale");
	
	    return fx.launch();
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.zoomOut = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    options = baidu.object.extend({
	        to:0.1
	        ,from:1
	        ,opacityTrend:false
	        ,restoreAfterFinish:true
	        ,transition:function(n){return 1 - Math.pow(1 - n, 2);}
	    },  options||{});
	
	    var effect = baidu.fx.scale(element, options);
	    effect.addEventListener("onafterfinish", function(){baidu.dom.hide(this.element);});
	
	    return effect;
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.fx.puff = function(element, options) {
	    return baidu.fx.zoomOut(element,
	        baidu.object.extend({
	            to:1.8
	            ,duration:800
	            ,transformOrigin:"50% 50%"
	        }, options||{})
	    );
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.pulsate = function(element, loop, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	    if (isNaN(loop) || loop == 0) return null;
	
	    var e = element;
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {this.protect("visibility");}
	
	        //[Implement Interface] transition
	        ,transition : function(percent) {return Math.cos(2*Math.PI*percent);}
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            e.style.visibility = schedule > 0 ? "visible" : "hidden";
	        }
	
	        //[Implement Interface] finish
	        ,finish : function(){
	            setTimeout(function(){
	                baidu.fx.pulsate(element, --loop, options);
	            }, 10);
	        }
	    }, options), "baidu.fx.pulsate");
	
	    return fx.launch();
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.remove = function(element, options) {
	    var afterFinish = options.onafterfinish ? options.onafterfinish : new Function();
	    
	    return baidu.fx.fadeOut(element, baidu.object.extend(options||{}, {
	        onafterfinish: function(){
	            baidu.dom.remove(this.element);
	            afterFinish.call(this);
	        }
	    }));
	};
	
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	 
	
	baidu.fx.scrollBy = function(element, distance, options) {
	    if (!(element = baidu.dom.g(element)) || typeof distance != "object") return null;
	    
	    var d = {}, mm = {};
	    d.x = distance[0] || distance.x || 0;
	    d.y = distance[1] || distance.y || 0;
	
	    var fx = baidu.fx.create(element, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {
	            var t = mm.sTop   = element.scrollTop;
	            var l = mm.sLeft  = element.scrollLeft;
	
	            mm.sx = Math.min(element.scrollWidth - element.clientWidth - l, d.x);
	            mm.sy = Math.min(element.scrollHeight- element.clientHeight- t, d.y);
	        }
	
	        //[Implement Interface] transition
	        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            element.scrollTop  = (mm.sy * schedule + mm.sTop);
	            element.scrollLeft = (mm.sx * schedule + mm.sLeft);
	        }
	
	        ,restore : function(){
	            element.scrollTop   = mm.sTop;
	            element.scrollLeft  = mm.sLeft;
	        }
	    }, options), "baidu.fx.scroll");
	
	    return fx.launch();
	};
	
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	 
	
	baidu.fx.scrollTo = function(element, point, options) {
	    if (!(element = baidu.dom.g(element)) || typeof point != "object") return null;
	    
	    var d = {};
	    d.x = (point[0] || point.x || 0) - element.scrollLeft;
	    d.y = (point[1] || point.y || 0) - element.scrollTop;
	
	    return baidu.fx.scrollBy(element, d, options);
	};
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.shake = function(element, offset, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    var e = element;
	    offset = offset || [];
	    function tt() {
	        for (var i=0; i<arguments.length; i++) {
	            if (!isNaN(arguments[i])) return arguments[i];
	        }
	    }
	
	    var fx = baidu.fx.create(e, baidu.object.extend({
	        //[Implement Interface] initialize
	        initialize : function() {
	            this.protect("top");
	            this.protect("left");
	            this.protect("position");
	            this.restoreAfterFinish = true;
	
	            if (baidu.dom.getStyle(e, "position") == "static") {
	                e.style.position = "relative";
	            }
				var original = this['\x06original'];
	            this.originX = parseInt(original.left|| 0);
	            this.originY = parseInt(original.top || 0);
	            this.offsetX = tt(offset[0], offset.x, 16);
	            this.offsetY = tt(offset[1], offset.y, 5);
	        }
	
	        //[Implement Interface] transition
	        ,transition : function(percent) {
	            var line = 1 - percent;
	            return Math.floor(line * 16) % 2 == 1 ? line : percent - 1;
	        }
	
	        //[Implement Interface] render
	        ,render : function(schedule) {
	            e.style.top  = (this.offsetY * schedule + this.originY) +"px";
	            e.style.left = (this.offsetX * schedule + this.originX) +"px";
	        }
	    }, options || {}), "baidu.fx.shake");
	
	    return fx.launch();
	};
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	 
	
	baidu.fx.zoomIn = function(element, options) {
	    if (!(element = baidu.dom.g(element))) return null;
	
	    options = baidu.object.extend({
	        to:1
	        ,from:0.1
	        ,restoreAfterFinish:true
	        ,transition:function(n){return Math.pow(n, 2)}
	    },  options||{});
	
	    return baidu.fx.scale(element, options);
	};
	
	/// Tangram 1.x Code End
	
	baidu.get = baidu.get || baidu._util_.smartAjax('get');
	/// Tangram 1.x Code Start
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.global.get = function(key){
	    return baidu.global(key);
	}
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.global.set = function(key, value, overwrite){
	    return baidu.global(key, value, !overwrite);
	}
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.global.getZIndex = function(key, step) {
		var zi = baidu.global.get("zIndex");
		if (key) {
			zi[key] = zi[key] + (step || 1);
		}
		return zi[key];
	};
	baidu.global.set("zIndex", {popup : 50000, dialog : 1000}, true);
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.i18n = baidu.i18n || {};
	/// support magic - Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.i18n.cultures = baidu.i18n.cultures || {};
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.i18n.cultures['en-US'] = baidu.object.extend(baidu.i18n.cultures['en-US'] || {}, {
	    calendar: {
	        dateFormat: 'yyyy-MM-dd',
	        titleNames: '#{MM}&nbsp;#{yyyy}',
	        monthNames: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
	        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	        dayNames: {mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'}
	    },
	    
	    timeZone: -5,
	    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),
	
	    number: {
	        group: ",",
	        groupLength: 3,
	        decimal: ".",
	        positive: "",
	        negative: "-",
	
	        _format: function(number, isNegative){
	            return baidu.i18n.number._format(number, {
	                group: this.group,
	                groupLength: this.groupLength,
	                decimal: this.decimal,
	                symbol: isNegative ? this.negative : this.positive 
	            });
	        }
	    },
	
	    currency: {
	        symbol: '$'           
	    },
	
	    language: {
	        ok: 'ok',
	        cancel: 'cancel',
	        signin: 'signin',
	        signup: 'signup'
	    }
	});
	
	baidu.i18n.currentLocale = 'en-US';
	
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.i18n.cultures['zh-CN'] = baidu.object.extend(baidu.i18n.cultures['zh-CN'] || {}, {
	    calendar: {
	        dateFormat: 'yyyy-MM-dd',
	        titleNames: '#{yyyy}年&nbsp;#{MM}月',
	        monthNames: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
	        monthNamesShort: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	        dayNames: {mon: '一', tue: '二', wed: '三', thu: '四', fri: '五', sat: '六', sun: '日'}
	    },
	    
	    timeZone: 8,
	    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),
	    
	    number: {
	        group: ",",
	        groupLength: 3,
	        decimal: ".",
	        positive: "",
	        negative: "-",
	
	        _format: function(number, isNegative){
	            return baidu.i18n.number._format(number, {
	                group: this.group,
	                groupLength: this.groupLength,
	                decimal: this.decimal,
	                symbol: isNegative ? this.negative : this.positive 
	            });
	        }
	    },
	
	    currency: {
	        symbol: '￥'  
	    },
	
	    language: {
	        ok: '确定',
	        cancel: '取消',
	        signin: '注册',
	        signup: '登录'
	    }
	});
	
	baidu.i18n.currentLocale = 'zh-CN';
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.i18n.number = baidu.i18n.number || {
	
	    
	    format: function(number, sLocale, tLocale){
	        var me = this,
	            sOpt = sLocale && baidu.i18n.cultures[sLocale].number,
	            tOpt = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].number,
	            isNegative = false;
	
	        if(typeof number === 'string'){
	            
	            if(number.indexOf(sOpt.negative) > -1){
	                isNegative = true;
	                number = number.replace(sOpt.negative, "");   
	            }else if(number.indexOf(sOpt.positive) > -1){
	                number = number.replace(sOpt.positive, "");
	            }
	            number = number.replace(new RegExp(sOpt.group,'g'), "");
	        }else{
	            if(number < 0){
	                isNegative = true;
	                number *= -1;       
	            }
	        }
	        number = parseFloat(number);
	        if(isNaN(number)){
	            return 'NAN'; 
	        }
	        
	        return tOpt._format ? tOpt._format(number, isNegative) : me._format(number, {
	            group: tOpt.group || ',',
	            decimal: tOpt.decimal || '.',
	            groupLength: tOpt.groupLength,
	            symbol: isNegative ? tOpt.negative : tOpt.positive
	        });
	    },
	
	    
	    _format: function(number, options){
	        var numberArray = String(number).split(options.decimal),
	            preNum = numberArray[0].split('').reverse(),
	            aftNum = numberArray[1] || '',
	            len = 0,remainder = 0,
	            result = '';
	        
	        len = parseInt(preNum.length / options.groupLength);
	        remainder = preNum.length % options.groupLength;
	        len = remainder == 0 ? len - 1 : len;
	
	        for(var i = 1; i <= len; i++){
	            preNum.splice(options.groupLength * i + (i - 1), 0, options.group);    
	        }
	        preNum = preNum.reverse();
	        result = options.symbol + preNum.join('') + (aftNum.length > 0 ? options.decimal + aftNum : '');
	
	        return result;
	    }
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.i18n.currency = baidu.i18n.currency || {
	    
	    
	    format: function(number, sLocale, tLocale) {
	        var me = this,
	            sOpt = sLocale && baidu.i18n.cultures[sLocale].currency,
	            tOpt = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].currency,
	            result;
	
	        if(typeof number === "string"){
	            number = number.replace(sOpt.symbol);
	        }
	        
	        return tOpt.symbol + this._format(number, sLocale, tLocale);
	    },
	
	    
	    _format: function(number, sLocale, tLocale){
	        return baidu.i18n.number.format(number, sLocale, tLocale || baidu.i18n.currentLocale); 
	    }
	};
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.i18n.date = baidu.i18n.date || {
	
	    
	    getDaysInMonth: function(year, month) {
	        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	        if (month == 1 && baidu.i18n.date.isLeapYear(year)) {
	            return 29;
	        }
	        return days[month];
	    },
	
	    
	    isLeapYear: function(year) {
	        return !(year % 400) || (!(year % 4) && !!(year % 100));
	    },
	
	    
	    toLocaleDate: function(dateObject, sLocale, tLocale) {
	        return this._basicDate(dateObject, sLocale, tLocale || baidu.i18n.currentLocale);
	    },
	
	    
	    _basicDate: function(dateObject, sLocale, tLocale) {
	        var tTimeZone = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].timeZone,
	            tTimeOffset = tTimeZone * 60,
	            sTimeZone,sTimeOffset,
	            millisecond = dateObject.getTime();
	
	        if(sLocale){
	            sTimeZone = baidu.i18n.cultures[sLocale].timeZone;
	            sTimeOffset = sTimeZone * 60;
	        }else{
	            sTimeOffset = -1 * dateObject.getTimezoneOffset();
	            sTimeZone = sTimeOffset / 60;
	        }
	
	        return new Date(sTimeZone != tTimeZone ? (millisecond  + (tTimeOffset - sTimeOffset) * 60000) : millisecond);
	    },
	
	    
	    format: function(dateObject, tLocale) {
	        // 拿到对应locale的format类型配置
	        var c = baidu.i18n.cultrues[tLocale || baidu.i18n.currentLocale];
	        return baidu.date.format(
	            baidu.i18n.date.toLocaleDate(dateObject, "", tLocale),
	            c.calendar.dateFormat);
	    }
	};
	/// support magic -  Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.i18n.string = baidu.i18n.string || {
	    
	    
	    trim: function(source, locale){
	        var pat = baidu.i18n.cultures[locale || baidu.i18n.currentLocale].whitespace;
	        return String(source).replace(pat,"");
	    },
	
	    
	    translation: function(source, locale){
	        var tOpt = baidu.i18n.cultures[locale || baidu.i18n.currentLocale].language;
	
	        return tOpt[source] || '';
	    }
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.json.decode = baidu.json.parse;
	
	/// Tangram 1.x Code End
	
	baidu.json.stringify = (function () {
	    
	    var escapeMap = {
	        "\b": '\\b',
	        "\t": '\\t',
	        "\n": '\\n',
	        "\f": '\\f',
	        "\r": '\\r',
	        '"' : '\\"',
	        "\\": '\\\\'
	    };
	    
	    
	    function encodeString(source) {
	        if (/["\\\x00-\x1f]/.test(source)) {
	            source = source.replace(
	                /["\\\x00-\x1f]/g, 
	                function (match) {
	                    var c = escapeMap[match];
	                    if (c) {
	                        return c;
	                    }
	                    c = match.charCodeAt();
	                    return "\\u00" 
	                            + Math.floor(c / 16).toString(16) 
	                            + (c % 16).toString(16);
	                });
	        }
	        return '"' + source + '"';
	    }
	    
	    
	    function encodeArray(source) {
	        var result = ["["], 
	            l = source.length,
	            preComma, i, item;
	            
	        for (i = 0; i < l; i++) {
	            item = source[i];
	            
	            switch (typeof item) {
	            case "undefined":
	            case "function":
	            case "unknown":
	                break;
	            default:
	                if(preComma) {
	                    result.push(',');
	                }
	                result.push(baidu.json.stringify(item));
	                preComma = 1;
	            }
	        }
	        result.push("]");
	        return result.join("");
	    }
	    
	    
	    function pad(source) {
	        return source < 10 ? '0' + source : source;
	    }
	    
	    
	    function encodeDate(source){
	        return '"' + source.getFullYear() + "-" 
	                + pad(source.getMonth() + 1) + "-" 
	                + pad(source.getDate()) + "T" 
	                + pad(source.getHours()) + ":" 
	                + pad(source.getMinutes()) + ":" 
	                + pad(source.getSeconds()) + '"';
	    }
	    
	    return function (value) {
	        switch (typeof value) {
	        case 'undefined':
	            return 'undefined';
	            
	        case 'number':
	            return isFinite(value) ? String(value) : "null";
	            
	        case 'string':
	            return encodeString(value);
	            
	        case 'boolean':
	            return String(value);
	            
	        default:
	            if (value === null) {
	                return 'null';
	            } else if (baidu.type(value) === 'array') {
	                return encodeArray(value);
	            } else if (baidu.type(value) === 'date') {
	                return encodeDate(value);
	            } else {
	                var result = ['{'],
	                    encode = baidu.json.stringify,
	                    preComma,
	                    item;
	                    
	                for (var key in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, key)) {
	                        item = value[key];
	                        switch (typeof item) {
	                        case 'undefined':
	                        case 'unknown':
	                        case 'function':
	                            break;
	                        default:
	                            if (preComma) {
	                                result.push(',');
	                            }
	                            preComma = 1;
	                            result.push(encode(key) + ':' + encode(item));
	                        }
	                    }
	                }
	                result.push('}');
	                return result.join('');
	            }
	        }
	    };
	})();
	
	/// Tangram 1.x Code Start
	
	baidu.json.encode = baidu.json.stringify;
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.global("_maps_id");
	
	//	[TODO]	meizz	在2012年版本中将删除此模块
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.Class.prototype.addEventListeners = function (events, fn) {
	    if(typeof fn == 'undefined'){
	        for(var i in events){
	            this.addEventListener(i, events[i]);
	        }
	    }else{
	        events = events.split(',');
	        var i = 0, len = events.length, event;
	        for(; i < len; i++){
	            this.addEventListener(baidu.trim(events[i]), fn);
	        }
	    }
	};
	
	/// Tangram 1.x Code End
	/// support magic - Tangram 1.x Code Start
	
	baidu.lang.createClass = function(constructor, options) {
	    options = options || {};
	    var superClass = options.superClass || baidu.lang.Class;
	
	    // 创建新类的真构造器函数
	    var fn = function(){
	        var me = this;
	
	        // 20101030 某类在添加该属性控制时，guid将不在全局instances里控制
	        options.decontrolled && (me.__decontrolled = true);
	
	        // 继承父类的构造器
	        superClass.apply(me, arguments);
	
	        // 全局配置
	        for (i in fn.options) me[i] = fn.options[i];
	
	        constructor.apply(me, arguments);
	
	        for (var i=0, reg=fn["\x06r"]; reg && i<reg.length; i++) {
	            reg[i].apply(me, arguments);
	        }
	    };
	
	    // [TODO delete 2013] 放置全局配置，这个全局配置可以直接写到类里面
	    fn.options = options.options || {};
	
	    var C = function(){},
	        cp = constructor.prototype;
	    C.prototype = superClass.prototype;
	
	    // 继承父类的原型（prototype)链
	    var fp = fn.prototype = new C();
	
	    // 继承传参进来的构造器的 prototype 不会丢
	    for (var i in cp) fp[i] = cp[i];
	
	    // 20111122 原className参数改名为type
	    var type = options.className || options.type;
	    typeof type == "string" && (fp.__type = type);
	
	    // 修正这种继承方式带来的 constructor 混乱的问题
	    fp.constructor = cp.constructor;
	
	    // 给类扩展出一个静态方法，以代替 baidu.object.extend()
	    fn.extend = function(json){
	        for (var i in json) {
	            fn.prototype[i] = json[i];
	        }
	        return fn;  // 这个静态方法也返回类对象本身
	    };
	
	    return fn;
	};
	
	// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
	
	/// support magic - Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.decontrol = function(){
	    var maps = baidu.global("_maps_id");
	
	    return function(guid) {
	        delete maps[guid];
	    };
	}();
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.eventCenter = baidu.lang.eventCenter || baidu.lang.createSingle();
	
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.getModule = function(name, opt_obj) {
	    var parts = name.split('.'),
	        cur = opt_obj || window,
	        part;
	    for (; part = parts.shift(); ) {
	        if (cur[part] != null) {
	            cur = cur[part];
	        } else {
	          return null;
	        }
	    }
	
	    return cur;
	};
	
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	//baidu.lang.isBoolean = function(o) {
	//    return typeof o === 'boolean';
	//};
	baidu.lang.isBoolean = baidu.isBoolean;
	/// Tangram 1.x Code End
	/// support maigc - Tangram 1.x Code Start
	
	//baidu.lang.isDate = function(o) {
	//    // return o instanceof Date;
	//    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
	//};
	
	baidu.lang.isDate = baidu.isDate;
	/// support maigc Tangram 1.x Code End
	/// support maigc - Tangram 1.x Code Start
	
	//baidu.lang.isElement = function (source) {
	//    return !!(source && source.nodeName && source.nodeType == 1);
	//};
	baidu.lang.isElement = baidu.isElement;
	/// support maigc - Tangram 1.x Code End
	
	//baidu.lang.isObject = function (source) {
	//    return 'function' == typeof source || !!(source && 'object' == typeof source);
	//};
	baidu.lang.isObject = baidu.isObject;
	/// Tangram 1.x Code Start
	
	//baidu.lang.isWindow = function(win){
	//    return !!win && win.window;
	//};
	baidu.lang.isWindow = function(unknow) {
	    return baidu.type(unknow) == "Window";
	};
	/// Tangram 1.x Code End
	/// Tangram 1.x Code Start
	
	baidu.lang.module = function(name, module, owner) {
	    var packages = name.split('.'),
	        len = packages.length - 1,
	        packageName,
	        i = 0;
	
	    // 如果没有owner，找当前作用域，如果当前作用域没有此变量，在window创建
	    if (!owner) {
	        try {
	            if (!(new RegExp('^[a-zA-Z_\x24][a-zA-Z0-9_\x24]*\x24')).test(packages[0])) {
	                throw '';
	            }
	            owner = window['eval'](packages[0]);
	            i = 1;
	        }catch (e) {
	            owner = window;
	        }
	    }
	
	    for (; i < len; i++) {
	        packageName = packages[i];
	        if (!owner[packageName]) {
	            owner[packageName] = {};
	        }
	        owner = owner[packageName];
	    }
	
	    if (!owner[packages[len]]) {
	        owner[packages[len]] = module;
	    }
	};
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.lang.register = function (Class, constructorHook, methods) {
	    var reg = Class["\x06r"] || (Class["\x06r"] = []);
	    reg[reg.length] = constructorHook;
	
	    for (var method in methods) {
	    	Class.prototype[method] = methods[method];
	    }
	};
	
	// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
	// 20111129	meizz	添加第三个参数，可以直接挂载方法到目标类原型链上
	/// support magic - Tangram 1.x Code End
	
	baidu.number.extend({
	    comma : function (length) {
	    	var source = this;
	        if (!length || length < 1) {
	            length = 3;
	        }
	    
	        source = String(source).split(".");
	        source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{'+length+'})+$)','ig'),"$1,");
	        return source.join(".");
	    }	
	});
	
	baidu.number.randomInt = function(min, max){
	    return Math.floor(Math.random() * (max - min + 1) + min);
	};
	
	baidu.object.clone  = function (source) {
	    var result = source, i, len;
	    if (!source
	        || source instanceof Number
	        || source instanceof String
	        || source instanceof Boolean) {
	        return result;
	    } else if (baidu.lang.isArray(source)) {
	        result = [];
	        var resultLen = 0;
	        for (i = 0, len = source.length; i < len; i++) {
	            result[resultLen++] = baidu.object.clone(source[i]);
	        }
	    } else if (baidu.object.isPlain(source)) {
	        result = {};
	        for (i in source) {
	            if (source.hasOwnProperty(i)) {
	                result[i] = baidu.object.clone(source[i]);
	            }
	        }
	    }
	    return result;
	};
	
	baidu.object.keys = function (source) {
	    var result = [], resultLen = 0, k;
	    for (k in source) {
	        if (source.hasOwnProperty(k)) {
	            result[resultLen++] = k;
	        }
	    }
	    return result;
	};
	
	baidu.object.map = function (source, iterator) {
	    var results = {};
	    for (var key in source) {
	        if (source.hasOwnProperty(key)) {
	            results[key] = iterator(source[key], key);
	        }
	    }
	    return results;
	};
	
	(function() {
	var isPlainObject = function(source) {
	        return baidu.lang.isObject(source) && !baidu.lang.isFunction(source);
	    };
	
	function mergeItem(target, source, index, overwrite, recursive) {
	    if (source.hasOwnProperty(index)) {
	        if (recursive && isPlainObject(target[index])) {
	            // 如果需要递归覆盖，就递归调用merge
	            baidu.object.merge(
	                target[index],
	                source[index],
	                {
	                    'overwrite': overwrite,
	                    'recursive': recursive
	                }
	            );
	        } else if (overwrite || !(index in target)) {
	            // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
	            target[index] = source[index];
	        }
	    }
	}
	
	baidu.object.merge = function(target, source, opt_options) {
	    var i = 0,
	        options = opt_options || {},
	        overwrite = options['overwrite'],
	        whiteList = options['whiteList'],
	        recursive = options['recursive'],
	        len;
	
	    // 只处理在白名单中的属性
	    if (whiteList && whiteList.length) {
	        len = whiteList.length;
	        for (; i < len; ++i) {
	            mergeItem(target, source, whiteList[i], overwrite, recursive);
	        }
	    } else {
	        for (i in source) {
	            mergeItem(target, source, i, overwrite, recursive);
	        }
	    }
	
	    return target;
	};
	})();
	
	/// Tangram 1.x Code Start
	
	baidu.page.createStyleSheet = function(options){
	    var op = options || {},
	        doc = op.document || document,
	        s;
	
	    if (baidu.browser.ie) {
	        //修复ie下会请求一个undefined的bug  berg 2010/08/27 
	        if(!op.url)
	            op.url = "";
	        return doc.createStyleSheet(op.url, op.index);
	    } else {
	        s = "<style type='text/css'></style>";
	        op.url && (s="<link type='text/css' rel='stylesheet' href='"+op.url+"'/>");
	        baidu.dom.insertHTML(doc.getElementsByTagName("HEAD")[0],"beforeEnd",s);
	        //如果用户传入了url参数，下面访问sheet.rules的时候会报错
	        if(op.url){
	            return null;
	        }
	
	        var sheet = doc.styleSheets[doc.styleSheets.length - 1],
	            rules = sheet.rules || sheet.cssRules;
	        return {
	            self : sheet
	            ,rules : sheet.rules || sheet.cssRules
	            ,addRule : function(selector, style, i) {
	                if (sheet.addRule) {
	                    return sheet.addRule(selector, style, i);
	                } else if (sheet.insertRule) {
	                    isNaN(i) && (i = rules.length);
	                    return sheet.insertRule(selector +"{"+ style +"}", i);
	                }
	            }
	            ,removeRule : function(i) {
	                if (sheet.removeRule) {
	                    sheet.removeRule(i);
	                } else if (sheet.deleteRule) {
	                    isNaN(i) && (i = 0);
	                    sheet.deleteRule(i);
	                }
	            }
	        }
	    }
	};
	
	/// Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.page.getHeight = function () {
	    var doc = document,
	        body = doc.body,
	        html = doc.documentElement,
	        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
	
	    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
	};
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.page.getViewHeight = function () {
		var de = document.documentElement.clientHeight,
		    db = document.body.clientHeight;
		return Math.min(de||db, db);
	};
	/// support magic - Tangram 1.x Code End
	
	/// support magic - Tangram 1.x Code Start
	
	baidu.page.getViewWidth = function () {
	    var doc = document,
	        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;
	
	    return client.clientWidth;
	};
	/// support magic - Tangram 1.x Code End
	/// support maigc - Tangram 1.x Code Start
	
	baidu.page.getWidth = function () {
	    var doc = document,
	        body = doc.body,
	        html = doc.documentElement,
	        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
	
	    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
	};
	/// support maigc - Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.page.lazyLoadImage = function(options) {
	    options = options || {};
	    options.preloadHeight = options.preloadHeight || 0;
	
	    baidu.dom.ready(function() {
	        var imgs = document.getElementsByTagName('IMG'),
	                targets = imgs,
	                len = imgs.length,
	                i = 0,
	                viewOffset = getLoadOffset(),
	                srcAttr = 'data-tangram-ori-src',
	                target;
	        //避免循环中每次都判断className
	        if (options.className) {
	            targets = [];
	            for (; i < len; ++i) {
	                if (baidu.dom.hasClass(imgs[i], options.className)) {
	                    targets.push(imgs[i]);
	                }
	            }
	        }
	        //计算需要加载图片的页面高度
	        function getLoadOffset() {
	            return baidu.page.getScrollTop() + baidu.page.getViewHeight() + options.preloadHeight;
	        }
	        //加载可视图片
	        for (i = 0, len = targets.length; i < len; ++i) {
	            target = targets[i];
	            if (baidu.dom.getPosition(target).top > viewOffset) {
	                target.setAttribute(srcAttr, target.src);
	                options.placeHolder ? target.src = options.placeHolder : target.removeAttribute('src');
	            }
	        }
	        //处理延迟加载
	        var loadNeeded = function() {
	            var viewOffset = getLoadOffset(),
	                imgSrc,
	                finished = true,
	                i = 0,
	                len = targets.length;
	            for (; i < len; ++i) {
	                target = targets[i];
	                imgSrc = target.getAttribute(srcAttr);
	                imgSrc && (finished = false);
	                if (baidu.dom.getPosition(target).top < viewOffset && imgSrc) {
	                    target.src = imgSrc;
	                    target.removeAttribute(srcAttr);
	                    baidu.lang.isFunction(options.onlazyload) && options.onlazyload(target);
	                }
	            }
	            //当全部图片都已经加载, 去掉事件监听
	            finished && baidu.dom(window).off('scroll', loadNeeded);
	        };
	
	        baidu.dom(window).on('scroll', loadNeeded);
	    });
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.page.load = function(resources, options, ignoreAllLoaded) {
	    //TODO failure, 整体onload能不能每个都调用; resources.charset
	    options = options || {};
	    var self = baidu.page.load,
	        cache = self._cache = self._cache || {},
	        loadingCache = self._loadingCache = self._loadingCache || {},
	        parallel = options.parallel;
	
	    function allLoadedChecker() {
	        for (var i = 0, len = resources.length; i < len; ++i) {
	            if (! cache[resources[i].url]) {
	                setTimeout(arguments.callee, 10);
	                return;
	            }
	        }
	        options.onload();
	    };
	
	    function loadByDom(res, callback) {
	        var node, loaded, onready;      
	        switch (res.type.toLowerCase()) {
	            case 'css' :
	                node = document.createElement('link');
	                node.setAttribute('rel', 'stylesheet');
	                node.setAttribute('type', 'text/css');
	                break;
	            case 'js' :
	                node = document.createElement('script');
	                node.setAttribute('type', 'text/javascript');
	                node.setAttribute('charset', res.charset || self.charset);
	                break;
	            case 'html' :
	                node = document.createElement('iframe');
	                node.frameBorder = 'none';
	                break;
	            default :
	                return;
	        }
	
	        var elem = baidu.dom(node);
	
	        // HTML,JS works on all browsers, CSS works only on IE.
	        onready = function() {
	            if (!loaded && (!this.readyState ||
	                    this.readyState === 'loaded' ||
	                    this.readyState === 'complete')) {
	                loaded = true;
	                // 防止内存泄露
	                elem.off('load', onready);
	                elem.off('readystatechange', onready);
	                //node.onload = node.onreadystatechange = null;
	                callback.call(window, node);
	            }
	        };
	        elem.on('load', onready);
	        elem.on('readystatechange', onready);
	        //CSS has no onload event on firefox and webkit platform, so hack it.
	        if (res.type == 'css') {
	            (function() {
	                //避免重复加载
	                if (loaded) return;
	                try {
	                    node.sheet.cssRule;
	                } catch (e) {
	                    setTimeout(arguments.callee, 20);
	                    return;
	                }
	                loaded = true;
	                callback.call(window, node);
	            })();
	        }
	
	        node.href = node.src = res.url;
	        document.getElementsByTagName('head')[0].appendChild(node);
	    }
	
	    //兼容第一个参数直接是资源地址.
	    baidu.lang.isString(resources) && (resources = [{url: resources}]);
	
	    //避免递归出错,添加容错.
	    if (! (resources && resources.length)) return;
	
	    function loadResources(res) {
	        var url = res.url,
	            shouldContinue = !!parallel,
	            cacheData,
	            callback = function(textOrNode) {
	                //ajax存入responseText,dom存入节点,用于保证onload的正确执行.
	                cache[res.url] = textOrNode;
	                delete loadingCache[res.url];
	
	                if (baidu.lang.isFunction(res.onload)) {
	                    //若返回false, 则停止接下来的加载.
	                    if (false === res.onload.call(window, textOrNode)) {
	                        return;
	                    }
	                }
	                //串行时递归执行
	                !parallel && self(resources.slice(1), options, true);
	                if ((! ignoreAllLoaded) && baidu.lang.isFunction(options.onload)) {
	                    allLoadedChecker();
	                }
	            };
	        //默认用后缀名, 并防止后缀名大写
	        res.type = res.type || url.replace(/^[^\?#]+\.(css|js|html)(\?|#| |$)[^\?#]*/i, '$1'); //[bugfix]修改xxx.js?v这种情况下取不到js的问题。 
	        //默认html格式用ajax请求,其他都使用dom标签方式请求.
	        res.requestType = res.requestType || (res.type == 'html' ? 'ajax' : 'dom');
	
	        if (cacheData = cache[res.url]) {
	            callback(cacheData);
	            return shouldContinue;
	        }
	        if (!options.refresh && loadingCache[res.url]) {
	            setTimeout(function() {loadResources(res);}, 10);
	            return shouldContinue;
	        }
	        loadingCache[res.url] = true;
	        if (res.requestType.toLowerCase() == 'dom') {
	            loadByDom(res, callback);
	        }else {//ajax
	            baidu.ajax.get(res.url, function(xhr, responseText) {callback(responseText);});
	        }
	        //串行模式,通过callback方法执行后续
	        return shouldContinue;
	    };
	
	    baidu.forEach(resources, loadResources);
	};
	//默认编码设置为UTF8
	baidu.page.load.charset = 'UTF8';
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.page.loadCssFile = function (path) {
	    var element = document.createElement("link");
	    
	    element.setAttribute("rel", "stylesheet");
	    element.setAttribute("type", "text/css");
	    element.setAttribute("href", path);
	
	    document.getElementsByTagName("head")[0].appendChild(element);        
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.page.loadJsFile = function (path) {
	    var element = document.createElement('script');
	
	    element.setAttribute('type', 'text/javascript');
	    element.setAttribute('src', path);
	    element.setAttribute('defer', 'defer');
	
	    document.getElementsByTagName("head")[0].appendChild(element);    
	};
	/// Tangram 1.x Code End
	
	baidu.param = function(arg) {
		arg = arg || arguments.callee.caller.arguments;
	
		var s = "",
			n = arg.length;
	
		for (var i = 0; i < n; i++) {
			s += "," + baidu.type(arg[i]);
		}
	
		return s ? s.substr(1) : "";
	};
	
	// [Notice] meizz callee等操作是一个低性能的处理，因此 arg 参数尽量传过来，尽管不传这个参数本方法也能正确执行
	// [Notice] meizz 本方法是一个被其它方法调用的方法，在不传arg又不是被调用的状态下，本方法会报错
	
	baidu.platform = baidu.platform || function(){
	    var ua = navigator.userAgent,
	        result = function(){};
	
	    baidu.forEach("Android iPad iPhone Linux Macintosh Windows X11".split(" "), function(item ) {
	        var key = item.charAt(0).toUpperCase() + item.toLowerCase().substr( 1 );
	        baidu[ "is" + key ] = result[ "is" + key ] = ua.indexOf( item ) > -1;//) && (result = item);
	    });
	
	    return result;
	}();
	
	//baidu.platform.isAndroid = /android/i.test(navigator.userAgent);
	
	//baidu.platform.isIpad = /ipad/i.test(navigator.userAgent);
	
	//baidu.platform.isIphone = /iphone/i.test(navigator.userAgent);
	
	//baidu.platform.isMacintosh = /macintosh/i.test(navigator.userAgent);
	
	 
	//baidu.platform.isWindows = /windows/i.test(navigator.userAgent);
	
	//baidu.platform.isX11 = /x11/i.test(navigator.userAgent);
	
	baidu.post = baidu.post || baidu._util_.smartAjax('post');
	/// Tangram 1.x Code Start
	/// Tangram 1.x Code End
	
	baidu.regexp = baidu.regexp || function(maps){
		var modalReg = /[^mig]/;
	
	    return function(reg, modal){
	        var key, result;
	
	        if ( baidu.isString(reg) ) {
	        
	        	modalReg.test(modal) && (modal = "");
	            key = reg + "$$" + (modal || "");
	            (result = maps[ key ]) || (result = maps[ key ] = new RegExp( reg, modal ));
	        
	        } else if ( baidu.isRegExp(reg) ) {
	        
	            modal = (reg.global ? "g" : "") + (reg.ignoreCase ? "i" : "") + (reg.multiline ? "m" : "");
	            key = reg.source + "$$" + modal;
	            result = maps[key] || (maps[key] = reg);
	        }
	
	        // 注意：加了这句代码之后，会对 g 模式的 lastIndex 赋值的情况产生影响
	        (result || (result = reg)) && reg.lastIndex > 0 && ( reg.lastIndex = 0 );
	        return result;
	    }
	}( baidu.global("_maps_RegExp") );
	
	baidu.setBack = function(current, oldChain) {
	    current._back_ = oldChain;
	    current.getBack = function() {
	        return this._back_;
	    }
	    return current;
	};
	
	baidu.createChain("sio",
	
	// 执行方法
	function(url){
	    switch (typeof url) {
	        case "string" :
	            return new baidu.sio.$Sio(url);
	        break;
	    };
	},
	
	// constructor
	function(url){
		this.url = url;
	});
	
	baidu.sio._createScriptTag = function(scr, url, charset){
	    scr.setAttribute('type', 'text/javascript');
	    charset && scr.setAttribute('charset', charset);
	    scr.setAttribute('src', url);
	    document.getElementsByTagName('head')[0].appendChild(scr);
	};
	
	baidu.sio._removeScriptTag = function(scr){
	    if (scr.clearAttributes) {
	        scr.clearAttributes();
	    } else {
	        for (var attr in scr) {
	            if (scr.hasOwnProperty(attr)) {
	                delete scr[attr];
	            }
	        }
	    }
	    if(scr && scr.parentNode){
	        scr.parentNode.removeChild(scr);
	    }
	    scr = null;
	};
	
	 
	baidu.sio.extend({
	    callByBrowser : function (opt_callback, opt_options) {
	        var url = this.url ;
	        var scr = document.createElement("SCRIPT"),
	            scriptLoaded = 0,
	            options = opt_options || {},
	            charset = options['charset'],
	            callback = opt_callback || function(){},
	            timeOut = options['timeOut'] || 0,
	            timer;
	        
	        // IE和opera支持onreadystatechange
	        // safari、chrome、opera支持onload
	        scr.onload = scr.onreadystatechange = function () {
	            // 避免opera下的多次调用
	            if (scriptLoaded) {
	                return;
	            };
	            
	            var readyState = scr.readyState;
	            if ('undefined' == typeof readyState
	                || readyState == "loaded"
	                || readyState == "complete") {
	                scriptLoaded = 1;
	                try {
	                    callback();
	                    clearTimeout(timer);
	                } finally {
	                    scr.onload = scr.onreadystatechange = null;
	                    baidu.sio._removeScriptTag(scr);
	                }
	            }
	        };
	
	        if( timeOut ){
	            timer = setTimeout(function(){
	                scr.onload = scr.onreadystatechange = null;
	                baidu.sio._removeScriptTag(scr);
	                options.onfailure && options.onfailure();
	            }, timeOut);
	        };
	        baidu.sio._createScriptTag(scr, url, charset);
	    } 
	});
	
	 
	baidu.sio.extend({
	    callByServer : function( callback, opt_options) {
	        var url = this.url ;
	        var scr = document.createElement('SCRIPT'),
	            prefix = 'bd__cbs__',
	            callbackName,
	            callbackImpl,
	            options = opt_options || {},
	            charset = options['charset'],
	            queryField = options['queryField'] || 'callback',
	            timeOut = options['timeOut'] || 0,
	            timer,
	            reg = new RegExp('(\\?|&)' + queryField + '=([^&]*)'),
	            matches;
	
	        if (baidu.lang.isFunction(callback)) {
	            callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
	            window[callbackName] = getCallBack(0);
	        } else if(baidu.lang.isString(callback)){
	            // 如果callback是一个字符串的话，就需要保证url是唯一的，不要去改变它
	            // TODO 当调用了callback之后，无法删除动态创建的script标签
	            callbackName = callback;
	        } else {
	            if (matches = reg.exec(url)) {
	                callbackName = matches[2];
	            }
	        }
	
	        if( timeOut ){
	            timer = setTimeout(getCallBack(1), timeOut);
	        }
	
	        //如果用户在URL中已有callback，用参数传入的callback替换之
	        url = url.replace(reg, '\x241' + queryField + '=' + callbackName);
	        
	        if (url.search(reg) < 0) {
	            url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
	        }
	        baidu.sio._createScriptTag(scr, url, charset);
	
	        
	        function getCallBack(onTimeOut){
	            
	            return function(){
	                try {
	                    if( onTimeOut ){
	                        options.onfailure && options.onfailure();
	                    }else{
	                        callback.apply(window, arguments);
	                        clearTimeout(timer);
	                    }
	                    window[callbackName] = null;
	                    delete window[callbackName];
	                } catch (exception) {
	                    // ignore the exception
	                } finally {
	                    baidu.sio._removeScriptTag(scr);
	                }
	            }
	        }
	    }
	
	});
	
	 
	baidu.sio.extend({
	  log : function() {
	    var url = this.url ;
	    var img = new Image(),
	        key = 'tangram_sio_log_' + Math.floor(Math.random() *
	              2147483648).toString(36);
	
	    // 这里一定要挂在window下
	    // 在IE中，如果没挂在window下，这个img变量又正好被GC的话，img的请求会abort
	    // 导致服务器收不到日志
	    window[key] = img;
	
	    img.onload = img.onerror = img.onabort = function() {
	      // 下面这句非常重要
	      // 如果这个img很不幸正好加载了一个存在的资源，又是个gif动画
	      // 则在gif动画播放过程中，img会多次触发onload
	      // 因此一定要清空
	      img.onload = img.onerror = img.onabort = null;
	
	      window[key] = null;
	
	      // 下面这句非常重要
	      // new Image创建的是DOM，DOM的事件中形成闭包环引用DOM是典型的内存泄露
	      // 因此这里一定要置为null
	      img = null;
	    };
	
	    // 一定要在注册了事件之后再设置src
	    // 不然如果图片是读缓存的话，会错过事件处理
	    // 最后，对于url最好是添加客户端时间来防止缓存
	    // 同时服务器也配合一下传递Cache-Control: no-cache;
	    img.src = url;
	  }
	});
	
	baidu.string.extend({
	    decodeHTML : function () {
	        var str = this
	                    .replace(/&quot;/g,'"')
	                    .replace(/&lt;/g,'<')
	                    .replace(/&gt;/g,'>')
	                    .replace(/&amp;/g, "&");
	        //处理转义的中文和实体字符
	        return str.replace(/&#([\d]+);/g, function(_0, _1){
	            return String.fromCharCode(parseInt(_1, 10));
	        });
	    }
	});
	
	baidu.string.extend({
	    encodeHTML : function () {
	        return this.replace(/&/g,'&amp;')
	                    .replace(/</g,'&lt;')
	                    .replace(/>/g,'&gt;')
	                    .replace(/"/g, "&quot;")
	                    .replace(/'/g, "&#39;");
	    }
	});
	/// Tangram 1.x Code Start
	
	 
	
	baidu.string.filterFormat = function (source, opts) {
	    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
	    if(data.length){
		    data = data.length == 1 ? 
		    	
		    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
		    	: data;
	    	return source.replace(/#\{(.+?)\}/g, function (match, key){
			    var filters, replacer, i, len, func;
			    if(!data) return '';
		    	filters = key.split("|");
		    	replacer = data[filters[0]];
		    	// chrome 下 typeof /a/ == 'function'
		    	if('[object Function]' == toString.call(replacer)){
		    		replacer = replacer(filters[0]);
		    	}
		    	for(i=1,len = filters.length; i< len; ++i){
		    		func = baidu.string.filterFormat[filters[i]];
		    		if('[object Function]' == toString.call(func)){
		    			replacer = func(replacer);
		    		}
		    	}
		    	return ( ('undefined' == typeof replacer || replacer === null)? '' : replacer);
	    	});
	    }
	    return source;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.string.filterFormat.escapeJs = function(str){
		if(!str || 'string' != typeof str) return str;
		var i,len,charCode,ret = [];
		for(i=0, len=str.length; i < len; ++i){
			charCode = str.charCodeAt(i);
			if(charCode > 255){
				ret.push(str.charAt(i));
			} else{
				ret.push('\\x' + charCode.toString(16));
			}
		}
		return ret.join('');
	};
	baidu.string.filterFormat.js = baidu.string.filterFormat.escapeJs;
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.string.filterFormat.escapeString = function(str){
		if(!str || 'string' != typeof str) return str;
		return str.replace(/["'<>\\\/`]/g, function($0){
		   return '&#'+ $0.charCodeAt(0) +';';
		});
	};
	
	baidu.string.filterFormat.e = baidu.string.filterFormat.escapeString;
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.string.filterFormat.toInt = function(str){
		return parseInt(str, 10) || 0;
	};
	baidu.string.filterFormat.i = baidu.string.filterFormat.toInt;
	/// Tangram 1.x Code End
	
	//format(a,a,d,f,c,d,g,c);
	baidu.string.extend({
	    format : function (opts) {
	    	var source = this.valueOf(),
	            data = Array.prototype.slice.call(arguments,0), toString = Object.prototype.toString;
	        if(data.length){
	    	    data = data.length == 1 ? 
	    	    	
	    	    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
	    	    	: data;
	        	return source.replace(/#\{(.+?)\}/g, function (match, key){
	    	    	var replacer = data[key];
	    	    	// chrome 下 typeof /a/ == 'function'
	    	    	if('[object Function]' == toString.call(replacer)){
	    	    		replacer = replacer(key);
	    	    	}
	    	    	return ('undefined' == typeof replacer ? '' : replacer);
	        	});
	        }
	        return source;
	    }
	});
	
	baidu.string.extend({
	    getByteLength : function () {
	        return this.replace(/[^\x00-\xff]/g, 'ci').length;
	    }
	    //获取字符在gbk编码下的字节长度, 实现原理是认为大于127的就一定是双字节。如果字符超出gbk编码范围, 则这个计算不准确
	});
	
	baidu.string.extend({
	    stripTags : function() {
	        return (this || '').replace(/<[^>]+>/g, '');
	    }
	}); 
	
	baidu.string.extend({
	    subByte : function (len, tail) {
	        baidu.check('number(,string)?$', 'baidu.string.subByte');
	
	        if(len < 0 || this.getByteLength() <= len){
	            return this.valueOf(); // 20121109 mz 去掉tail
	        }
	        //thanks 加宽提供优化方法
	        var source = this.substr(0, len)
	            .replace(/([^\x00-\xff])/g,"\x241 ")//双字节字符替换成两个
	            .substr(0, len)//截取长度
	            .replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
	            .replace(/([^\x00-\xff]) /g,"\x241");//还原
	        return source + (tail || "");
	    }
	});
	
	baidu.string.extend({
	    toHalfWidth : function () {
	        return this.replace(/[\uFF01-\uFF5E]/g,
	            function(c){
	                return String.fromCharCode(c.charCodeAt(0) - 65248);
	            }).replace(/\u3000/g," ");
	    }
	});
	
	baidu.string.extend({
	    wbr : function () {
	        return this.replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
	            .replace(/><wbr>/g, '>');
	    }
	});
	
	baidu.swf = baidu.swf || {};
	
	baidu.swf.version = (function () {
	    var n = navigator;
	    if (n.plugins && n.mimeTypes.length) {
	        var plugin = n.plugins["Shockwave Flash"];
	        if (plugin && plugin.description) {
	            return plugin.description
	                    .replace(/([a-zA-Z]|\s)+/, "")
	                    .replace(/(\s)+r/, ".") + ".0";
	        }
	    } else if (window.ActiveXObject && !window.opera) {
	        for (var i = 12; i >= 2; i--) {
	            try {
	                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
	                if (c) {
	                    var version = c.GetVariable("$version");
	                    return version.replace(/WIN/g,'').replace(/,/g,'.');
	                }
	            } catch(e) {}
	        }
	    }
	})();
	
	baidu.swf.createHTML = function (options) {
	    options = options || {};
	    var version = baidu.swf.version, 
	        needVersion = options['ver'] || '6.0.0', 
	        vUnit1, vUnit2, i, k, len, item, tmpOpt = {},
	        encodeHTML = baidu.string.encodeHTML;
	    
	    // 复制options，避免修改原对象
	    for (k in options) {
	        tmpOpt[k] = options[k];
	    }
	    options = tmpOpt;
	    
	    // 浏览器支持的flash插件版本判断
	    if (version) {
	        version = version.split('.');
	        needVersion = needVersion.split('.');
	        for (i = 0; i < 3; i++) {
	            vUnit1 = parseInt(version[i], 10);
	            vUnit2 = parseInt(needVersion[i], 10);
	            if (vUnit2 < vUnit1) {
	                break;
	            } else if (vUnit2 > vUnit1) {
	                return ''; // 需要更高的版本号
	            }
	        }
	    } else {
	        return ''; // 未安装flash插件
	    }
	    
	    var vars = options['vars'],
	        objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
	    
	    // 初始化object标签需要的classid、codebase属性值
	    options['align'] = options['align'] || 'middle';
	    options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	    options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
	    options['movie'] = options['url'] || '';
	    delete options['vars'];
	    delete options['url'];
	    
	    // 初始化flashvars参数的值
	    if ('string' == typeof vars) {
	        options['flashvars'] = vars;
	    } else {
	        var fvars = [];
	        for (k in vars) {
	            item = vars[k];
	            fvars.push(k + "=" + encodeURIComponent(item));
	        }
	        options['flashvars'] = fvars.join('&');
	    }
	    
	    // 构建IE下支持的object字符串，包括属性和参数列表
	    var str = ['<object '];
	    for (i = 0, len = objProperties.length; i < len; i++) {
	        item = objProperties[i];
	        str.push(' ', item, '="', encodeHTML(options[item]), '"');
	    }
	    str.push('>');
	    var params = {
	        'wmode'             : 1,
	        'scale'             : 1,
	        'quality'           : 1,
	        'play'              : 1,
	        'loop'              : 1,
	        'menu'              : 1,
	        'salign'            : 1,
	        'bgcolor'           : 1,
	        'base'              : 1,
	        'allowscriptaccess' : 1,
	        'allownetworking'   : 1,
	        'allowfullscreen'   : 1,
	        'seamlesstabbing'   : 1,
	        'devicefont'        : 1,
	        'swliveconnect'     : 1,
	        'flashvars'         : 1,
	        'movie'             : 1
	    };
	    
	    for (k in options) {
	        item = options[k];
	        k = k.toLowerCase();
	        if (params[k] && (item || item === false || item === 0)) {
	            str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
	        }
	    }
	    
	    // 使用embed时，flash地址的属性名是src，并且要指定embed的type和pluginspage属性
	    options['src']  = options['movie'];
	    options['name'] = options['id'];
	    delete options['id'];
	    delete options['movie'];
	    delete options['classid'];
	    delete options['codebase'];
	    options['type'] = 'application/x-shockwave-flash';
	    options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';
	    
	    
	    // 构建embed标签的字符串
	    str.push('<embed');
	    // 在firefox、opera、safari下，salign属性必须在scale属性之后，否则会失效
	    // 经过讨论，决定采用BT方法，把scale属性的值先保存下来，最后输出
	    var salign;
	    for (k in options) {
	        item = options[k];
	        if (item || item === false || item === 0) {
	            if ((new RegExp("^salign\x24", "i")).test(k)) {
	                salign = item;
	                continue;
	            }
	            
	            str.push(' ', k, '="', encodeHTML(item), '"');
	        }
	    }
	    
	    if (salign) {
	        str.push(' salign="', encodeHTML(salign), '"');
	    }
	    str.push('></embed></object>');
	    
	    return str.join('');
	};
	
	baidu.swf.create = function (options, target) {
	    options = options || {};
	    var html = baidu.swf.createHTML(options) 
	               || options['errorMessage'] 
	               || '';
	                
	    if (target && 'string' == typeof target) {
	        target = document.getElementById(target);
	    }
	    baidu.dom.insertHTML( target || document.body ,'beforeEnd',html );
	};
	
	baidu.swf.getMovie = function (name) {
		//ie9下, Object标签和embed标签嵌套的方式生成flash时,
		//会导致document[name]多返回一个Object元素,而起作用的只有embed标签
		var movie = document[name], ret;
	    return baidu.browser.ie == 9 ?
	    	movie && movie.length ? 
	    		(ret = baidu.array.remove(baidu.lang.toArray(movie),function(item){
	    			return item.tagName.toLowerCase() != "embed";
	    		})).length == 1 ? ret[0] : ret
	    		: movie
	    	: movie || window[name];
	};
	
	baidu.swf.Proxy = function(id, property, loadedHandler) {
	    
	    var me = this,
	        flash = this._flash = baidu.swf.getMovie(id),
	        timer;
	    if (! property) {
	        return this;
	    }
	    timer = setInterval(function() {
	        try {
	            
	            if (flash[property]) {
	                me._initialized = true;
	                clearInterval(timer);
	                if (loadedHandler) {
	                    loadedHandler();
	                }
	            }
	        } catch (e) {
	        }
	    }, 100);
	};
	
	baidu.swf.Proxy.prototype.getFlash = function() {
	    return this._flash;
	};
	
	baidu.swf.Proxy.prototype.isReady = function() {
	    return !! this._initialized;
	};
	
	baidu.swf.Proxy.prototype.call = function(methodName, var_args) {
	    try {
	        var flash = this.getFlash(),
	            args = Array.prototype.slice.call(arguments);
	
	        args.shift();
	        if (flash[methodName]) {
	            flash[methodName].apply(flash, args);
	        }
	    } catch (e) {
	    }
	};
	
	/// Tangram 1.x Code Start
	
	baidu.url.getQueryValue = function (url, key) {
	    var reg = new RegExp(
	                        "(^|&|\\?|#)" 
	                        + baidu.string.escapeReg(key) 
	                        + "=([^&#]*)(&|\x24|#)", 
	                    "");
	    var match = url.match(reg);
	    if (match) {
	        return match[2];
	    }
	    
	    return null;
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.url.jsonToQuery = function (json, replacer_opt) {
	    var result = [], 
	        itemLen,
	        replacer = replacer_opt || function (value) {
	          return baidu.url.escapeSymbol(value);
	        };
	        
	    baidu.object.each(json, function(item, key){
	        // 这里只考虑item为数组、字符串、数字类型，不考虑嵌套的object
	        if (baidu.lang.isArray(item)) {
	            itemLen = item.length;
	            // value的值需要encodeURIComponent转义吗？
	            // FIXED 优化了escapeSymbol函数
	            while (itemLen--) {
	                result.push(key + '=' + replacer(item[itemLen], key));
	            }
	        } else {
	            result.push(key + '=' + replacer(item, key));
	        }
	    });
	    
	    return result.join('&');
	};
	/// Tangram 1.x Code End
	
	/// Tangram 1.x Code Start
	
	baidu.url.queryToJson = function(url){
	    var params = url.substr(url.lastIndexOf('?') + 1).split('&'),
	        len = params.length,
	        ret = null, entry, key, val;
	    for(var i = 0; i < len; i++){
	        entry = params[i].split('=');
	        if(entry.length < 2){continue;}
	        !ret && (ret = {});
	        key = entry[0];
	        val = entry[1];
	        entry = ret[key];
	        if(!entry){
	            ret[key] = val;
	        }else if(baidu.lang.isArray(entry)){
	            entry.push(val);
	        }else{// 这里只可能是string了
	            ret[key] = [entry, val];
	        }
	    }
	    return ret;
	};
	/// Tangram 1.x Code End
	
	// 声明快捷
	
	//链头
	baidu.array = baidu.array ||{};
	
	//链头
	baidu.dom = baidu.dom ||{};
	
	//为目标元素添加className
	baidu.addClass = baidu.dom.addClass ||{};
	
	//从文档中获取指定的DOM元素
	baidu.g = baidu.G = baidu.dom.g ||{};
	
	//获取目标元素的属性值
	baidu.getAttr = baidu.dom.getAttr ||{};
	
	//获取目标元素的样式值
	baidu.getStyle = baidu.dom.getStyle ||{};
	
	//隐藏目标元素
	baidu.hide = baidu.dom.hide ||{};
	
	//在目标元素的指定位置插入HTML代码
	baidu.insertHTML = baidu.dom.insertHTML ||{};
	
	//通过className获取元素
	baidu.q = baidu.Q = baidu.dom.q ||{};
	
	//移除目标元素的className
	baidu.removeClass = baidu.dom.removeClass ||{};
	
	//设置目标元素的attribute值
	baidu.setAttr = baidu.dom.setAttr ||{};
	
	//批量设置目标元素的attribute值
	baidu.setAttrs = baidu.dom.setAttrs ||{};
	
	//按照border-box模型设置元素的height值
	baidu.dom.setOuterHeight = baidu.dom.setBorderBoxHeight ||{};
	
	//按照border-box模型设置元素的width值
	baidu.dom.setOuterWidth = baidu.dom.setBorderBoxWidth ||{};
	
	//设置目标元素的style样式值
	baidu.setStyle = baidu.dom.setStyle ||{};
	
	//批量设置目标元素的style样式值
	baidu.setStyles = baidu.dom.setStyles ||{};
	
	//显示目标元素，即将目标元素的display属性还原成默认值。默认值可能在stylesheet中定义，或者是继承了浏览器的默认样式值
	baidu.show = baidu.dom.show ||{};
	
	//链头
	baidu.e = baidu.element = baidu.element ||{};
	
	//链头
	baidu.event = baidu.event ||{};
	
	//为目标元素添加事件监听器
	baidu.on = baidu.event.on ||{};
	
	//为目标元素移除事件监听器
	baidu.un = baidu.event.un ||{};
	
	//链头
	baidu.lang = baidu.lang ||{};
	
	//为类型构造器建立继承关系
	baidu.inherits = baidu.lang.inherits ||{};
	
	//链头
	baidu.object = baidu.object ||{};
	
	//链头
	baidu.string = baidu.string ||{};
	
	//对目标字符串进行html解码
	baidu.decodeHTML = baidu.string.decodeHTML ||{};
	
	//对目标字符串进行html编码
	baidu.encodeHTML = baidu.string.encodeHTML ||{};
	
	//对目标字符串进行格式化
	baidu.format = baidu.string.format ||{};
	
	//删除目标字符串两端的空白字符
	baidu.trim = baidu.string.trim ||{};
}();