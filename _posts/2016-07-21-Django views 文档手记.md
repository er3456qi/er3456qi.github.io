---
layout: post
title:  "Django views 文档手记"
date:   2016-07-21 20:32:53
meta_description: Django views 文档手记
categories:
- blog
tags:
- Python
---

## 内置的视图

### 开发环境中的文件服务器

`static.serve(request, path, document_root, show_indexes=False)`

在本地的开发环境中，除了你的项目中的静态文件，可能还有一些文件，出于方便，你希望让 Django 来作为服务器。`serve()` 视图可以用来作为任意目录的服务器。（该视图不能用于生产环境，应该只用于开发时辅助使用；在生产环境中你应该使用一个真实的前端Web 服务器来服务这些文件）。

最常见的例子是用户上传文档到 `MEDIA_ROOT` 中。 `django.contrib.staticfiles` 用于静态文件且没有对用户上传的文件做处理，但是你可以通过在 `URLconf` 中添加一些内容来让 Django 作为 `MEDIA_ROOT` 的服务器：

```python
from django.conf import settings
from django.views.static import serve

# ... the rest of your URLconf goes here ...

if settings.DEBUG:
    urlpatterns += [
        url(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
```

这看起来代码比较笨拙，Django 提供了一个更好的方法 `static() `来简化它：

`static.static(prefix, view=django.views.static.serve, **kwargs)`

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... the rest of your URLconf goes here ...
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 错误视图

```python
django.views.defaults.page_not_found(request, exception, template_name='404.html')
django.views.defaults.server_error(request, template_name='500.html')
django.views.defaults.permission_denied(request, exception, template_name='403.html')
django.views.defaults.bad_request(request, exception, template_name='400.html')
```

### 自定义错误视图

Django中默认的错误视图对于大多数web应用已经足够了，但是如果你需要任何自定义行为，重写它很容易。只要在你的 `URLconf` 中指定下面的处理器（在其他任何地方设置它们不会有效）。

`handler404` 覆盖了` page_not_found()` 视图：

```python
handler404 = 'mysite.views.my_custom_page_not_found_view'
```
`handler500` 覆盖了 `server_error()` 视图：

```python
handler500 = 'mysite.views.my_custom_error_view'
```
`handler403` 覆盖了 `permission_denied()` 视图：

```python
handler403 = 'mysite.views.my_custom_permission_denied_view'
```
`handler400` 覆盖了 `bad_request()` 视图：

```python
handler400 = 'mysite.views.my_custom_bad_request_view'

注意，这里说的是视图，不是模板，如果不需要自定义错误视图的话，只需要在 `templates` 中加入相应的错误模板即可。
