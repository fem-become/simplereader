# -*- coding: utf-8 -*-

import datetime
# import urllib
import simplejson as json
from django.shortcuts import render_to_response  # , get_object_or_404
from django.http import HttpResponseRedirect
from django.core.paginator import Paginator  # , InvalidPage, EmptyPage

from models import Tag, Channel, Item

# import trans
# from rss_srcs import RSS_SRCs


def jsonpable(func):

    def newf(request, *kw, **kw2):
        callback = request.GET.get("callback")
        back = func(request, *kw, **kw2)
        back = json.dumps(back)
        if callback:
            back = "%s(%s)" % (callback, back)

        return render_to_response("blank.html", {
            "content": back,
        })

    return newf


def test(request):

#    url = "http://news.baidu.com/n?cmd=1&class=internet&tn=rss"
#    url = "http://feed.feedsky.com/oldj"
#     url = RSS_SRCs[3][1]

    # c = urllib.urlopen(url).read()
#    c = c.decode("GB18030")
#     c = trans.RSS2JSON(c)

    c = {
        "a": 1,
        "b": 2,
    }

    res = render_to_response("blank.html", {
        "content": c,
    })
    print(dir(res))
    for k in dir(res):
        print("-" * 50)
        print(k)
        m = getattr(res, k)
        print(m)
        if callable(m):
            try:
                print(m())
            except Exception:
                pass

    return res


def get404(msg=None):

    return {
        "content": json.dumps({
            "success": False,
            "code": 404,
            "message": msg or "",
        })
    }


def getOK(msg=None):

    return {
        "content": json.dumps({
            "success": True,
            "code": 200,
            "message": msg or "",
        }),
    }


@jsonpable
def tagList(request):

    chs = Channel.objects.all().order_by("order")
    datas = {
        "success": True,
        "data": [ch.getJSONData() for ch in chs],
    }

    return datas


@jsonpable
def channelsByTagId(request, tag_id):

    try:
        tag = Tag.objects.get(id=tag_id)
    except Tag.DoesNotExist:
        return get404()

    return json.dumps(tag.getDetail())


def getZeroOClock():

    today = datetime.date.today()
    return datetime.datetime(today.year, today.month, today.day)


@jsonpable
def itemList(request, ch_id=None,
             is_today=False, is_stared=False, is_unread=False,
             ):

    page_size = 50
    page = request.GET.get("page", "").strip()
    try:
        page = int(page)
        if page < 0:
            page = 1
    except Exception:
        page = 1

    keyword = request.GET.get("q", "").strip()

    items = Item.objects.all().order_by("-pub_date")
    if ch_id:
        items = items.filter(channel__id=ch_id)
    if is_today:
        items = items.filter(pub_date__gte=getZeroOClock())
    if is_stared:
        items = items.filter(is_stared=True)
    if is_unread:
        items = items.filter(is_unread=True)
    if keyword:
        items = items.filter(description__contains=keyword)

    paginator = Paginator(items, page_size)
    items_in_current_page = paginator.page(page)

    data = [item.getSummary() for item in items_in_current_page.object_list]

    return data


def itemsForToday(request):

    return itemList(request, is_today=True)


def itemsForStared(request):

    return itemList(request, is_stared=True)


def itemsForUnRead(request):

    return itemList(request, is_unread=True)


@jsonpable
def itemDetail(request, item_id):

    try:
        item = Item.objects.get(id=item_id)
    except Exception:
        return get404(u"item does not exist!")

    item.is_unread = False

    return item.getDatail()


@jsonpable
def itemUpdateStar(request, item_id):

    try:
        item = Item.objects.get(id=item_id)
    except Item.DoesNotExist:
        return get404(u"item does not exist!")

    item.is_stared = request.GET.get("value") == "1"
    item.save()

    return getOK("%s" % item.is_stared)


@jsonpable
def itemUpdateUnread(request, item_id):

    try:
        item = Item.objects.get(id=item_id)
    except Item.DoesNotExist:
        return get404(u"item does not exist!")

    item.is_unread = request.GET.get("value") == "1"
    item.save()

    return getOK("%s" % item.is_unread)


def index(request):

    return HttpResponseRedirect("/s/index.html")
