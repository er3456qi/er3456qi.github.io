---
layout: post
title:  "Django urls 文档手记"
date:   2016-07-15 21:46:53
meta_description: Django urls 文档手记
categories:
- blog
tags:
- Python
---


## Django 如何处理一个请求

当一个用户请求 Django 站点的一个页面，下面是 Django 系统决定执行哪个 Python 代码使用的算法：

1. Django 决定要使用的根 `URLconf` 模块。通常，这个值就是`ROOT_URLCONF` 的设置，但是如果进来的 `HttpRequest` 对象具有一个 `urlconf` 属性（通过中间件 `request processing` 设置），则使用这个值来替换 `ROOT_URLCONF` 设置。

2. Django 加载该 Python 模块并寻找可用的 `urlpatterns`。它是 `django.conf.urls.url()` 实例的一个 Python 列表。

3. Django 依次匹配每个 `URL` 模式，在与请求的 `URL` 匹配的第一个模式停下来。

4. 一旦其中的一个正则表达式匹配上，Django 将导入并调用给出的视图，它是一个简单的 Python 函数（或者一个基于类的视图）。视图将获得如下参数:

    * 一个 `HttpRequest` 实例。

    * 如果匹配的正则表达式返回了没有命名的组，那么正则表达式匹配的内容将作为位置参数提供给视图。

    * 关键字参数由正则表达式匹配的命名组组成，但是可以被 `django.conf.urls.url()` 的可选参数 `kwargs` 覆盖。

5. 如果没有匹配到正则表达式，或者如果过程中抛出一个异常，Django 将调用一个适当的错误处理视图。

例子：

```python
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^articles/2003/$', views.special_case_2003),
    url(r'^articles/([0-9]{4})/$', views.year_archive),
    url(r'^articles/(?P<year>[0-9]{4})/$', views.year_archive),
]
```
注：

* 若要从 `URL` 中捕获一个值，只需要在它周围放置一对圆括号。你也可以对其命名，在Python 正则表达式中，命名正则表达式组的语法是 `(?P<name>pattern)`，其中 `name` 是组的名称， `pattern` 是要匹配的模式。顺便一提，`include`的 `URL` 会收到来自父 `URLconf` 捕获的任何参数。

* 不需要添加一个前导的反斜杠，因为每个 `URL` 都有。例如，应该是 `^articles` 而不是 `^/articles`。

* 每个正则表达式前面的 `'r'` 是可选的但是建议加上。它告诉Python 这个字符串是“原始的” —— 字符串中任何字符都不应该转义。

另外，在匹配 `URL` 时， `url()` 函数还可以接收可选的第三个参数作为额外数据，该参数是字典类型。

## URLconf 在什么上查找

请求的 `URL` 被看做是一个普通的 Python 字符串， `URLconf` 在其上查找并匹配。进行匹配时将不包括 `GET` 或 `POST` 请求方式的参数以及域名。

每个捕获的参数都作为一个普通的 Python 字符串传递给视图，无论正则表达式使用的是什么匹配方式：

```python
url(r'^articles/(?P<year>[0-9]{4})/$', views.year_archive),
```
... `views.year_archive()` 的 `year` 参数将是一个字符串，即使用 `[0-9]{4}` 值匹配整数字符串。

在视图函数中，参数可以有默认值。

`urlpatterns` 中的每个正则表达式在第一次访问它们时被编译。这使得系统相当快。

### 嵌套的参数

正则表达式允许嵌套参数，Django 将解析它们并传递给视图。当反向解析（`reverse`）时，Django 将尝试填满所有外围捕获的参数，并忽略嵌套捕获的参数。考虑下面的URL 模式，它带有一个可选的 `page` 参数：

```python
from django.conf.urls import url

urlpatterns = [
    url(r'blog/(page-(\d+)/)?$', blog_articles),                  # bad
    url(r'comments/(?:page-(?P<page_number>\d+)/)?$', comments),  # good
]
```
两个模式都使用嵌套的参数，其解析方式是：例如 `blog/page-2/` 将匹配 `blog_articles` 并带有两个位置参数 `page-2/` 和 `2`。第二个 `comments` 的模式将匹配 `comments/page-2/` 并带有一个值为 `2` 的关键字参数 `page_number` 。这个例子中外围参数是一个不捕获的参数 `(?:...)`。

`blog_articles` 视图需要最外层捕获的参数来反向解析，在这个例子中是 `page-2/` 或者没有参数，而 `comments` 可以不带参数或者用一个 `page_number` 值来反向解析。

嵌套捕获的参数使得视图参数和 `URL` 之间存在强耦合，正如 `blog_articles` 所示：视图接收`URL（page-2/）` 的一部分，而不只是视图所要的值。这种耦合在反向解析时更加显著，因为反向解析视图时我们需要传递URL 的一个片段而不只是 `page` 的值。

作为一个经验的法则，你应该只捕获视图需要的值，对于正则表达式需要而视图函数会忽略的值，你应该使用 `(?:...)` 来表示这个参数不需要捕获，只是正则表达式需要它。


## URL 的反向解析

在 web 项目时，一个常见的需求是获得 `URL` 的最终形式，以用于嵌入到生成的内容中（视图中和显示给用户的 `URL` 等）或者用于处理服务器端的导航（重定向等）。

我们不希望硬编码这些 `URL`，其弊端就不再多说。

要获取一个 `URL`，最初拥有的信息是负责处理它的视图的标识（例如名字），与查找正确的 `URL` 的其它必要的信息如视图参数的类型（位置参数、关键字参数）和值。

Django 提供了一个解决方案使得 `URL` 映射是 `URL` 设计唯一的储存库。你用你的 `URLconf` 填充它，然后可以双向使用它：

* 根据用户/浏览器发起的 `URL` 请求，它调用正确的Django 视图，并从 `URL` 中提取它的参数需要的值。

* 根据 Django 视图的标识和将要传递给它的参数的值，获取与之关联的 `URL`。

在需要 `URL` 的地方，对于不同层级，Django 提供不同的工具用于 `URL` 反向解析：

* 在模板中：使用 `url` 模板标签（有参数的话，参数直接跟在后面）。

* 在 Python 代码中：使用 `django.core.urlresolvers.reverse()` 函数。

* 在更高层的与处理 Django 模型实例相关的代码中：使用 `get_absolute_url()` 方法。


## URL 命名空间

`URL` 使用命名空间，主要是为了防止在反向生成 `URL` 时造成歧义，因为多个app中，有可能有几个app有相同的视图名。

命名空间的使用，在模板中： `namespace:viewname`，也可以嵌套多个命名空间，如 `a:b:c:viewname`。
在 python 代码中：`namespace.viewname`， `include()` 函数有 `namespace` 参数，你可以显式使用，如果 `include()` 中包括多个`URLconfs`，也可以是这种形式： 
`(<list of url() instances>, <application namespace>)`。

`URL` 命名空间的声明是在`urls.py`模块中指定 `app_name`：

```python
from django.conf.urls import url
from . import views

app_name = 'polls'
urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
]

