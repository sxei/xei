/**
 * 由于项目中不能使用jQuery，这里仿jQuery实现一个非常简单的轻量级mJquery<br>
 * 所有提供的方法以及调用方式均百分百兼容jQuery，但并未完全实现所有重载，大部分方法均只实现了一小部分重载<br>
 * 在方法的实现上均以最简单形式来实现，没有做过多的兼容性处理（只兼容现代浏览器（包括Android的webview））<br>
 * 本JS库100%不支持标清盒子，切记！<br>
 * 
 * ================================ 已经实现的方法 ===================================
 * 
 * 选择器：$('#id'),$('.class'),$('tagName'),$(DOM),$(DOM数组)，等等（内部调用querySelectorAll实现）
 * 页面载入事件：$(function(){})
 * 工具类：$.type(),$.trim(),$.merge(),$.makeArray(),$.buildFragment(),$.parseHTML(),$.parseXML(),$.parseJSON(),
 * 属性：$().html(),$().attr(),$().removeAttr(),$().css(),$().val(),$().width(),$().height(),
 * 样式处理：$().hasClass(),$().addClass(),$().removeClass(),$().toggleClass(),$().show(),$().hide(),
 * 文档处理：$().parent(),$().children(),$().append(),$().prepend(),$().after(),$().before(),$().empty(),$().remove(),
 * 事件：$().on(),$().off(),$().one(),
 * ajax：$.get(url, success, dataType), $.post(url, data, success, dataType), $.ajax(settings)
 * 
 * ================================ 华丽的分割线 =====================================
 * 
 * @since 20151201
 * @last 20160112
 * @version 1.0.0
 */
;(function(window) 
{
	var arr = [];
	var curCSS, extend, mJquery,
		document = window.document,
		_$ = window.$,
		slice = arr.slice;

	mJquery = function(selector, context) 
	{
		return new mJquery.fn.init(selector, context);
	};
	
	// 如果是谷歌或火狐
	if(window.getComputedStyle)
	{
		curCSS = function(elem, name) 
		{
			var ret,computed = window.getComputedStyle(elem, null), style = elem.style;
			if(computed) ret = computed[name];
			if(!ret) ret = style[name];
			return ret;
		};
	}
	// 如果是IE
	else if(document.documentElement.currentStyle)
	{
		curCSS = function(elem, name)
		{
			var ret = elem.currentStyle && elem.currentStyle[name], style = elem.style;
			if(!ret && style && style[name]) ret = style[name];
			return ret === '' ? 'auto' : ret;
		};
	}
	//否则，如果都不支持
	else 
	{
		curCSS = function(elem, name) { return elem.style[name]; };
	}
	
	
	
	/**
	 * 把from的json数据复制给to
	 * @param from 源
	 * @param to 目标
	 * @param details 具体要复制的属性，逗号分隔，如果不传值，表示全部复制
	 */
	extend = function(from, to, details)
	{
		if(details) details = details.split(',');
		for(var i in from)
		{
			if(!details || (details && details.indexOf(i) >= 0))
			{
				// 未定义当然不要复制过去了
				if(from[i] != undefined) to[i] = from[i];
			}
		}
		return to;
	};
	
	mJquery.fn = mJquery.prototype = 
	{
		version: '1.0.0', // 版本
		constructor: mJquery, // 构造器
		selector: '', // 选择器
		length: 0, // 默认对象长度为0
		/**
		 * 初始化mJquery对象
		 * 目前支持的有：
		 * $('字符串') -> 直接调用 document.querySelectorAll
		 * $(DOM对象)
		 * $(mJquery对象) 返回自身
		 * $(fn) 如果参数是一个function，注册DOMContentLoaded事件
		 * @param selector 选择器
		 * @param context 这个东西
		 * @returns 返回一个mJquery对象
		 */
		init: function(selector, context)
		{
			//以下5种情况视为无效： undefined、null、 ''、 0、 false
			if(!selector) return this;
			
			if(selector.nodeType)//如果是DOM元素
			{
				this.context = this[0] = selector;
				this.length = 1;
				return this;
			}

			if(typeof selector === 'string' && document.querySelectorAll)
			{
				selector = document.querySelectorAll(selector);
			}
			// 如果是类似数组数据（如HTMLCollection、NodeList等）
			if(typeof selector === 'object' && selector.length)
			{
				this.context = document;
				for(var i=0; i<selector.length; i++) this[this.length++] = selector[i];
				return this;
			}
			
			// 如果selector本来就是mJquery对象
			if(selector.constructor === mJquery)
			{
				return selector;
			}
			
			//注意这里不能用this.isFuntion！因为this还没有这个方法
			if(typeof selector === 'function' && document.addEventListener)
			{
				document.addEventListener('DOMContentLoaded', selector, false);
			}
			
			return this;
		},
		size: function() 
		{
			return this.length;
		},
		toArray: function()
		{
			return slice.call(this);
		},
		/**
		 * 这个属性很重要，加上这个之后返回的东西就是一个类数组的东西了
		 */
		splice: arr.splice,
		/**
		 * 获取指定索引的对象，如果num为空，返回所有对象的数组
		 * 否则按索引取，没有返回undefined，如果是-1，取倒数第一个
		 * @param num 索引
		 * @returns
		 */
		get: function(num) 
		{
			return num === undefined ? this.toArray() : (num < 0 ? this[this.length + num] : this[num]);
		},
		/**
		 * 简单的添加，不考虑重复问题
		 * @param obj
		 */
		add: function(obj)
		{
			var temp = this(obj);
			for(var i=0; i<temp.length; i++) this[this.length++] = temp[i];
		}
	};
	
	mJquery.fn.init.prototype = mJquery.fn;
	
	//扩展方法，类似于jquery的插件扩展
	mJquery.extend = mJquery.fn.extend = function(params) 
	{
		extend(params, this);
	};

	mJquery.extend(
	{
		/**
		 * 判断对象类型
		 * @param obj
		 * @returns boolean number string function array date regexp object dom（DOM是我们这里自定义的）
		 */
		type: function(obj) 
		{
			// typeof 能判断的有：boolean number string function undefined
			// typeof 不能判断的有：array date regexp dom null
			if(obj === null)//为了兼顾IE7下面的一些问题，null单独判断
				return 'null';
			var type = typeof obj;
			if(type != 'object')//一般而言，用typeof获取到的只要不是object肯定就是正确的
				return type;
			if(obj instanceof Array)//如果是数组
				return 'array';
			if(obj instanceof Date)//如果是日期
				return 'date';
			if(obj instanceof RegExp)//如果是正则
				return 'regexp';
			if(obj && obj.nodeType)//如果是DOM对象
				return 'dom';
			return 'object';
		},
		/**
		 * 过滤前后空白字符
		 * @param str
		 * @returns
		 */
		trim: function(str)
		{
			return text == null ? '' : (text + '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		},
		/**
		 * 合并两个数组，将second数组复制到first中并返回first，second不会被修改
		 */
		merge: function(first, second)
		{
			var i = first.length, j = 0;
			for( ; j < second.length; j++) first[i++] = second[j];
			first.length = i;
			return first;
		},
		/**
		 * 将类数组对象转换为数组对象，这个方法内部暂时没有用到
		 * @param arr
		 * @param results 可选参数
		 * @returns {Boolean}
		 */
		makeArray: function(array, results)
		{
			var ret = results || [];
			if (array != null)
			{
				this.merge(ret, typeof array === 'string' ? [arr] : arr);
			}
			return ret;
		},
		/**
		 * 建立文档碎片
		 * @param elems 数组，内容可以是html字符串，也可以是DOM节点[数据]
		 * @param context 上下文
		 * @returns
		 */
		buildFragment: function(elems, context)
		{
			var fragment = context.createDocumentFragment(); // 创建文档碎片
			var nodes = [], elem = elems[0]; // 这里直接偷懒，只处理第一个对象
			if(typeof elem === 'object') this.merge(nodes, elem.nodeType ? [elem] : elem);
			// 如果不是html标签，直接以text node形式创建文本节点
			else if(!/<|&#?\w+;/.test(elem)) nodes.push(context.createTextNode(elem));
			else
			{
				var temp = fragment.appendChild(context.createElement('div'));
				temp.innerHTML = elem;
				this.merge(nodes, temp.childNodes);
			}
			fragment.textContent = ''; // 清除
			for(var i=0; i<nodes.length; i++) fragment.appendChild(nodes[i]);
			return fragment;
		},
		/**
		 * 将任意html字符串解析成HTML node<br>
		 * 非html字符串会解析成文本节点（text node）<br>
		 * 未考虑一切特殊情况，比如包含scripts、节点重复、特殊节点等
		 * @param html 需要解析的HTML字符串
		 * @param context 上下文，默认当前document
		 * @returns 返回解析好的DOM节点数组
		 */
		parseHTML: function(html, context)
		{
			if (!html || typeof html !== 'string') return null;
			context = context || document;
			// 是否是单个标签，类似<img />、<div></div>、<div>都属于单个标签 
			var isSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/.exec(html);
			if (isSingleTag) return [context.createElement(isSingleTag[1])];
			var fragment = this.buildFragment([html], context);
			return this.merge([], fragment.childNodes);
		},
		/**
		 * 解析xml字符串
		 * @param data
		 * @returns
		 */
		parseXML: function(data)
		{
			if (!data || typeof data !== 'string') return null;
			var xml;
			try { xml = new DOMParser().parseFromString(data, 'text/xml'); }
			catch (e) { xml = undefined; }
			if (!xml || xml.getElementsByTagName('parsererror').length) throw new Error('xml无效：'+data);
			return xml;
		},
		/**
		 * 将JSON字符串转换成对象，注意JSON字符串必须是标准格式，也就是不能使用单引号和不要引号
		 * @param data
		 * @returns
		 */
		parseJSON: function(data)
		{
			return JSON.parse(data+'');
		},
		/**
		 * 字符串转下划线形式，示例：getParam 转 get_param<br>
		 * 此方法不是jQuery原有方法
		 * @param str
		 */
		toUnderline: function(str)
		{
			return str.replace(/([A-Z])/g, function(m, $1, idx, str){ return '_' + $1.toLowerCase(); });
		},
		/**
		 * 字符串转驼峰形式<br>
		 * 此方法不是jQuery原有方法<br>
		 * 示例一：$.toHump('get_param')，返回getParam<br>
		 * 示例二：$.toHump('font-size','-')，返回fontSize
		 * @param str
		 * @param 分割的标志，默认为“_”
		 */
		toHump: function(str, flag)
		{
			return str.replace(new RegExp(flag+'(\\w)', 'g'), function(m, $1, idx, str){ return $1.toUpperCase(); });
		}
	});

	//对象的扩展
	mJquery.fn.extend(
	{
		/**
		 * 获取或修改innerHTML
		 * @param str
		 * @returns
		 */
		html: function(str)
		{
			// 如果没有元素，返回未定义
			if(this.size() == 0) return undefined;
			if(str === undefined) return this[0].innerHTML;
			for(var i=0; i<this.size(); i++) this[i].innerHTML = str;
			return this;
		},
		/**
		 * 获取属性方法
		 * 重载一：$('#id').attr() 获取name属性里面的json数据
		 * 重载二：$('#id').attr('src') 获取src属性
		 * 重载三：$('#id').attr('src','f.png');//设置属性
		 * @param name
		 * @param value
		 * @returns
		 */
		attr: function(name, value)
		{
			if(this.size() == 0 || !name) return undefined;
			if(value === undefined) return this[0].getAttribute(name);
			for(var i=0; i<this.size(); i++) this[i].setAttribute(name, value);
			return this;
		},
		/**
		 * 删除每一个匹配元素的一个属性
		 * @param name
		 * @returns
		 */
		removeAttr: function(name)
		{
			if(this.size() == 0 || !name) return this;
			for(var i=0; i<this.size(); i++) this[i].removeAttribute(name);
			return this;
		},
		/**
		 * 读取或修改元素的css属性，与jQuery不同的是，获取时会默认去掉px并转number
		 * @param name 属性名称，如'font-size'
		 * @param value 不传值代表获取，否则表示设置，可以不带px
		 * @returns
		 */
		css: function(name, value)
		{
			if(this.size() == 0) return undefined;
			var pxs = ['left','top','right','bottom','width','height','line-height','font-size'];
			var isPx = pxs.indexOf(name) >= 0; // 是否是带px的属性，这里简单处理
			if(value === undefined) // 获取CSS
			{
				var result = curCSS(this[0], name);
				if(result == '' || result == 'auto') result = 0;
				return isPx ? parseFloat(temp) : temp;
			}
			else // 设置CSS
			{
				if(isPx && !/.*px$/g.test(value + '') && value !== 'auto') value += 'px';
				for(var i=0; i<this.size(); i++) this[i].style[name] = val;
				return this;//返回当前对象
			}
		},
		/**
		 * 获取或者设置匹配元素的value值
		 * @param value
		 * @returns
		 */
		val: function(value)
		{
			if(this.size() == 0) return undefined;
			if(value === undefined) return this[0].value;
			for(var i=0; i<this.size(); i++) this[i].value = value;
			return this;
		},
		/**
		 * 取得第一个匹配元素当前计算的宽度值（px）
		 */
		width: function()
		{
			return this.css('width');
		},
		/**
		 * 取得第一个匹配元素当前计算的高度值（px）
		 */
		height: function()
		{
			return this.css('height');
		},
		/**
		 * 判断对象是否具有某个class
		 */
		hasClass: function(cls)
		{
			if (this.size() === 0) return false;
			return new RegExp('(\\s|^)' + cls + '(\\s|$)', 'g').test(this[0].className);
		},
		/**
		 * 给dom对象添加class
		 */
		addClass: function(cls)
		{
			if (this.size() === 0) return this;
			for(var i=0; i<this.size(); i++)
			{
				var className = this[i].className;
				if(!new RegExp('(\\s|^)' + cls + '(\\s|$)', 'g').test(className))
				{
					this[i].className += (className?' ':'') + cls;
				}
			}
			return this;
		},
		/**
		 * 给对象删除class
		 */
		removeClass: function(cls)
		{
			if (this.size() === 0) return this;
			for(var i=0; i<this.size(); i++)
			{
				var className = this[i];
				this[i].className = className.replace(new RegExp('(\\s|^)' + cls + '(\\s|$)', 'g'), function(m, $1, $2, idx, str)
				{
					return ($1&&$2) ? ' ':'';
				});
			}
			return this;
		},
		/**
		 * 给对象删除class
		 */
		toggleClass: function(cls)
		{
			for(var i=0; i<this.size(); i++)
			{
				var temp = this(this[i]);
				if(temp.hasClass(cls)) temp.removeClass(cls);
				else temp.addClass(cls);
			}
			return this;
		},
		/**
		 * 显示元素
		 */
		show: function()
		{
			this.css('display', 'block');
			return this;
		},
		/**
		 * 隐藏元素
		 */
		hide: function()
		{
			this.css('display', 'none');
			return this;
		},
		parent: function()
		{
			if(this.size()==0) return undefined;
			return this(this[0].parentNode);
		},
		/**
		 * 获取当前所有元素的所有子元素
		 * @returns
		 */
		children: function()
		{
			var result = this();
			for(var i=0; i<this.size(); i++)
				result.add(this[i].children);
			return result;
		},
		/**
		 * 供append、prepend、after、before等DOM处理方法内部调用的方法
		 */
		domManip: function(content, callback)
		{
			if(this.size() == 0) return this;
			var fragment = this.buildFragment([content], this[0].ownerDocument);
			for(var i=0; i<this.size(); i++) callback.apply(this[i], [fragment, i]);
			return this;
		},
		/**
		 * 向每个匹配的元素内部追加内容
		 */
		append: function(content)
		{
			return this.domManip(content, function(elem) { this.append(elem); });
		},
		/**
		 * 前面插入内容
		 */
		prepend: function(content)
		{
			return this.domManip(content, function(elem) { this.insertBefore(elem, this.firstChild); });
		},
		/**
		 * 在每个匹配的元素之后插入内容
		 * @returns
		 */
		after: function()
		{
			return this.domManip(content, function(elem) { if(this.parentNode) this.parentNode.insertBefore(elem, this.nextSibling); });
		},
		/**
		 * 在每个匹配的元素之前插入内容
		 * @returns
		 */
		before: function()
		{
			return this.domManip(content, function(elem) { if(this.parentNode) this.parentNode.insertBefore(elem, this); });
		},
		/**
		 * 删除所有匹配的元素集合中所有的子节点
		 * @returns
		 */
		empty: function()
		{
			for(var i=0; i<this.size(); i++) this[i].textContent = '';
			return this;
		},
		/**
		 * 从DOM中删除所有匹配元素
		 * @returns
		 */
		remove: function()
		{
			for(var i = 0, elem; (elem = this[i]) != null; i++) if(elem.parentNode) elem.parentNode.removeChild(elem);
			return this;
		},
		/**
		 * 在选择元素上绑定一个或多个事件的事件处理函数
		 * @param events 一个或多个事件名，多个用空格分隔
		 * @param fn
		 * @returns
		 */
		on: function(events, fn)
		{
			var es = events.split(' ');
			for(var i=0; i<this.size(); i++)
			{
				if(this[i].addEventListener)
				{
					for(var j=0; j<es.length; j++) if(es[j]) this[i].addEventListener(es[j], fn, false);
				}
			}
			return this;
		},
		/**
		 * 移除用.on()绑定的事件处理程序
		 */
		off: function(events, fn)
		{
			// TODO
		},
		one: function(events, fn)
		{
			// TODO
		}
	});
	
	/**
	 * ============ ajax相关 =================
	 */
	mJquery.extend(
	{
		/**
		 * GET请求，如有附加参数请统一追加在url后面
		 * @param url ajax请求地址
		 * @param success 执行成功后的回调函数
		 * @param dataType 预期的响应结果类型
		 * @returns
		 */
		get: function(url, success, dataType)
		{
			return this.ajax({url: url, success: success, dataType: dataType, type: 'GET'});
		},
		/**
		 * POST请求
		 * 重载一：$.post(url, [success], [dataType])
		 * 重载二：$.post(url, [data], [success], [dataType])
		 * @param url ajax请求地址
		 * @param data POST时附加的数据
		 * @param success 执行成功后的回调函数
		 * @param dataType 预期的响应结果类型
		 * @returns
		 */
		post: function(url, data, success, dataType)
		{
			if(typeof data === 'function')
			{
				dataType = dataType || success;
				success = data;
				data = null;
			}
			return this.ajax({url: url, success: success, dataType: dataType, type: 'POST', data: data});
		},
		/**
		 * 全局的ajax参数设置
		 */
		ajaxSettings:
		{
			url: '',
			type: 'GET', // 默认GET
			async: true, // 默认异步
			data: null,
			dataType: null, // 预期服务器返回的数据类型，如不指定则自动根据Content-Type来智能判断，可以是text、xml、html、json、jsonp、script，目前仅处理json、jsonp
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
			success: function(data, textStatus, xhr)
			{
				console.log(data);
			},
			error: function(xhr, textStatus, errorThrown)
			{
				console.error(xhr);
			}
		},
		/**
		 * 用来覆盖默认的全局ajax设置方法
		 * @param settings
		 */
		ajaxSetup: function(settings)
		{
			extend(settings, this.ajaxSettings);
		},
		/**
		 * 最底层的ajax方法，一般情况下无需调用这个方法，除非你需要足够的自定义功能
		 * @param settings
		 * @returns 
		 */
		ajax: function(settings)
		{
			//注意理解下面3行代码的意思
			var s = {};
			//先将全局配置做一个备份，注意不能直接复制，否则s的更改会影响ajaxSettings
			extend(this.ajaxSettings, s);
			extend(settings, s);
			s.type = s.type.toUpperCase();//转大写
			
			if(s.dataType == 'jsonp')
			{
				var fnName = 'mjquery_jsonp_' + new Date().getTime();
				window[fnName] = s.success;
				var sign = s.url.indexOf('?') >= 0 ? '&' : '?';
				s.url += (sign + 'callback=' + fnName);
				var element = document.createElement('script');
				element.setAttribute('type', 'text/javascript');
				element.setAttribute('src', url);
				document.body.appendChild(element);
				return;
			}
			var xhr = null;
			// Firefox，Opera 8.0+，Safari，Chrome等浏览器
			if(window.XMLHttpRequest) xhr = new XMLHttpRequest();
			// 如果是IE（IE5.5以及以后版本可以使用）
			if(window.ActiveXObject) xhr = new ActiveXObject('Microsoft.XMLHTTP');
			if(!xhr)
			{
				console.error('抱歉，不支持ajax！'); return;
			}
			xhr.onreadystatechange = function()
			{
				if(xhr.readyState == 4) // 4代表数据发送完毕
				{
					var rsp = xhr.responseText || xhr.responseXML;//服务器端响应
					//200到300代表访问服务器成功，304代表没做修改访问的是缓存，0为访问的本地
					if((xhr.status >= 200 && xhr.status <300) || xhr.status == 304|| xhr.status == 0 )
					{
						var contentType = xhr.getResponseHeader('Content-Type'); // 获取服务器返回的内容类型
						if(s.dataType == 'json' || (contentType && contentType.indexOf('application/json')>=0))
						{
							try { rsp = eval('(' + rsp + ')'); }
							catch(e)
							{
								console.error('服务器返回的内容不是json格式！');
								console.error(e);
							}
						}
						s.success.apply(window, [rsp, '', xhr]);
					}
					else
					{
						s.error.apply(window, [xhr, textStatus]);
					}
				}
			};
			xhr.open(s.type, s.url, s.async);
			var sendStr = null;
			if(s.type === 'POST' && s.data)
			{
				xhr.setRequestHeader('Content-Type', s.contentType);
				if(typeof s.data == 'string') sendStr = s.data;
				else if(typeof s.data === 'object')
				{
					sendStr = '';
					for(var i in s.data) sendStr += (sendStr === '' ? '' : '&') + i + '=' + s.data[i];
				}
			}
			xhr.send(sendStr);
			return xhr;
		}
	});
	
	window.mJquery = window.$ = mJquery;
	
})(window);
