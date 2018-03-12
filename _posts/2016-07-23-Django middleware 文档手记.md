---
layout: post
title: "Django middleware 文档手记"
date: 2016-07-23 20:35:54
category: programming
tags: python django
finished: true
---


## 中间件

中间件是一个钩子框架，它们可以介入 Django 的请求和响应处理过程。它是一个轻量级、底层的“插件”系统，用于在全局修改 Django 的输入或输出。

每个中间件组件负责完成某个特定的功能。例如，Django 包含的一个中间件组件 `AuthenticationMiddleware` ，它使用会话将用户和请求关联起来。

这篇文档讲解中间件如何工作、如何激活中间件以及如何编写你自己的中间件。

## 编写自己的中间件

中间件工厂是一个可调用的对象，它接收一个可调用的对象 `get_response` ，然后返回一个中间件。
中间件是一个接收 `request` 然后返回 `response` 的可调用对象，和视图差不多(但是它是在视图之前接收 `request`，并在视图之后返回 `response`)。

一个中间件可以写为函数的形式：

```python
def simple_middleware(get_response):
    # One-time configuration and initialization.

    def middleware(request):
        # Code to be executed for each request before
        # the view (and later middleware) are called

        response = get_response(request)

        # Code to be executed for each request/response after the view is called. 

        return response

    return middleware
```
或者写成类的形式：

```python
class SimpleMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        
        response = self.get_response(request)

        # Code to be executed for each request/response after the view is called. 
        return response
```
这个可调用的 `get_response` 是由 Django 提供，它可能是视图（如果这个中间件是最后一个的话）或者是中间件链中的下一个。当前的中间件并不需要在意它是什么，只要知道它代表给下一个目标的即可。

*`__init__(get_response)`*

中间件工厂必须接受一个 `get_response` 参数。你也可以在这个方法里面给中间件初始化一些全局的状态。你要铭记如下两个警告：

* Django初始化你的中间件只需 `get_response` 参数，所以不要传递其他的参数。

* 和 `__call__()` 方法每次请求都会调用一次不同，`__init__()` 方法只在web服务器开启的时候调用一次。

## 激活中间件

要激活一个中间件组件，需要把它添加到 Django 配置文件中的 `MIDDLEWARE` 列表中。

在 `MIDDLEWARE` 中，每一个中间件组件用字符串的方式描述：一个完整的Python全路径加上中间件的类名称。例如，使用 `django-admin startproject` 创建工程的时候生成的默认值：

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```
Django的程序中，中间件不是必需的 —— 只要你喜欢，`MIDDLEWARE` 可以为空 —— 但是强烈推荐你至少使用 `CommonMiddleware`。

`MIDDLEWARE` 中的顺序非常重要，因为一个中间件可能依赖于另外一个。例如，`AuthenticationMiddleware` 在会话中储存已认证的用户。所以它必须在 `SessionMiddleware` 之后运行。

## 中间件的位置和调用顺序

在请求阶段中，调用视图之前，Django 会按照 `MIDDLEWARE` 中定义的顺序自顶向下应用中间件。会用到两个钩子：

* `process_request()`

* `process_view()`

在响应阶段中，调用视图之后，中间件会按照相反的顺序应用，自底向上。会用到三个钩子：

* `process_exception()` （仅当视图抛出异常的时候）

* `process_template_response()` （仅用于模板响应）

* `process_response()`

简单来说，`MIDDLEWARE` 中的第一个中间件最接近底层，它接受外部的 `HttpRequest` 然后传给后面一个中间件，一直到最后一个中间件把请求传到视图处，接着视图把 `HttpResponse` 返回给最后一个中间件，然后往上传递至第一个中间件，再把响应发给客户端。

你可以把它想象成一颗洋葱：每个中间件都是包裹视图的一层“皮”，在 `MIDDLEWARE` 中，靠前的中间件在外层。

## 中间件钩子

除了基本的 `request/response` 中间件模式之外，你也可以给基于类的中间件添加下面三个方法：

*`process_view()`*

`process_view(request, view_func, view_args, view_kwargs)`

`request` 是一个 `HttpRequest` 对象。`view_func` 是 Django 会调用的一个 Python 的函数。（它是一个真实的函数对象，不是函数的字符名称。) `view_args` 是一个会被传递到视图的位置参数列表，而`view_kwargs` 是一个会被传递到视图的关键字参数字典。 `view_args` 和 `view_kwargs` 都不包括第一个视图参数( `request` )。

`process_view()` 会在 Django 调用视图之前被调用。

它将返回 `None` 或一个 `HttpResponse` 对象。如果返回 `None`，Django 将会继续处理这个请求，执行其它中间件的 `process_view()` ，然后调用对应的视图。如果返回一个 `HttpResponse` 对象，Django 就不用再去调用其它的视图；它将对 `HttpResponse` 运用响应阶段的中间件，并返回结果。

**注意**

在中间件内部，视图运行之前或在 `process_view()` 方法中访问request.POST 或request.REQUEST 将阻碍该中间件之后的所有视图无法修改请求的上传处理程序，一般情况下要避免这样使用。

类 `CsrfViewMiddleware` 可以被认为是个例外，因为它提供 `csrf_exempt()` 和 `csrf_protect()` 两个装饰器，允许视图显式控制在哪个点需要开启CSRF验证。

*`process_exception(request, exception)`*

`request` 是一个 `HttpRequest` 对象。`exception` 是一个被视图中的方法抛出来的 `Exception` 对象。

当一个视图抛出异常时，Django会调用 `process_exception()` 来处理。`process_exception()` 应该返回一个 `None` 或者一个 `HttpResponse` 对象。如果它返回一个 `HttpResponse` 对象，模型响应和响应中间件会被应用，响应结果会返回给浏览器。否则， 默认的异常处理机制将会被触发。

再次提醒，在处理响应期间，中间件的执行顺序是倒序执行的，这包括 `process_exception`。如果一个异常处理的中间件返回了一个响应，那这个中间件上面的中间件都将不会被调用。

*`process_template_response()`*

`process_template_response(request, response)`

`request` 是一个 `HttpRequest` 对象。`response` 是一个`TemplateResponse` 对象（或等价的对象），由Django视图或者中间件返回。

如果响应的实例有 `render()` 方法，`process_template_response()` 会在视图刚好执行完毕之后被调用，这表明了它是一个 `TemplateResponse` 对象（或等价的对象）。

这个方法必须返回一个实现了 `render()` 方法的响应对象。它可以修改给定的 `response` 对象，通过修改 `response.template_name` 和 `response.context_data` 或者它可以创建一个全新的  `TemplateResponse` 或等价的对象。

你不需要显式渲染响应 —— 一旦所有的模板响应中间件被调用，响应会自动被渲染。

在一个响应的处理期间，中间件以相反的顺序运行，这包括process_template_response()。

## 处理流式响应

和 `HttpResponse` 不同， `StreamingHttpResponse` 没有 `content` 属性。因此，中间件不能再假设所有的响应都有 `content` 属性。如果它们（中间件）需要获取内容，那中间件需要对流式响应做测试以及根据相应的行为做调整：

```python
if response.streaming:
    response.streaming_content = wrap_streaming_content(response.streaming_content)
else:
    response.content = alter_content(response.content)
```

**注意**

`streaming_content` 应该被假设为是很大的以至于内存无法容纳。响应中间件可以把它包装进一个新的迭代器中（但一定不要消耗该流），典型的包装实现如下：

```python
def wrap_streaming_content(content):
    for chunk in content:
        yield alter_content(chunk)
```

## 异常处理

Django 自动的把视图或是中间件抛出的异常转换为适当的 `HTTP` 响应并带有错误状态码。

这种转换发生在中间件的层与层之间（即上一个中间件之后与下一个中间件之前），所以每个中间件都可以依赖于通过调用它的 `get_response` 对象来获得某种 `HTTP` 响应。中间件也不必担心在 `try/catch` 中捕获的由 `get_response` 抛出的异常会被下一个中间件或视图抛出。比如，某个中间件抛出了一个 `Http404` 异常，它的下一个中间件并不会看到这个异常，取而代之的是，获得了一个有着状态码为 `404` 的 `HttpResponse` 对象。
  

## 内置的中间件

Django自带了很多中间件可供使用：

**Cache middleware**
**“Common” middleware**
**Exception middleware**
**GZip middleware**
**Conditional GET middleware**
**Locale middleware**
**Message middleware**
**Security middleware**
**Session middleware**
**Site middleware**
**Authentication middleware**
**CSRF protection middleware**
**X-Frame-Options middleware**

欲用自查。