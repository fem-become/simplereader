# -*- coding: utf-8 -*-
#
# author: oldj
# blog: http://oldj.net
# email: oldj.wu@gmail.com
#

import re
import datetime
import simplejson as json
#from xml.dom import minidom
import xmltodict

def RSS2Dict(rss):

    return xmltodict.parse(rss)


def RSS2JSON(rss):
    u"""将一段RSS内容转为JSON"""

#    dom = minidom.parseString(rss)
#    print(dom)
#    c = json.load(dom)

    c = RSS2Dict(rss)
    c = json.dumps(c)

    return c


def try2parseDateTimeFromStr(dt_str):
    u"""尝试将一段时间字符串转为时间格式"""
    print(dt_str)
    dt_str = re.sub(r"[+-]\d+", "", dt_str).strip()

    templates = (
        # 2013-04-01 13:44:31
        (r"\d+\-\d+\-\d+\s+\d+:\d+:\d+", "%Y-%m-%d %H:%M:%S"),

        # Mon, 01 Apr 2013 10:51:57 GMT
        (r"\w+, \d+ \w+ \d+ \d+:\d+:\d+ \w+", "%a, %d %b %Y %H:%M:%S %Z"),

        # Fri, 09 Dec 2011 16:31:13 +0800
        (r"\w+, \d+ \w+ \d+ \d+:\d+:\d+ \+\d+", "%a, %d %b %Y %H:%M:%S %z"),

        # Fri, 09 Dec 2011 16:31:13
        (r"\w+, \d+ \w+ \d+ \d+:\d+:\d+", "%a, %d %b %Y %H:%M:%S"),
    )

    for p, f in templates:
        if re.match(p, dt_str):
            return datetime.datetime.strptime(dt_str, f)

    return dt_str
