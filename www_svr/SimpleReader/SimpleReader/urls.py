# -*- coding: utf-8 -*-

import os
from django.conf.urls import patterns, include, url

WEB_ROOT_DIR = os.path.join(os.path.abspath(__file__))
CLT_ROOT_DIR = WEB_ROOT_DIR
for i in range(4):
    CLT_ROOT_DIR = os.path.split(CLT_ROOT_DIR)[0]
CLT_ROOT_DIR = os.path.join(CLT_ROOT_DIR, "www_clt")
print(WEB_ROOT_DIR, CLT_ROOT_DIR)

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'SimpleReader.views.home', name='home'),
    # url(r'^SimpleReader/', include('SimpleReader.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += patterns("post.views",
    (r"^$", "index"),
    (r"^test/$", "test"),
    (r"^tags/$", "tagList"),
    (r"^tag/(?P<tag_id>\d+)/$", "channelsByTagId"),
    (r"^channel/(?P<ch_id>\d+)/$", "itemList"),
    (r"^items/$", "itemList"),
    (r"^items/today/$", "itemsForToday"),
    (r"^items/stared/$", "itemsForStared"),
    (r"^item/(?P<item_id>\d+)/$", "itemDetail"),
    (r"^item/(?P<item_id>\d+)/update-star/$", "itemUpdateStar"),
    (r"^item/(?P<item_id>\d+)/update-unread/$", "itemUpdateUnread"),
)

# static files
urlpatterns += patterns("django.views.static",
    (r"^s/(?P<path>.*)$", "serve", {"document_root": CLT_ROOT_DIR}),
)
