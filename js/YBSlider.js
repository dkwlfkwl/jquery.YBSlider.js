;(function($){

	'use strict';

	function YBSlider(el, option) {
		var defaults = {
			page: 0,
			speed: 300,
			loop: true,
			pagination: true,
			init: function(instance) {},
			edge: function(instance, direction) {},
			beforeChange: function(instance, currentSlide, nextSlide) {},
			afterChange: function(instance, currentSlide) {},
			setPosition: function(instance) {}
		};
		this.opts = $.extend(true, {}, defaults, option);

		this.el = el;
		this.$el = $(this.el);

		this.init();
	}

	YBSlider.prototype.init = function(option) {
		var _this = this;

		this.opts = $.extend(true, {}, this.opts, option);

		this.speed = this.opts.speed;
		this.page = this.opts.page;
		this.loop = this.opts.loop;

		this.width = this.$el.width();
		this.height = this.$el.height();
		this.$list = this.$el.children().eq(0);
		this.$li = this.$list.children();
		this.len = this.$li.length;
		this.$btnPrevnext = this.$el.find('.yb-prevnext');
		this.$btnPrev = this.$btnPrevnext.find('.yb-prev');
		this.$btnNext = this.$btnPrevnext.find('.yb-next');
		this.$ybPage = this.$el.find('.yb-page');

		if(this.opts.pagination) {
			this.pagination();
		}

		this.position();

		$(window).off('resize').on('resize', function() {
			_this.position();

			if(typeof _this.opts.setPosition === 'function') {
				_this.opts.setPosition.call(_this, _this);
			}
		});

		this.$btnPrev.off('click').on('click', function() {
			if(_this.page !== 0 || _this.opts.loop === true) {
				_this.move(false);
			}
		});

		this.$btnNext.off('click').on('click', function() {
			if(_this.page !== _this.len - 1 || _this.opts.loop === true) {
				_this.move(true);
			}
		});

		if(typeof this.opts.init === 'function') {
			this.opts.init.call(this, this);
		}

		if((typeof this.opts.edge === 'function' && !this.opts.loop) && (this.page === 0 || this.page === this.len -1)) {
			this.opts.edge.call(this, this, this.page === 0 ? 'first' : 'last');
		}

		return this;
	}

	YBSlider.prototype.position = function() {
		var _this = this;

		this.width = this.$el.width();
		this.height = this.$el.height();

		this.pageSort();

		$.each(this.pos, function(i) {
			_this.$li.eq(_this.pos[i]).css({
				'top': 0,
				'left': _this.width * i - _this.width + 'px'
			});
		});

		this.$li.removeClass('yb-active');
		this.$li.eq(_this.page).addClass('yb-active');
		this.$ybPage.children().removeClass('yb-active').eq(this.page).addClass('yb-active');
	}

	YBSlider.prototype.move = function(direction) {
		var _this = this;

		if(this.$li.filter(':animated').length) {
			return false;
		}

		if(typeof this.opts.beforeChange === 'function') {
			if(direction) {
				this.opts.beforeChange.call(this, this, this.page, this.page === this.len - 1 ? 0 : this.page + 1);
			} else {
				this.opts.beforeChange.call(this, this, this.page, this.page === 0 ? this.len - 1 : this.page - 1);
			}
		}

		if(direction) {
			this.page++;

			if(this.page > this.len - 1) this.page = 0;

			this.$li.eq(this.pos[0]).stop().css({
				'top': 0,
				'left': ((this.len - 1) * this.width) + 'px'
			});

		} else {
			this.page--;

			if(this.page < 0) this.page = this.len - 1;

			this.$li.eq(this.pos[this.len - 1]).stop().css({
				'top': 0,
				'left': - this.width * 2 + 'px'
			});
		}

		this.pageSort();

		$.each(this.pos, function(i) {
			_this.$li.eq(_this.pos[i]).finish().animate({
				'top': 0,
				'left': (_this.width * i - _this.width) + 'px'
			}, _this.speed, function() {
				if(i === _this.len - 1) {
					if(typeof _this.opts.afterChange === 'function') {
						_this.opts.afterChange.call(_this, _this, _this.page);
					}
				}
			});
		});

		this.$li.removeClass('yb-active');
		this.$li.eq(this.page).addClass('yb-active');
		this.$ybPage.children().removeClass('yb-active').eq(this.page).addClass('yb-active');

		if((typeof this.opts.edge === 'function' && !this.opts.loop) && (this.page === 0 || this.page === this.len - 1)) {
			this.opts.edge.call(this, this, this.page === 0 ? 'first' : 'last');
		}

		return this;
	}

	YBSlider.prototype.pagination = function() {
		var _this = this;
		var buttons = '';

		for(var i = 0; i < this.len; i++) {
			buttons += '<button type="button" class="yb-page-btn">' + (i + 1) + '</button>';
		}

		this.$ybPage.html(buttons);
	
		this.$ybPage.off('click').on('click', '.yb-page-btn', function(e) {
			var $this = $(this);
			var tgIndex = _this.$ybPage.children().index(e.target);

			if(_this.page === tgIndex) {
				return false;
			}

			if(typeof _this.opts.beforeChange === 'function') {
				if(_this.page < tgIndex) {
					_this.opts.beforeChange.call(_this, _this, _this.page, _this.page === _this.len - 1 ? 0 : tgIndex);
				} else {
					_this.opts.beforeChange.call(_this, _this, _this.page, _this.page === 0 ? _this.len - 1 : tgIndex);
				}
			}

			_this.$li.each(function(index, element) {
				$(element).css({
					'top': '0',
					'left': _this.width * index - _this.width * _this.page + 'px'
				});
			});

			_this.page = tgIndex;

			_this.pageSort();

			_this.$li.each(function(index, element) {
				$(element).stop().animate({
					'top': '0',
					'left': _this.width * index - _this.width * _this.page + 'px'
				}, _this.speed, function() {
					if(index === _this.len - 1) {
						_this.position();

						if(typeof _this.opts.afterChange === 'function') {
							_this.opts.afterChange.call(_this, _this, _this.page);
						}
					}
				});
			});

			$this.siblings().removeClass('yb-active');
			$this.addClass('yb-active');

			if((typeof _this.opts.edge === 'function' && !_this.opts.loop) && (_this.page === 0 || _this.page === _this.len -1)) {
				_this.opts.edge.call(_this, _this, _this.page === 0 ? 'first' : 'last');
			}
		});
	}

	YBSlider.prototype.pageSort = function() {
		this.pos = [];
		for(var i = 0; i < this.len; i++) {
			this.pos.push(i);
		}

		var rotate = this.len + this.page - 1;

		for(var i = 0; i < rotate; i++) {
			this.pos.push(this.pos[0]);
			this.pos.shift();
		}
	}

	$.fn.YBSlider = function(option) {
		return this.each(function() {
			if(!$.data(this, 'YBSlider')) {
				$.data(this, 'YBSlider', new YBSlider(this, option));
			}
		});
	}
})(jQuery);