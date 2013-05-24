# -*- coding: utf-8 -*-
#
# author: oldj
# blog: http://oldj.net
# email: oldj.wu@gmail.com
#

import os
os.environ["DJANGO_SETTINGS_MODULE"] = "SimpleReader.settings" # 要在这一步之后才能 import django 中的模块

import traceback
from post.models import *


def main():
    channels = Channel.objects.all()
    for ch in channels:
        try:
            ch.getLatestItems()
        except Exception:
            print(traceback.format_exc())


if __name__ == "__main__":
    main()
