# -*- coding: utf-8 -*-
#
# author: oldj
# blog: http://oldj.net
# email: oldj.wu@gmail.com
#

from django.contrib import admin
from models import *

class TagAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "count",
        )

    search_fields = ("title",)
    ordering = ("-id",)

admin.site.register(Tag, TagAdmin)


class ChannelAdmin(admin.ModelAdmin):

    def tags_list(self, obj):
        return ", ".join([u"%s" % tag for tag in obj.tags.all()])

    list_display = (
        "id",
        "title",
        "link",
        "tags_list",
        )

    search_fields = ("title", "link",)
    ordering = ("-id",)

admin.site.register(Channel, ChannelAdmin)


class ItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "channel",
        "pub_date",
        )

    search_fields = ("title", "link",)
    ordering = ("-id",)

admin.site.register(Item, ItemAdmin)
