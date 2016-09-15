---
layout: post
title:  "Django shortcuts 文档手记"
date:   2016-07-11 16:42:11
meta_description: Django shortcuts 文档手记
categories:
- blog
tags:
- Python
---


# Django 的快捷函数

`django.shortcuts` 收集了“跨越” 多层MVC 的辅助函数和类。 换句话讲，这些函数/类为了方便，引入了可控的耦合。

## `render()`

```python
render(request, template_name, context=None, content_type=None, status=None, using=None)
```
结合一个给定的模板和一个给定的上下文字典，并返回一个渲染后的  `HttpResponse` 对象。

### 必选参数

* `request`

    该request用于生成response

* `template_name`

    要使用的模板的完整名称或者模板名称的一个序列。如果使用模板序列，如果第一个模板可用，就用第一个，类推。

### 可选参数

* `context`

    添加到模板上下文的一个字典。默认是一个空字典。如果字典中的某个值是可调用的，视图将在渲染模板之前调用它。

* `content_type`

    生成的文档要使用的MIME 类型。默认为 `DEFAULT_CONTENT_TYPE` 设置的值。

* `status`
    响应的状态码。默认为 `200`。

* `using`

    用于加载模板使用的模板引擎的名称。

## `render_to_response()`

```python
render_to_response(template_name, context=None, content_type=None, status=None, using=None)
```

和 `render` 类似，只是它的 `response` 不返回 `request`。不建议再使用这个方法，以后可能会遗弃。

## `redirect()`

```python
redirect(to, permanent=False, *args, **kwargs)
```
为传递进来的参数返回一个适当的 `HttpResponseRedirect` 类型的URL 。

参数可以是：

1. 一个模型：将调用模型的 `get_absolute_url()` 函数。

2.一个视图，可以带有参数：将使用 `urlresolvers.reverse` 来反向解析名称。

3. 一个绝对的或相对的URL，将原样作为重定向的位置。

默认返回一个临时的重定向；传递 `permanent=True` 可以返回一个永久的重定向。

不要忘了 `return`：

```python
def my_view(request):
    ...
    return redirect('some-view-name', foo='bar')
```

## `get_object_or_404()`

```python
get_object_or_404(klass, *args, **kwargs)
```

在一个给定的模型管理器上调用 `get()`，但是引发 `Http404` 而不是模型的 `DoesNotExist` 异常。

### 必选参数

* `klass`

一个你想要查询对象的模型类(`Model`)、管理器(`Manager`)、或者查询集(`QuerySet`)。

* `**kwargs

用在 `get()` 和 `filter()` 上的查询参数。

## `get_list_or_404()`

```python
get_list_or_404(klass, *args, **kwargs)
```
返回一个给定模型管理器上 `filter()` 的结果，并将结果映射为一个列表，如果结果为空则返回 `Http404`。
