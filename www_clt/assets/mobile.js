KISSY.add('mobile', function(S, N, E) {

	//类目页
	var CATS_AREA = S.one('#cats');
	//列表页
	var LIST_AREA = S.one('#list');
	//文章页
	var ENTRY_AREA = S.one('#entry');
	//后退按钮
	var NAVIGATOR = S.one('.navigator');
	//主标题
	var PAGE_TITLE = S.one('#head').one('h1');
	//设备宽度
	var VIEWPORT_WIDTH = S.DOM.viewportWidth();

	//动画集合
	var animateCollection = {
		//从左侧逐条进入显示
		leftToShow: function(element) {
			element.show();
			window.scrollTo(0, 1);
			var lists = element.all('.level-1');
			lists.css('margin-left', '-' + VIEWPORT_WIDTH + 'px').each(function(el, index) {
				if (index < 8) {
					S.later(function() {
						animateCollection.translateHorizon(el, VIEWPORT_WIDTH);
					}, 150 * index);
				} else {
					S.later(function() {
						animateCollection.translateHorizon(el, VIEWPORT_WIDTH);
					}, 1200);
				}
			});
		},
		//从左侧逐条退出隐藏
		hideToLeft: function(element) {
			var lists = element.all('.level-1');
			lists.each(function(el, index) {
				if (index < 7) {
					S.later(function() {
						animateCollection.translateHorizon(el, 0);
					}, 100 * index);
				} else {
					S.later(function() {
						animateCollection.translateHorizon(el, 0);
					}, 600);
				}
			});
		},
		//逐条从中间翻转显示
		middleToShow: function(element) {
			element.show();
			window.scrollTo(0, 1);
			var lists = element.all('.level-1');
			lists.each(function(el, index) {
				animateCollection.rotateVertical(el, 0);
			});
		},
		//逐条向中间翻转隐藏
		hideToMiddle: function(element) {
			var lists = element.all('.level-1');
			lists.each(function(el) {
				animateCollection.rotateVertical(el, 90);
			});
		},
		//水平移动
		translateHorizon: function(element, value) {
			var oldStyle = element.style('-webkit-transform');
			var newStyle;
			if (oldStyle.indexOf('rotate3d') === -1) {
				newStyle = 'translate3d(' + value + 'px,0,0)';
			} else {
				newStyle = oldStyle.replace(/(.*\()\d+(px.*)/, '$1' + value + '$2');
			}
			element.style('-webkit-transform', newStyle);
			return element;
		},
		//垂直移动
		translateVertical: function(element, value) {
			newStyle = 'translate3d(0,' + value + 'px,0)';
			element.style('-webkit-transform', newStyle);
			return element;
		},
		//垂直翻转
		rotateVertical: function(element, value) {
			var oldStyle = element.style('-webkit-transform');
			var newStyle;
			if (oldStyle.indexOf('rotate3d') !== -1) {
				newStyle = oldStyle.replace(/(.*\D)\d+(deg\).*)/, '$1' + value + '$2');
			} else {
				newStyle = oldStyle + ' rotate3d(1,0,0,' + value + 'deg)';
			}
			element.style('-webkit-transform', newStyle);
			return element;
		},
		//拖动列表条目
		listTouchMove: function(list, value, time) {
			var self = S.one(list);
			var innerNode = self.one('.inner');
			if (value > 10) {
				var realValue = value - 10;
				self.one('.mark-read').css('opacity', realValue / 60);
				if (realValue <= 60) {
					animateCollection.translateHorizon(innerNode, realValue);
				} else if (realValue <= 300) {
					animateCollection.translateHorizon(innerNode, 60 + (realValue - 60) / 12);
					if (time > 500 && list.readToggle === 1) {
						oCustomEvt.fire('listMarkRead', {
							node: self,
							element: list
						});
					}
				}
			} else if (value < -10) {
				var falseValue = value + 10;
				self.one('.mark-star').css('opacity', -falseValue / 60);
				if (falseValue >= -60) {
					animateCollection.translateHorizon(innerNode, falseValue);
				} else if (falseValue >= -300) {
					animateCollection.translateHorizon(innerNode, -60 + (falseValue + 60) / 12);
					if (time > 500 && list.starToggle === 1) {
						oCustomEvt.fire('listMarkStar', {
							node: self,
							element: list
						});
					}
				}
			}
		},
		//显示loading
		showLoading: function() {
			PAGE_TITLE.html('').addClass('spinner');
		},
		//隐藏loading
		hideLoading: function() {
			PAGE_TITLE.html('').removeClass('spinner');
		}
	};

	//事件中心
	var oCustomEvt = S.merge({}, S.EventTarget);
	//从左侧显示
	oCustomEvt.on('leftToShow', function(ev) {
		animateCollection.leftToShow(ev.node);
		ev.callback && S.later(function() {
			ev.callback();
		}, 1200);
	});
	//从左侧隐藏
	oCustomEvt.on('hideToLeft', function(ev) {
		animateCollection.hideToLeft(ev.node);
		S.later(function() {
			ev.node.hide();
			ev.callback && ev.callback();
		}, 800);
	});
	//从中间显示
	oCustomEvt.on('middleToShow', function(ev) {
		animateCollection.middleToShow(ev.node);
		ev.callback && S.later(function() {
			ev.callback();
		}, 400);
	});
	//从中间隐藏
	oCustomEvt.on('hideToMiddle', function(ev) {
		animateCollection.hideToMiddle(ev.node);
		S.later(function() {
			ev.node.hide();
			ev.callback && ev.callback();
		}, 400);
	});
	//列表标记切换已读未读
	oCustomEvt.on('listMarkRead', function(ev) {
		var node = ev.node;
		if (node.hasClass('unread')) {
			node.one('.mark-read').css({
				'color': '#0f0'
			});
			node.replaceClass('unread', 'read');
			if (currentList() === 'unread') {
				console.log('1')
				S.later(function() {
					node.slideUp(0.4);
				}, 600);
			}
		} else if (node.hasClass('read')) {
			node.one('.mark-read').css({
				'color': '#555'
			});
			node.replaceClass('read', 'unread');
		}
		ev.element.readToggle = 2;
	});
	//列表标记切换收藏
	oCustomEvt.on('listMarkStar', function(ev) {
		var node = ev.node;
		if (node.hasClass('unstar')) {
			node.one('.mark-star').css({
				'color': '#f00'
			});
			node.replaceClass('unstar', 'star');
		} else if (node.hasClass('star')) {
			node.one('.mark-star').css({
				'color': '#555'
			});
			node.replaceClass('star', 'unstar');
			if (currentList() === 'star') {
				S.later(function() {
					node.slideUp(0.4);
				}, 600);
			}
		}
		ev.element.starToggle = 2;
	});

	//页面切换
	var pageSwitch = {
		//载入类目页
		loadHome: function() {
			oCustomEvt.fire('leftToShow', {
				node: CATS_AREA
			});
		},
		//类目页到列表页
		homeToList: function(cfg) {
			oCustomEvt.fire('hideToLeft', {
				node: CATS_AREA,
				callback: function() {
					NAVIGATOR.addClass('home').css('visibility', 'visible');
					PAGE_TITLE.html(cfg.title).attr('list_title', cfg.title);
					LIST_AREA.show();
					window.scrollTo(0, 1);
					LIST_AREA.one('.entries').css('margin-left', '-' + VIEWPORT_WIDTH + 'px');
					S.later(function() {
						animateCollection.translateHorizon(LIST_AREA.one('.entries'), VIEWPORT_WIDTH);
					}, 10);
					S.later(function() {
						animateCollection.translateVertical(LIST_AREA.one('.column-actions'), -30);
						bindListOperate();
						setReadStarTag();
					}, 400);
				}
			});
		},
		//列表页到详情页
		listToDetail: function(cfg) {
			oCustomEvt.fire('hideToMiddle', {
				node: LIST_AREA,
				callback: function() {
					NAVIGATOR.replaceClass('home', 'main-list');
					PAGE_TITLE.html(cfg.title);
					animateCollection.translateVertical(LIST_AREA.one('.column-actions'), 5);
					animateCollection.translateVertical(ENTRY_AREA.one('.column-actions'), -30);
					ENTRY_AREA.sourceNode = cfg.node;
					if (cfg.star === 'star') {
						ENTRY_AREA.one('.column-actions').one('.toggle-star').one('i').replaceClass('icon-heart-empty', 'icon-heart');
					} else {
						ENTRY_AREA.one('.column-actions').one('.toggle-star').one('i').replaceClass('icon-heart', 'icon-heart-empty');
					}
					ENTRY_AREA.fadeIn(0.4);
					window.scrollTo(0, 1);
				}
			});
		},
		//列表页到类目页
		listToHome: function() {
			animateCollection.translateHorizon(LIST_AREA.one('.entries'), VIEWPORT_WIDTH * 2);
			animateCollection.translateVertical(LIST_AREA.one('.column-actions'), 5);
			S.later(function() {
				NAVIGATOR.removeClass('home').css('visibility', 'hidden');
				PAGE_TITLE.html('Simple Reader');
				oCustomEvt.fire('leftToShow', {
					node: CATS_AREA,
					callback: function() {
						animateCollection.translateHorizon(LIST_AREA.one('.entries'), 0);
						animateCollection.translateHorizon(LIST_AREA.all('.level-1'), 0);
						LIST_AREA.hide();
					}
				});
			}, 400);
		},
		//详情页到列表页
		detailToList: function() {
			animateCollection.translateHorizon(ENTRY_AREA.one('.sub-entry'), VIEWPORT_WIDTH);
			S.later(function() {
				NAVIGATOR.replaceClass('main-list', 'home');
				PAGE_TITLE.html(PAGE_TITLE.attr('list_title'));
				animateCollection.translateVertical(ENTRY_AREA.one('.column-actions'), 5);
				oCustomEvt.fire('middleToShow', {
					node: LIST_AREA,
					callback: function() {
						animateCollection.translateVertical(LIST_AREA.one('.column-actions'), -30);
						animateCollection.translateHorizon(ENTRY_AREA.one('.sub-entry'), 0);
						ENTRY_AREA.hide();
						setReadStarTag();
					}
				});
			}, 400);
		},
		//列表页切换所有
		listSwitchAll: function() {
			window.scrollTo(0, 1);
			LIST_AREA.one('.entries').all('li').show();
			LIST_AREA.one('.column-actions').all('li').removeClass('active');
			LIST_AREA.one('.column-actions').one('li.all-posts').addClass('active');
		},
		//列表页切换未读
		listSwitchUnread: function() {
			window.scrollTo(0, 1);
			LIST_AREA.one('.entries').all('li').show();
			LIST_AREA.one('.entries').all('li.read').hide();
			LIST_AREA.one('.column-actions').all('li').removeClass('active');
			LIST_AREA.one('.column-actions').one('li.unread-posts').addClass('active');
		},
		//列表页切换收藏
		listSwitchStar: function() {
			window.scrollTo(0, 1);
			LIST_AREA.one('.entries').all('li').hide();
			LIST_AREA.one('.entries').all('li.star').show();
			LIST_AREA.one('.column-actions').all('li').removeClass('active');
			LIST_AREA.one('.column-actions').one('li.star-posts').addClass('active');
		}
	};

	//绑定列表事件

	function bindListOperate() {
		LIST_AREA.all('li').on(E.Gesture.start, function(ev) {
			var el = S.one(this);
			if (el.hasClass('all-posts') || el.hasClass('unread-posts') || el.hasClass('star-posts')) {
				return;
			}
			this.isDown = true;
			this.isMoving = 0;
			this.originX = ev.pageX;
			this.originY = ev.pageY;
			this.originT = S.now();
			this.readToggle = 1;
			this.starToggle = 1;
		});
		LIST_AREA.all('li').on(E.Gesture.move, function(ev) {
			var el = S.one(this);
			if (el.hasClass('all-posts') || el.hasClass('unread-posts') || el.hasClass('star-posts')) {
				return;
			}
			var self = this;
			if (self.isDown) {
				self.isMoving = 1;
				self.currentX = ev.pageX;
				self.currentY = ev.pageY;
				self.currentT = S.now();
				self.deltaX = self.currentX - self.originX;
				self.deltaY = self.currentY - self.originY;
				self.deltaT = self.currentT - self.originT;
				if (Math.abs(self.deltaY) <= 10 && Math.abs(self.deltaX) > 10) {
					animateCollection.listTouchMove(self, self.deltaX, self.deltaT);
				}
			}
		});
		LIST_AREA.all('li').on(E.Gesture.end, function(ev) {
			var el = S.one(this);
			if (el.hasClass('all-posts') || el.hasClass('unread-posts') || el.hasClass('star-posts')) {
				return;
			}
			var self = this;
			if (self.isMoving === 1) {
				self.isDown = false;
				self.isMoving = 2;
				self.readToggle = 0;
				self.starToggle = 0;
				S.one(self).one('.inner').addClass('webkit-transition');
				animateCollection.translateHorizon(S.one(self).one('.inner'), 0);
				S.one(self).one('.mark-read').animate({
					'opacity': 0
				}, 0.3);
				S.one(self).one('.mark-star').animate({
					'opacity': 0
				}, 0.3);
				S.later(function() {
					S.one(self).one('.inner').removeClass('webkit-transition');
				}, 500);
			}
		});

		LIST_AREA.all('li').on(E.Gesture.tap, function(ev) {
			var el = S.one(this);
			if (el.hasClass('all-posts') || el.hasClass('unread-posts') || el.hasClass('star-posts')) {
				return;
			}
			ev.preventDefault();
			this.isDown = false;
			if (this.isMoving === 1 || this.isMoving === 2) {
				return;
			}
			this.readToggle = 0;
			this.starToggle = 0;
			el.replaceClass('unread', 'read');
			el.one('.mark-read').css({
				'color': '#0f0'
			});
			var star = el.hasClass('star') ? 'star' : 'unstar';
			animateCollection.showLoading();
			S.later(function() {
				animateCollection.hideLoading();
				pageSwitch.listToDetail({
					'title': '文章详情',
					'node': el,
					'star': star
				});
			}, 500);
		});
	}

	//设置已读加心状态

	function setReadStarTag() {
		LIST_AREA.all('li').each(function(list) {
			var el = S.one(list);
			if (el.hasClass('all-posts') || el.hasClass('unread-posts') || el.hasClass('star-posts')) {
				return;
			}
			if (el.hasClass('read')) {
				el.one('.mark-read').css({
					'color': '#0f0'
				});
			}
			if (el.hasClass('star')) {
				el.one('.mark-star').css({
					'color': '#f00'
				});
			};
		})
	}

	//刷新列表页条目

	function currentList() {
		var listType;
		LIST_AREA.one('.column-actions').all('li').each(function(el) {
			if (el.hasClass('all-posts') && el.hasClass('active')) {
				listType = 'all';
			} else if (el.hasClass('unread-posts') && el.hasClass('active')) {
				listType = 'unread';
			} else if (el.hasClass('star-posts') && el.hasClass('active')) {
				listType = 'star';
			}
		});
		return listType;
	}

	var Mobile = {
		init: function() {
			if (VIEWPORT_WIDTH > 480) {
				return;
			}

			S.one('.scroll_content').attr('style', '')
			S.one('#user-cat-list').insertBefore(CATS_AREA.one('.section'));
			CATS_AREA.one('.section').remove();

			pageSwitch.loadHome();

			S.one('#cats li.today').add('#cats li.all').add('#cats li.star').add('#cats li.list-detail').on(E.Gesture.tap, function(ev) {
				var curTitle;
				var self = S.one(this);
				if (self.hasClass('today')) {
					curTitle = '今日';
				} else if (self.hasClass('all')) {
					curTitle = '全部';
				} else if (self.hasClass('star')) {
					curTitle = '收藏';
				} else {
					curTitle = self.text();
				}
				animateCollection.showLoading();
				S.later(function() {
					pageSwitch.homeToList({
						'title': curTitle
					});
					animateCollection.hideLoading();
				}, 500);
			});

			LIST_AREA.one('.column-actions').all('li').on(E.Gesture.tap, function(e) {
				var el = S.one(this);
				e.preventDefault();
				if (el.hasClass('all-posts')) {
					pageSwitch.listSwitchAll();
				} else if (el.hasClass('unread-posts')) {
					pageSwitch.listSwitchUnread();
				} else if (el.hasClass('star-posts')) {
					pageSwitch.listSwitchStar();
				}
			});

			NAVIGATOR.on(E.Gesture.tap, function(ev) {
				var self = S.one(this);
				if (self.hasClass('home')) {
					pageSwitch.listToHome();
				} else if (self.hasClass('main-list')) {
					pageSwitch.detailToList();
				}
			});

			LIST_AREA.on('swipe', function(e) {
				if (e.direction === 'right' && e.distance >= 100 && e.duration <= 0.5) {
					pageSwitch.listToHome();
				}
			});

			ENTRY_AREA.on('swipe', function(e) {
				if (e.direction === 'right' && e.distance >= 100 && e.duration <= 0.5) {
					pageSwitch.detailToList();
				}
			});

		}
	};

	Mobile.init();

}, {
	requires: [
			'node',
			'event'
	]
});