---
layout: post
title:  "Django request_response 文档手记"
date:   2016-07-29 22:02:23
meta_description: Django request_response 文档手记
categories:
- blog
tags:
- Python
---


# `Request` 对象和 `Response` 对象


Django 使用 `Request` 对象和 `Response` 对象在系统间传递状态。

当一个页面被请求时，Django会创建一个包含请求元数据的 `HttpRequest` 对象。然后Django加载适当的视图，把 `HttpRequest` 对象作为第一个参数传入视图函数中。每个视图会返回一个 `HttpResponse` 对象。它们两个都是在 `django.htt` 模块中定义的。

## HttpRequest 对象

### 属性

下面除非特别说明，所有属性都认为是只读的。

#### `HttpRequest.scheme`

一个字符串，表示请求的模式（通常是http 或https）。

#### `HttpRequest.body`

一个字节字符串，表示原始 `HTTP` 请求的正文。它对于处理非HTML 形式的数据非常有用：二进制图像、`XML` 等。 如果要处理常规的表单数据，应该使用 `HttpRequest.POST` 。

你也可以使用“类似文件”形式的接口从 `HttpRequest` 中读取该数据。

#### `HttpRequest.path`

一个字符串，表示请求的页面除域名外的完整路径。

比如： `"/music/bands/the_beatles/"`

#### `HttpRequest.path_info`

在某些 Web 服务器配置下，主机名后的URL 部分被分成脚本前缀部分和路径信息部分。`path_info` 属性将始终包含路径信息部分，不论使用的 Web 服务器是什么。使用它代替 `path` 可以让代码在测试和开发环境中更容易地切换。

例如，如果应用的 WSGIScriptAlias 设置为 "`/minfo`"，那么当 `path` 是"`/minfo/music/bands/the_beatles/`" 时 `path_info` 将是"`/music/bands/the_beatles/`"。

#### `HttpRequest.method`

一个字符串，表示请求使用的HTTP 方法。必须使用大写。例如：

```python
if request.method == 'GET':
    do_something()
elif request.method == 'POST':
    do_something_else()
```

#### `HttpRequest.encoding`

一个字符串，表示提交的数据的编码方式（如果为 `None` 则表示使用 `DEFAULT_CHARSET` 设置）。这个属性是可写的，你可以修改它来修改访问表单数据使用的编码。接下来对属性的任何访问（例如从 `GET` 或 `POST` 中读取数据）将使用新的 `encoding` 值。如果你知道表单数据的编码不在 `DEFAULT_CHARSET` 中，则使用它。

#### `HttpRequest.content_type`

一个字符串，表示请求（ `request` ）的 `MIME` 类型。在某些 `CONTENT_TYPE` 头中解析。

#### `HttpRequest.content_params`

一个字典类型对象，包含 `CONTENT_TYPE` 头数据中的所有参数。

#### `HttpRequest.GET`

一个类似于字典的对象，包含 `HTTP GET` 的所有参数。

#### `HttpRequest.POST`

一个包含所有给定的 `HTTP POST` 参数的类字典对象，提供了包含表单数据的请求。如果需要访问请求中的原始或非表单数据，可以使用 `HttpRequest.body` 属性。

`POST` 请求可以带有空的 `POST` 字典 —— 如果通过 `HTTP POST` 方法请求一个表单但是没有包含表单数据的话。因此，不应该使用 `if request.POST` 来检查使用的是否是POST 方法；应该使用 `if request.method == "POST"`。

注意：`POST` 不包含上传的文件信息。参见 `FILES`。

#### `HttpRequest.COOKIES`

一个标准的Python 字典，包含所有的 `cookie`。键和值都为字符串。

#### `HttpRequest.FILES`

一个类似于字典的对象，包含所有的上传文件。`FILES` 中的每个键为`<input type="file" name="" />` 中的name。`FILES` 中的每一个值都是一个已经上传的文件。

注意， `FILES` 只有在请求的方法为 `POST` 且提交的 `<form>` 带有 `enctype="multipart/form-data"` 的情况下才会包含数据。否则，`FILES` 将为一个空的类似于字典的对象。

#### `HttpRequest.META`

一个标准的 Python 字典，包含所有的 HTTP 头部。具体的头部信息取决于客户端和服务器。

#### `HttpRequest.resolver_match`

一个 `ResolverMatch` 的实例，表示解析后的 `URL`。这个属性只有在 `URL` 解析方法之后才设置，这意味着它在所有的视图中可以访问，但是在在 `URL` 解析发生之前执行的中间件方法中不可以访问（比如 `process_reques`t，但你可以使用 `process_view` 代替）。

### 由app设置的属性（Attributes set by application code）

这些属性Django本身并不设置，如果你的app中设置了这些属性，Django会使用它们。

#### `HttpRequest.current_app`

模板标签 `url` 会使用它作为 `reverse()` 的参数。

#### `HttpRequest.urlconf`

它将用来作为当前的请求的根 `URL` 配置，并覆盖 `ROOT_URLCONF` 设置。

`urlconf` 可以被设置为 `None` 以恢复被更改的 `URL` 设置，重置为 `ROOT_URLCONF` 中的配置。

### 由中间件设置的属性（Attributes set by middleware）

一些在 Django 标准库的中的中间件设置在请求（`request`）上的属性。如果你没有在 `request`上看到这些属性，请确保你已经引入了相应的中间件。

#### `HttpRequest.session`

来自 `SessionMiddleware`: 一个既可读又可写的类似于字典的对象，表示当前的会话。

#### `HttpRequest.site`

来自 `CurrentSiteMiddleware`: 一个通过 `get_current_site()` 返回的站点的实例，表示当前站点。

#### `HttpRequest.user`

来自 `AuthenticationMiddleware`： 一个 `AUTH_USER_MODEL` 类型的对象，表示当前登录的用户。如果用户当前没有登录，`user` 将设置为 `django.contrib.auth.models.AnonymousUser` 的一个实例。你可以通过 `is_authenticated()` 区分它们，像这样：

```python
if request.user.is_authenticated:
    ... # Do something for logged-in users.
else:
     ... # Do something for anonymous users.
```

### 方法

#### `HttpRequest.get_host()`

根据从 `HTTP_X_FORWARDED_HOST` （如果打开 `USE_X_FORWARDED_HOST` ）和 `HTTP_HOST` 头部信息返回请求的原始主机。如果这两个头部没有提供相应的值，则使用 `SERVER_NAME` 和 `SERVER_PORT`。

例如: `"127.0.0.1:8000"`

注意，当主机位于多个代理的后面，`get_host()` 方法将会失败。有一个解决办法是使用中间件重写代理的头部，例如下面的例子：

```python
from django.django.utils.deprecation import MiddlewareMixin

class MultipleProxyMiddleware(MiddlewareMixin):
    FORWARDED_FOR_FIELDS = [
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED_HOST',
        'HTTP_X_FORWARDED_SERVER',
    ]

    def process_request(self, request):
        """
        Rewrites the proxy headers so that only the most
        recent proxy is used.
        """
        for field in self.FORWARDED_FOR_FIELDS:
            if field in request.META:
                if ',' in request.META[field]:
                    parts = request.META[field].split(',')
                    request.META[field] = parts[-1].strip()
```
这个中间件应该放置在所有依赖于 `get_host()` 的中间件之前 —— 例如，`CommonMiddleware` 和 `CsrfViewMiddleware`。

#### `HttpRequest.get_port()`

根据从 `HTTP_X_FORWARDED_PORT` （如果打开 `USE_X_FORWARDED_PORT` ）和 `SERVER_PORT` 头部信息，返回请求的原始主机的端口号。

#### `HttpRequest.get_full_path()`

返回path，如果有的话将加上查询字符串。

如： `"/music/bands/the_beatles/?print=true"`

#### `HttpRequest.build_absolute_uri(location)`

返回 `location` 的绝对 `URI`。如果 `location` 没有提供，则设置为 `request.get_full_path()`。

如果 `URI` 已经是一个绝对的 `URI`，将不会修改。否则，使用请求中的服务器相关的变量构建绝对 `URI`。

例如：`"http://example.com/music/bands/the_beatles/?print=true"`

注意，不建议在同一站点上混合使用 `HTTP` 和 `HTTPS`， 因为 `build_absolute_uri() `会生成和请求模式一样的 `URI`。如果你想要让用户使用 `HTTPS` 建议你把 `HTTP` 重定向为 `HTTPS`。

#### `HttpRequest.get_signed_cookie(key, default=RAISE_ERROR, salt='', max_age=None)`

返回签名过的 `Cookie` 对应的值，如果签名不再合法则返回 `django.core.signing.BadSignature`。如果提供 `default` 参数，将不会引发异常并返回 `default` 的值。

可选参数 `salt` 可以用来对安全密钥强力攻击提供额外的保护。 `max_age` 参数用于检查 `Cookie` 对应的时间戳以确保 `Cookie` 的时间不会超过 `max_age` 秒。

示例：

```python

>>> request.get_signed_cookie('name')
'Tony'
>>> request.get_signed_cookie('name', salt='name-salt')
'Tony' # assuming cookie was set using the same salt
>>> request.get_signed_cookie('non-existing-cookie')
...
KeyError: 'non-existing-cookie'
>>> request.get_signed_cookie('non-existing-cookie', False)
False
>>> request.get_signed_cookie('cookie-that-was-tampered-with')
...
BadSignature: ...
>>> request.get_signed_cookie('name', max_age=60)
...
SignatureExpired: Signature age 1677.3839159 > 60 seconds
>>> request.get_signed_cookie('name', False, max_age=60)
False
```

#### `HttpRequest.is_secure()`

如果请求时是安全的，则返回 `True`；即请求是通过 `HTTPS` 发起的。

#### `HttpRequest.is_ajax()`

如果请求是通过 `XMLHttpRequest` 发起的，则返回 `True`，方法是检查 `HTTP_X_REQUESTED_WITH` 头部是否是字符串 `'XMLHttpRequest'`。大部分现代的 JavaScript 库都会发送这个头部。如果你编写自己的 `XMLHttpRequest` 调用（在浏览器端），你必须手工设置这个值来让 `is_ajax()` 可以工作。

如果一个响应需要根据请求是否是通过 `AJAX` 发起的，并且你正在使用某种形式的缓存例如 `Django 的cache middleware`， 你应该使用 `vary_on_headers('HTTP_X_REQUESTED_WITH')` 装饰你的视图以让响应能够正确地缓存。

#### `HttpRequest.read(size=None)`
#### `HttpRequest.readline()`
#### `HttpRequest.readlines()`
#### `HttpRequest.xreadlines()`
#### `HttpRequest.__iter__()`

这几个方法实现类似文件的接口用于读取 `HttpRequest` 实例。这使得可以用流的方式读取进来的请求。常见的使用常见是使用迭代的解析器处理一个大型的 `XML` 而不用在内存中构建一个完整的 `XML` 树。

根据这个标准的接口，一个 `HttpRequest` 实例可以直接传递给 `XML` 解析器，例如ElementTree：

```python
import xml.etree.ElementTree as ET
for element in ET.iterparse(request):
    process(element)
```

## QueryDict 对象

`class QueryDict`

在 `HttpRequest` 对象中，`GET` 和 `POST` 属性是 `django.http.QueryDict` 的实例，它是一个自定义的类似字典的类，用来处理同一个键带有多个值。这个类的需求来自某些 `HTML` 表单元素以同一个键传递多个值，`<select multiple>` 就是一个显著的例子。

`request.POST` 和 `request.GET` 的 `QueryDict` 在一个正常的请求/响应循环中是不可变的。若要获得可变的版本，需要使用 `.copy()`（这里内部使用了python的 `copy.deepcopy()`）。

`QueryDict` 因为它是字典的子类，所以它有字典的所有标准方法。但不同的是，当从 `QueryDict` 获取一个值时，如果该键有多个值，那么只返回最新的一个。

`QueryDict` 有几个特殊的方法需要说一下：

#### QueryDict.update(other_dict)

接收一个 `QueryDict` 或标准字典。类似标准字典的 `update()` 方法，但是它附加到当前字典项的后面，而不是替换掉它们。例如：

```python
>>> q = QueryDict('a=1', mutable=True)
>>> q.update({'a': '2'})
>>> q.getlist('a')
['1', '2']
>>> q['a'] # or q.get('a'), returns the last one
['2']
```
#### `QueryDict.items()`
类似标准字典的items() 方法，但是它只返回最新的值的逻辑。例如：

```python
>>> q = QueryDict('a=1&a=2&a=3')
>>> q.items()
[('a', '3')]
```

#### `QueryDict.getlist(key, default)`
以Python 列表形式返回所请求的键的数据。如果键不存在并且没有提供默认值，则返回空列表。它保证返回的是某种类型的列表，除非默认值不是列表。

#### `QueryDict.setlist(key, list_)`

设置给定的键为`list_`。

#### `QueryDict.appendlist(key, item)`

将项追加到内部与键相关联的列表中。

#### `QueryDict.lists()`

类似 `items`，只是它将字典中的每个成员作为列表。例如：

```python
>>> q = QueryDict('a=1&a=2&a=3')
>>> q.lists()
[('a', ['1', '2', '3'])]
```

#### `QueryDict.pop(key)`

返回给定键的值的列表，并从字典中移除它们。如果键不存在，将引发`KeyError`。例如 ︰

```python
>>> q = QueryDict('a=1&a=2&a=3', mutable=True)
>>> q.pop('a')
['1', '2', '3']
```

#### `QueryDict.popitem()`

删除字典任意一个成员（因为没有顺序的概念），并返回二值元组，包含键和键的所有值的列表。在一个空的字典上调用时将引发`KeyError`。例如 ︰

```python
>>> q = QueryDict('a=1&a=2&a=3', mutable=True)
>>> q.popitem()
('a', ['1', '2', '3'])
```

#### `QueryDict.dict()`

返回 `QueryDict` 的 `dict` 表示形式。对于 `QueryDict` 中的每个 `(key, list)` 对 ，`dict` 将有 `(key, item)` 对，其中 `item` 是列表中的一个元素：

```python
>>> q = QueryDict('a=1&a=3&a=5')
>>> q.dict()
{'a': '5'}
```

## HttpResponse 对象

`class HttpResponse`

与由Django自动创建的 `HttpRequest` 对象相比，`HttpResponse` 对象由程序员创建。你创建的每个视图负责初始化实例,填充并返回一个 `HttpResponse`。

### 使用

你可以使用 `HttpResponse` 传递字符串，传递迭代器，配置 `header fields`:

```python
>>> from django.http import HttpResponse
>>> response = HttpResponse("Here's the text of the Web page.")
response['Age'] = 20 # header fields
```

你还可以使用 `HttpResponse` 告诉浏览器以文件附件的形式处理服务器的响应（声明 `content_type` 类型 和设置  `Content-Disposition` 头信息），例如，下面的代码给浏览器返回一个excel文件：

```python
>>> response = HttpResponse(my_data, content_type='application/vnd.ms-excel')
>>> response['Content-Disposition'] = 'attachment; filename="foo.xls"'
```

### 属性

`HttpResponse` 有一些属性简单说一下：

* `HttpResponse.content` 响应的内容（字节型字符串）

* `HttpResponse.charset` 响应的编码字符集。

* `HttpResponse.status_code` 响应的 `HTTP` 状态码。

* `HttpResponse.reason_phrase` 响应的 `HTTP` 原因短语。在构造器外部修改 `status_code` 时，此值默认也会自动改变。

* `HttpResponse.streaming` 这个选项总是False。由于这个属性的存在，使得中间件（ `middleware` ）能够却别对待流式 `response` 和常规 `response`。

* `HttpResponse.closed` 如果响应被关闭，此值为 `True`。

### 方法

简单说几个 `HttpResponse` 的方法。

#### `HttpResponse.has_header(header)`

通过检查首部中是否有给定的首部名称（不区分大小写），来返回 `True` 或 `False` 。

#### `HttpResponse.setdefault(header, value)`

设置一个首部，除非该首部 `header` 已经存在了。

#### `HttpResponse.set_cookie(key, value='', max_age=None, expires=None, path='/', domain=None, secure=None, httponly=False)`

设置一个 `Cookie` 。参数与 Python 标准库中的 `Morsel Cookie` 对象相同。

* `max_age` 应该是一个表示秒的数字，或者是 `None` (默认值)。 
如果没有指定 `expires`，则会通过计算得到。

* `expires` 该是一个 `UTC "Wdy, DD-Mon-YY HH:MM:SS GMT"` 格式的字符串，或者是一个 `datetime.datetime` 对象。如果 `expires` 是一个 `datetime` 对象，则 `max_age` 会通过计算得到。

* 如果你想设置一个跨域的 `Cookie` ，请使用 `domain` 参数。例如， `domain=".lawrence.com"` 将设置一个 `www.lawrence.com`、`blogs.lawrence.com` 和 `calendars.lawrence.com` 都可读的 `Cookie`。否则，`Cookie` 将只能被设置它的域读取。

* 如果你想阻止客户端的 JavaScript 访问 `Cookie`，可以设置 `httponly=True`。

* `HTTPOnly` 是包含在 `HTTP` 响应头部 `Set-Cookie` 中的一个标记。它不是RFC 2109 中 `Cookie` 的标准，也并没有被所有的浏览器支持。但是，如果使用，它是一种降低客户端脚本访问受保护的 `Cookie` 数据风险的有用的方法。

警告

 RFC 2109 和 RFC 6265 都声明客户端至少应该支持 `4096` 个字节的 `Cookie` 。对于许多浏览器，这也是最大的大小。如果视图存储大于 `4096` 个字节的 `Cookie`， `Django` 不会引发异常，但是浏览器将不能正确设置 `Cookie`。

#### `HttpResponse.set_signed_cookie(key, value, salt='', max_age=None, expires=None, path='/', domain=None, secure=None, httponly=True)`

与 `set_cookie()` 类似，但是在设置之前将用密钥签名。通常与 `HttpRequest.get_signed_cookie()` 一起使用。你可以使用可选的 `salt` 参考来增加密钥强度，但需要记住将它传递给对应的 `HttpRequest.get_signed_cookie()` 调用。

#### `HttpResponse.delete_cookie(key, path='/', domain=None)`

删除指定的 `key` 的 `Cookie`。如果 `key` 不存在则什么也不发生。

由于 `Cookie` 的工作方式，`path` 和 `domain` 应该与 `set_cookie()` 中使用的值相同，否则 `Cookie` 不会删掉。

#### `HttpResponse.write(content)`, `HttpResponse.flush()`, `HttpResponse.tell()`

这几个方法让 `HttpResponse` 实例变成类似文件的对象。

#### HttpResponse.getvalue()

返回 `HttpResponse.content` 的值。这个方法让 `HttpResponse` 实例变成类似流的对象。

#### HttpResponse.readable()

总是 `False`。这个方法让 `HttpResponse` 实例变成类似流的对象。

#### HttpResponse.seekable()

总是 `False`。这个方法让 `HttpResponse` 实例变成类似流的对象。

#### HttpResponse.writable()

总是 `True`。这个方法让 `HttpResponse` 实例变成类似流的对象。

#### HttpResponse.writelines(lines)

把所有行以列表的形式写向 `response`， 没有行分隔符。这个方法让 `HttpResponse` 实例变成类似流的对象。


### `JsonResponse` 对象

`class JsonResponse(data, encoder=DjangoJSONEncoder, safe=True, json_dumps_params=None, **kwargs)`

是 `HttpResponse` 的一个子类（有很多子类），用于帮助创建 `JSON` 编码的响应。它从父类继承大部分行为，并具有以下不同点：

它的默认 `Content-Type` 头部设置为 `application/json`。

* 它的第一个参数 `data`，应该为一个 `dict` 实例。如果 `safe` 参数设置为 `False`，它可以是任何可 `JSON` 序列化的对象。

* encoder，默认为  `django.core.serializers.json.DjangoJSONEncoder`，用于序列化 `data`。

* 布尔参数 `safe` 默认为 `True`。如果设置为 `False`，可以传递任何对象进行序列化（否则，只允许 `dict` 实例）。如果 `safe` 为 `True`，而第一个参数传递的不是 `dict` 对象，将抛出一个 `TypeError`。

* `json_dumps_params` 是一个字典，它是在生成响应时，传给 `json.dumps()` 的参数。

#### 用法

典型的用法如下：

```python
>>> from django.http import JsonResponse
>>> response = JsonResponse({'foo': 'bar'})
>>> response.content
'{"foo": "bar"}'
```

**序列化非字典对象**

若要序列化非 `dict` 对象，你必须设置 `safe` 参数为 `False`：

```python
>>> response = JsonResponse([1, 2, 3], safe=False)
```
如果不传递safe=False，将抛出一个TypeError。

警告

在 `EcmaScript` 第5版之前，这可能会使 `JavaScript Array` 构造函数崩溃。出于这个原因，Django 默认不允许传递非字典对象给 `JsonResponse` 构造函数。然而，现代的大部分浏览器都已经实现`EcmaScript 5`，它删除了这种攻击性的数组。所以可以不用关注这个安全预防措施。

**修改默认的JSON 编码器**

如果你需要使用不同的 `JSON` 编码器类，你可以传递 `encoder` 参数给构造函数：

```python
>>> response = JsonResponse(data, encoder=MyJSONEncoder)
```

### `StreamingHttpResponse objects`

`StreamingHttpResponse` 类被用来从 Django 流式化一个响应（`response`）到浏览器。如果生成响应太长或者是有使用太多的内存，你可能会想要这样做。例如，它对于生成大型 `CSV` 文件非常有用。

**基于性能的考虑**

Django是为了那些短期的请求（ `request` ）设计的。流式响应将会为整个响应期协同工作进程。这可能导致性能变差。

总的来说，你需要将代价高的任务移除请求—响应的循环，而不是求助于流式响应。

`StreamingHttpResponse` 不是 `HttpResponse` 的衍生类（子类），因为它实现了完全不同的应用程序接口（API）。尽管如此，除了以下的几个明显不同的地方，其他几乎完全相同：

* 应该提供一个迭代器给它，这个迭代器生成字符串来构成内容（`content`）

* 你不能直接访问它的内容（`content`），除非迭代它自己的响应对象。这只在响应被返回到客户端的时候发生。

* 它没有 `content` 属性。取而代之的是，它有一个  `streaming_content` 属性。

* 你不能使用类似文件对象的 `tell()` 或者 `write()` 方法。那么做会抛出一个异常。

### FileResponse objects

`FileResponse` 是 `StreamingHttpResponse` 的衍生类（子类），为二进制文件做了优化。如果 `wsgi server` 来提供，则使用了  `wsgi.file_wrapper` ，否则将会流式化一个文件为一些小块。

`FileResponse` 需要通过二进制模式打开文件，如下:

```python
>>> from django.http import FileResponse
>>> response = FileResponse(open('myfile.png', 'rb'))
```
