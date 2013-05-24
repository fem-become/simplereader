KISSY.add('pad', function (S, DOM, Event,Node) {
    //pad添加
    var DOM = S.DOM, Event = S.Event;
    var height = DOM.viewportHeight(),
        tmp = DOM.offset('#content').top + parseInt(DOM.css('.column-actions','height').slice(0,-2));
    DOM.css('.sub-entry','height',height-tmp+'px');

    //window resize
    Event.on(window,'resize',function(e){
        var height = DOM.viewportHeight(),
            tmp = DOM.offset('#content').top + parseInt(DOM.css('.column-actions','height').slice(0,-2));
        DOM.css('.sub-entry','height',height-tmp+'px');
    });

    //todo swipe和hover冲突
    Event.on('#list,#entry','swipe',function(e){
        if(e.direction=="up"||e.direction=="down"){
            return;
        }
        var lis = DOM.query('li','#cats'),
            len = lis.length;
        if(DOM.css('#cats','display')=="none"){
            //显示第一屏

            DOM.css('#entry','width','0');
            DOM.css('#list','width','65%');

            S.later(function(){
                DOM.css('#cats','display','block');
            },500);

            for(var tmp = 0;tmp<len/2;tmp++){
                S.later(function(tmp){
                    DOM.css(lis[tmp],'transform','perspective(500px) rotateY(0deg)');
                    DOM.css(lis[len-1-tmp],'transform','perspective(500px) rotateY(0deg)');
                    DOM.css(lis[tmp],'-webkit-transform','perspective(500px) rotateY(0deg)');
                    DOM.css(lis[len-1-tmp],'-webkit-transform','perspective(500px) rotateY(0deg)');
                },500+100*tmp,false,null,tmp);
            }

        }else{
            //隐藏第一屏
            for(var tmp = 0;tmp<len/2;tmp++){
                S.later(function(tmp){
                    DOM.css(lis[tmp],'transform','perspective(500px) rotateY(90deg)');
                    DOM.css(lis[len-1-tmp],'transform','perspective(500px) rotateY(90deg)');
                    DOM.css(lis[tmp],'-webkit-transform','perspective(500px) rotateY(90deg)');
                    DOM.css(lis[len-1-tmp],'-webkit-transform','perspective(500px) rotateY(90deg)');
                },100*tmp,false,null,tmp);
            }
            S.later(function(){
                DOM.css('#cats','display','none');
                DOM.css("#list",'transition-duration',0.1*len/2+'s');
                DOM.css("#list",'-webkit-transition-duration',0.1*len/2+'s');
                DOM.css('#list','width','30%');

                DOM.css("#entry",'transition-duration',0.1*len/2+'s');
                DOM.css("#entry",'-webkit-transition-duration',0.1*len/2+'s');
                DOM.css('#entry','width','70%');
                DOM.css('#entry','left','0');
                DOM.css('#entry','top','0');
            },100*len/2);
        }
    });

    Event.delegate('#list','click','.title',function(e){
        if(DOM.css('#cats','display')=='block'){
            Event.fire('#list','swipe');   //todo 内容加载不出来的时候会卡住，预设内容？
        }
        DOM.removeClass('.title','cur-title');
        DOM.addClass(e.currentTarget,'cur-title');
    });

    Event.on('.icon-remove-sign','click',function(){
        DOM.val('input','');
    });


}, { requires: [
    'dom',
    'event',
    'node'
]});

