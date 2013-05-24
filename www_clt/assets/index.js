KISSY.add('reader', function (S, DOM, Event, UA, IO, Node) {

    var MC = S.mix({}, S.EventTarget);  // Message Center


    var JSONP = 'jsonp';


    var entryCache = {},
        listCache = {};

    var catList = DOM.get('#user-cat-list'),
        entryList = DOM.get('#list'),
        entryContent = DOM.get('#entry-content');

    var screenWidth = DOM.viewportWidth();

    var isDesktop = screenWidth >= 1024,
        isPad = screenWidth > 480 && screenWidth < 1024,
        isMobile = screenWidth <= 480;


    var renderList = function (list) {
            currentList = list;

            var entries = [];
            S.each(list, function (entryInfo) {
                            var entry = '<li class="title level-1 {clazz} {stared}">' +
                                '<div class="inner">' +
                                '<h2><a href="{link}" data-id={id}>{title}</a></h2>' +
                                '<p class="desc">{description}</p>' +
                                '</div>' +
                                '<span class="mobile-version mark-read"><i class="icon-ok"></i></span>' +
                                '<span class="mobile-version mark-star"><i class="icon-heart"></i></span>' +
                                 '</li>';

                entryInfo['clazz'] = entryInfo['is_unread'] ? 'unread' : 'read';
                entryInfo['stared'] = entryInfo['is_stared'] ? 'star' : 'unstar';
                entry = S.substitute(entry, entryInfo);
                entries.push(entry);

            });
            entries = entries.join('');
            var listcontent= '<div class="entries section">'+
                ' <div class="scroll_content"  style="overflow:auto;">'+
                '<ul class="entry-list">'+
                ' </ul>'+
                ' </div>'+
            '</div>';
            DOM.html('#list .entries', listcontent);
            DOM.html('.entry-list', entries);
            if(S.one(".entry-list").innerHeight()>DOM.viewportHeight() && isDesktop){
                S.use("scroll,dom", function (S, Kscroll,DOM) {
                    var $ = S.all,
                        d = new Kscroll($(".scroll_content"), {
                            prefix:"clear-",
                            hotkey: true,
                            bodydrag: true,
                            allowArrow:true
                        });
                });
            }
            if(isDesktop) {
                DOM.style('.scroll_content',{"height":DOM.viewportHeight()-75});
                DOM.style('.entry-list',{"width": S.one(".scroll_content ").innerWidth()-10});
            }
        },


        renderEntry = function (id) {
            if (entryCache[id]) {
                _renderEntry(entryCache[id])
            } else {
                IO.get('http://10.232.133.213/item/' + id, function (entry) {
                    entryCache[id] = entry;
                    _renderEntry(entry);
                }, JSONP);
            }
        },

        renderCatList = function (list) {

            var cats = [];
            S.each(list, function (catInfo) {

                var cat = '<li class="title list-detail level-1 {clazz}  {stared}"><h2>' +
                          '<a href="{link}" data-id={id}>{title}</a>' +
                          '</h2>' +
                          '</li>';

                catInfo['clazz'] = catInfo['is_unread'] ? 'unread' : 'read';
                catInfo['stared'] = catInfo['is_stared'] ? 'star' : 'unstar';
                cat = S.substitute(cat, catInfo);
                cats.push(cat);

            });

            cats = cats.join('');
            DOM.html(catList, cats);
            if(S.one(".user-cats").innerHeight()>DOM.viewportHeight()-164 && isDesktop){
                          S.use("scroll,dom", function (S, Kscroll,DOM) {
                              var $ = S.all,
                                  d = new Kscroll($(".scroll_cats"), {
                                      prefix:"clear-",
                                      hotkey: true,
                                      bodydrag: true,
                                      allowArrow:true
                                  });
                          });
                          DOM.style('.scroll_cats',{"height":DOM.viewportHeight()-164});

                      }

        },

        _renderEntry = function (entry) {
            var entryDescription="<h1 class='title'>"+entry.title+"</h1><p class='time'>"+entry.pub_date+"</p><div class='content'>"+entry.description+"</div>";
            DOM.html(entryContent, entryDescription);
            DOM.attr(entryContent,'data-id',entry.id);
            DOM.attr(entryContent,'star',entry.is_stared);
            DOM.attr(entryContent,'unread',entry.is_unread);
           if(isDesktop){
                DOM.style(entryContent,{"min-height":DOM.viewportHeight()-44});
             }
            var starIcon = DOM.get('i','.toggle-star');
            var readIcon = DOM.get('i','.toggle-read');
            if(entry.is_stared){
                DOM.removeClass(starIcon,'icon-heart-empty');
                DOM.addClass(starIcon,'icon-heart');
            }else{
                DOM.addClass(starIcon,'icon-heart-empty');
                DOM.removeClass(starIcon,'icon-heart');
            }
            if(entry.is_unread){
                DOM.removeClass(readIcon,'icon-circle');
                DOM.addClass(readIcon,'icon-circle-blank');
            }else{
                DOM.addClass(readIcon,'icon-circle');
                DOM.removeClass(readIcon,'icon-circle-blank');
            }
            IO.get("http://10.232.133.213/item/"+entry.id+"/update-unread/?value=0");
        },


        currentList = [],     // current entry list


    // fetch entry list, including title/link
        fetchList = function (id) {
            if (listCache[id]) {
                renderList(listCache[id]);
            } else
            IO.get('http://10.232.133.213/channel/'+id,function(list){
                renderList(list);
                listCache[id] = list;

            },JSONP);

        };


    // handle list clicks
    Event.delegate(entryList, 'click','.title', function (evt) {

        evt.preventDefault();

        var target = evt.currentTarget,
            id;
        S.one(entryList).all("li").removeClass("current");//gaozhan

        id = DOM.attr(DOM.get('a',target), 'data-id');
        DOM.addClass(target,"current");//gaozhan
       if (!isMobile) {
           DOM.removeClass(target, 'unread');
           DOM.addClass(target, 'read');
       }
        MC.fire('entry-list:click', {
            id: id
        });


    });

    MC.on('entry-list:click', function (evt) {
        var entryId = evt.id;
        renderEntry(entryId);
    });


    Event.on(catList, 'click', function (evt) {
        evt.preventDefault();
        var target = evt.target,
            id;
        S.all('.cat-list').all("li").removeClass("current");//gaozhan
        if (target.tagName === 'A') {
            id = DOM.attr(target, 'data-id');
            DOM.addClass(S.one(DOM.parent(target,".title")),"current");//gaozhan
            MC.fire('cat-list:click', {
                id: id
            });
        }


    });
    Event.delegate('.cat-list','click','li',function(evt){
            var target = evt.currentTarget,
                li = target,
                url = "";
            if(DOM.hasClass(li,'today')){
                url = "http://10.232.133.213/items/today/";
            }else{
                if(DOM.hasClass(li,'all')){
                    url = "http://10.232.133.213/items/";
                }else{
                    if(DOM.hasClass(li,'star')){
                        url = "http://10.232.133.213/items/stared/";
                    }
                }
            }
            if(url){
                S.all('.cat-list').all("li").removeClass("current");
                DOM.addClass(target,"current");
                IO.get(url,function(list){
                    renderList(list);
                    //  listCache[id] = list;
                },JSONP);
            }

    })

    MC.on('cat-list:click', function (evt) {
        var id = evt.id;
        fetchList(id);
    });

    IO.get('http://10.232.133.213/items/', function (defaultList) {
        renderList(defaultList);

    }, JSONP);
    IO.get('http://10.232.133.213/tags/', function (cats) {
        var cats = cats.data;
        renderCatList(cats);
    }, JSONP);

    Event.on('.toggle-read','click', function(ev) {
        var target = ev.currentTarget,
            el = DOM.get('i',target),
            flag = DOM.hasClass(el,'icon-circle'), //已读
            id = DOM.attr('#entry-content','data-id');
        var url = flag?"http://10.232.133.213/item/"+id+"/update-unread/?value=1":"http://10.232.133.213/item/"+id+"/update-unread/?value=0";
        IO.get(url,function(data){
               flag? DOM.replaceClass(el,'icon-circle', 'icon-circle-blank') : DOM.replaceClass(el,'icon-circle-blank', 'icon-circle');
                var item = DOM.get('.current','#list');
                flag?DOM.replaceClass(item,'read','unread'):DOM.replaceClass(item,'unread','read');

        },JSONP);
    });

    Event.on('.toggle-star','click', function(ev) {
        var target = ev.currentTarget,
            el = DOM.get('i',target),
            flag = DOM.hasClass(el,'icon-heart'), //已收藏
            id = DOM.attr('#entry-content','data-id');
        var url = flag?"http://10.232.133.213/item/"+id+"/update-star/?value=0":"http://10.232.133.213/item/"+id+"/update-star/?value=1";
        IO.get(url,function(data){
                flag ? DOM.replaceClass(el,'icon-heart', 'icon-heart-empty') : DOM.replaceClass(el,'icon-heart-empty', 'icon-heart');
                var item = DOM.get('.current','#list');
                flag?DOM.replaceClass(item,'star','unstar'):DOM.replaceClass(item,'unstar','star');

        },JSONP);
    });
    //上一篇下一篇
    Event.on('.icon-chevron-up','click',function(e){
        var current = DOM.get('.current','#list'),
            item = DOM.prev(current,'li'),
            items = new Array(),
            len = 0,
            cur = -1;
        S.each(DOM.query('.title','#list'),function(elem){
            if(DOM.css(elem,'display')!="none"){
                if(DOM.hasClass(elem,'current')){
                    cur = len;
                }
                items[len]=elem;
                len++;
            }
        });
        if(len==0){
            return;
        }
        if(cur == -1){
            item = items[0];
        }else{
            if(cur == 0){
                return;
            }
            item = items[cur-1];
        }
        if(item){
            Event.fire(item,'click');
        }
    });
    Event.on('.icon-chevron-down','click',function(e){
        var current = DOM.get('.current','#list'),
            item = DOM.prev(current,'li'),
            items = new Array(),
            len = 0,
            cur = -1;
        S.each(DOM.query('.title','#list'),function(elem){
            if(DOM.css(elem,'display')!="none"){
                if(DOM.hasClass(elem,'current')){
                    cur = len;
                }
                items[len]=elem;
                len++;
            }
        });
        if(len==0){
            return;
        }
        if(cur == -1){
            item = items[0];
        }else{
            if(cur == len-1){
                return;
            }
            item = items[cur+1];
        }
        if(item){
            Event.fire(item,'click');
        }
    });
    // list
    var LIST_AREA = Node.one('#list');
    Event.on('.unread-posts','click',listSwitchUnread);
    Event.on('.all-posts','click',listSwitchAll);
    Event.on('.star-posts','click',listSwitchStar);
    function listSwitchAll(e){
        LIST_AREA.one('.entries').all('li').show();
        LIST_AREA.one('.column-actions').all('li').removeClass('active');
        LIST_AREA.one('.column-actions').one('li.all-posts').addClass('active');
    }
    function listSwitchUnread(e){
        LIST_AREA.one('.entries').all('li').show();
        LIST_AREA.one('.entries').all('li.read').hide();
        LIST_AREA.one('.column-actions').all('li').removeClass('active');
        LIST_AREA.one('.column-actions').one('li.unread-posts').addClass('active');
    }
    function listSwitchStar(e){
        LIST_AREA.one('.entries').all('li').hide();
        LIST_AREA.one('.entries').all('li.star').show();
        LIST_AREA.one('.column-actions').all('li').removeClass('active');
        LIST_AREA.one('.column-actions').one('li.star-posts').addClass('active');
    }
}, { requires: [
    'dom',
    'event',
    'ua',
    'ajax',
    'node',
    'xtemplate',
    'sizzle'

]});
