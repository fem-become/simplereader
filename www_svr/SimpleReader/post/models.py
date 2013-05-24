# -*- coding: utf-8 -*-

import datetime
import traceback
import re
import urllib2
from django.db import models

import trans


class Tag(models.Model):
    title = models.CharField(u"名称", max_length=32, unique=True)
    order = models.IntegerField(u"顺序", default=0)
    count = models.IntegerField(u"计数", default=0)

    def __unicode__(self):
        return u"%s" % self.title

    def getDetail(self):
        u"""取得详情"""

        data = []
        channels = Channel.objects.filter(tags=self).order_by("order")
        for ch in channels:
            data.append({
                "id": ch.id,
                "title": ch.title,
                "link": ch.link,
                "description": ch.description,
                "last_fetch_dt": ch.last_fetch_dt,
                "count": ch.count,
                "unread_count": ch.unread_count,
            })

        return data


class Channel(models.Model):
    u"""频道"""

    title = models.CharField(u"名称", max_length=255, unique=True)
    order = models.IntegerField(u"顺序", default=0)
    link = models.URLField(u"链接", max_length=1024)
    description = models.TextField(u"描述", blank=True)
    add_dt = models.DateTimeField(u"添加时间", auto_now_add=True)
    last_fetch_dt = models.DateTimeField(u"最后抓取", blank=True, null=True)
    last_item_link = models.URLField(u"最后Item链接", max_length=1024, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, null=True)
    count = models.IntegerField(u"计数", default=0)
    unread_count = models.IntegerField(u"未读计数", default=0)

    def __unicode__(self):

        return u"<%s>" % self.title

    def getLatestItems(self):
        u""""""

        c = urllib2.urlopen(self.link, timeout=30).read()
        c = trans.RSS2Dict(c)

        items = c["rss"]["channel"]["item"]

        new_items = []
        for item in items:
            if item["link"].strip() == self.last_item_link:
                break

            new_items.append(item)

        for item in new_items:
            if not self.try2AddItem(item):
                break

    def try2AddItem(self, item_doc):

        link = item_doc["link"].strip()
        print(link)

        try:
            Item.objects.get(link=link)
            return False
        except Item.DoesNotExist:
            pass

        print(item_doc)
        item = Item(
            channel=self,
            title=item_doc["title"],
            link=item_doc["link"],
            description=item_doc["description"],
            pub_date=trans.try2parseDateTimeFromStr(item_doc.get("pubDate")),
            author=item_doc.get("author", ""),
        )
        try:
            item.save()
        except Exception:
            print(traceback.format_exc())
            return False

        self.last_item_link = link
        self.count += 1
        self.unread_count += 1
        self.save()

        return True

    def getJSONData(self):

        data = {
            "id": self.id,
            "title": self.title,
            "link": self.link,
            "order": self.order,
            "count": self.count,
            "unread_count": self.unread_count,
        }

        return data


class Item(models.Model):
    channel = models.ForeignKey(Channel, verbose_name=u"频道")
    title = models.CharField(u"名称", max_length=255)
    order = models.IntegerField(u"顺序", default=0)
    link = models.URLField(u"URL", max_length=1024)
    description = models.TextField(u"描述", blank=True)
    pub_date = models.DateTimeField(u"发布时间", null=True)
    author = models.CharField(u"作者", max_length=50, blank=True)
    is_unread = models.BooleanField(u"未读", default=True)
    # todo 添加star字段
    is_stared = models.BooleanField(u"收藏", default=False)

    def __unicode__(self):
        return u"Item<%s>" % self.title

    @property
    def description_short(self):

        c = self.description
        c = re.sub(r"<.*?>", "", c)
        c = c.replace("&nbsp;", " ")
        c = re.sub(r"\s+", " ", c)

        return u"%s.." % c.strip()[:100]

    def getSummary(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description_short,
            "link": self.link,
            "pub_date": datetime.datetime.strftime(self.pub_date, "%Y-%m-%d %H:%M:%S"),
            "author": self.author,
            "is_unread": self.is_unread,
            "is_stared": self.is_stared,
        }

    def getDatail(self):
        data = self.getSummary()
        data.update({
            "description": self.description,
        })

        return data
