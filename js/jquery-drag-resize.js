/**
 * 简单的可视化拖拽和resize实现
 * @start 2016-09-05
 * @last 2016-09-21
 */
;(function()
{
	$.fn.extend(
	{
		/**
		 * 开启拖拽，被拖拽元素必须是position:absolute，否则无效
		 * @param {Object} selector 目标选择器
		 * @param {Object} showTip 是否显示提示，默认是
		 */
		enableDrag: function(selector, showTip)
		{
			selector = selector || '[data-drag]'; // 选择器
			showTip = showTip || true; // 默认显示提示
			var currentTarget, // 当前正在移动的目标，如果有值则表示正在移动
				currentOffset = [0, 0], 
				parentPosition = {}, 
				that = this, 
				offset = 5,
				meetMoveState = false;
			// 触发自定义事件
			function fireEvent(obj, x, y)
			{
				var event = document.createEvent('CustomEvent');
				event.initCustomEvent('drag', true, true, {left: x, top: y});
				obj.dispatchEvent(event);
			}
			
			this.on('mousemove.xei.drag', selector, function(e)
			{
				if(currentTarget) return;
				var position = this.getBoundingClientRect();
				meetMoveState = e.clientX < position.right - offset && e.clientY < position.bottom - offset;
			}).on('mousedown.xei.drag', selector, function(e)
			{
				if(!meetMoveState) return; // 如果不符合移动条件，不作处理
				currentTarget = this; // 当前拖拽目标
				parentPosition = this.offsetParent.getBoundingClientRect(); // 父元素位置
				currentOffset = [e.offsetX, e.offsetY]; // 鼠标按下时，相对于目标左上角的起始偏移位置
				if(showTip)
				{
					var html = '<div class="xei-arrow-x"><div class="arrow left-arrow"></div><div class="arrow right-arrow"></div><div class="text">0px</div></div>'+
							'<div class="xei-arrow-y"><div class="arrow left-arrow"></div><div class="arrow right-arrow"></div><div class="text">0px</div></div>';
					$(html).appendTo($(this.offsetParent));
				}
				e.stopPropagation(); // 阻止冒泡
			}).on('mousemove.xei.drag', function(e)
			{
				// 之所以mousemove和mouseup没有添加selector，是因为如果鼠标移动过快会导致移出目标对象从而导致事件无法触发，给人的感觉就是卡顿
				if(!currentTarget) return;
				var left = parseInt(e.clientX - parentPosition.left - currentOffset[0]);
				var top = parseInt(e.clientY - parentPosition.top - currentOffset[1]);
				$(currentTarget).css('left', left).css('top', top);
				if(showTip)
				{
					$('.xei-arrow-x').css('width', left).css('top', parseInt(top+$(currentTarget).height()/2));
					$('.xei-arrow-x .text').html(left+'px');
					$('.xei-arrow-y').css('height', top).css('left', parseInt(left+$(currentTarget).width()/2));
					$('.xei-arrow-y .text').html(top+'px');
				}
				fireEvent(currentTarget, left, top);
				e.preventDefault();
			}).on('mouseup.xei.drag', function()
			{
				if(currentTarget)
				{
					var pos = $(currentTarget).position();
					fireEvent(currentTarget, pos.left, pos.top);
				}
				currentTarget = undefined;
				meetMoveState = false;
				if(showTip)
				{
					$('.xei-arrow-x').remove();
					$('.xei-arrow-y').remove();
				}
			});
			return this;
		},
		disableDrag: function()
		{
			this.off('.xei.drag');
			return this;
		},
		/**
		 * 开启改变大小功能
		 * @param {Object} selector 目标选择器
		 * @param {Object} showTip 是否显示提示，默认是
		 */
		enableResize: function(selector, showTip)
		{
			selector = selector || '[data-resize]';
			showTip = showTip || true;
			var currentTarget,  // 当前正在移动的目标，如果有值则表示正在移动
				targetPosition, 
				offset = 5, 
				needResizeX = false, 
				needResizeY = false,
				that = this;
			
			function fireEvent(obj, width, height)
			{
				var event = document.createEvent('CustomEvent');
				event.initCustomEvent('resize', true, true, {width: width, height: height});
				obj.dispatchEvent(event);
			}
			
			this.on('mousemove.xei.resize', selector, function(e)
			{
				if(currentTarget) return; // 如果正在resize就不需要继续了
				var position = this.getBoundingClientRect();
				needResizeX = e.clientX >= position.right - offset;
				needResizeY = e.clientY >= position.bottom - offset;
				if(needResizeX || needResizeY) this.style.cursor = (needResizeY?'s':'') + (needResizeX?'e':'') + '-resize';
				else this.style.cursor = '';
			}).on('mousedown.xei.resize', selector, function(e)
			{
				if(!needResizeX && !needResizeY) return;
				currentTarget = this;
				targetPosition = this.getBoundingClientRect();
				that.css('cursor', $(currentTarget).css('cursor')); // 将容器鼠标样式也设置成resize
				if(showTip)
				{
					$('<div class="xei-resize-tip" style="position:absolute;left:'+currentTarget.offsetLeft+'px;top:'+(currentTarget.offsetTop-30)+'px;height:30px;"></div>').appendTo($(this.offsetParent));
				}
				e.stopPropagation(); // 阻止冒泡
			}).on('mousemove.xei.resize',  function(e)
			{
				if(!currentTarget) return;
				if(needResizeX) $(currentTarget).css('width', e.clientX - targetPosition.left);
				if(needResizeY) $(currentTarget).css('height', e.clientY - targetPosition.top);
				var width = $(currentTarget).width();
				var height = $(currentTarget).height()
				if(showTip)
				{
					$('.xei-resize-tip').html('宽度：'+width+'px，高度：'+height+'px');
				}
				fireEvent(currentTarget, width, height);
				e.preventDefault();
			}).on('mouseup.xei.resize', function()
			{
				if(currentTarget)
				{
					var width = $(currentTarget).width();
					var height = $(currentTarget).height()
					fireEvent(currentTarget, width, height);
					currentTarget.style.cursor = ''; // 清除前面设置的光标
				}
				that.css('cursor', ''); // 清除光标设置
				currentTarget = undefined;
				needResizeX = false;
				needResizeY = false;
				if(showTip) $('.xei-resize-tip').remove();
			});
			return this;
		},
		disableResize: function()
		{
			this.off('.xei.resize');
			return this;
		}
	});
})();
