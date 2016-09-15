---
layout: post
title:  "Django forms 文档手记"
date:   2016-08-02 21:49:52
meta_description: Django forms 文档手记
categories:
- blog
tags:
- Python
---


## Django 在表单中的角色

处理表单是一件很复杂的事情。考虑一下 Django 的 Admin 站点，不同类型的大量数据项需要在一个表单中准备好、渲染成HTML、使用一个方便的界面编辑、返回给服务器、验证并清除，然后保存或者向后继续处理。

Django 的表单功能可以简化并自动化大部分这些工作，而且还可以比大部分程序员自己所编写的代码更安全。

Django 会处理表单工作中的三个显著不同的部分：

* 准备数据、重构数据，以便下一步提交。

* 为数据创建HTML 表单。

* 接收并处理客户端提交的表单和数据。

可以手工编写代码来实现，但是 Django 可以帮你完成所有这些工作。

## Django 中的表单

在一个 Web 应用中，"表单"可能指HTML `<form>`、或者生成它的Django 的 `Form`、或者提交时发送的结构化数据、或者这些部分的总和。

### Django 的 `Form` 类

表单系统的核心部分是Django 的 `Form` 类。Django 的模型描述一个对象的逻辑结构、行为以及展现形式，与此类似，`Form` 类描述了一个表单并决定它如何工作和展现。

就像模型类的属性映射到数据库中的字段一样，表单类的字段会映射到 HTML 的 `<input>` 表单的元素。（ `ModelForm` 通过一个 `Form` 映射模型类的字段到HTML 表单的 `<input>` 元素；Django 的Admin 站点就是基于这个）。

表单的字段本身也是类；它们管理表单的数据并在表单提交时进行验证。 `DateField` 和 `FileField` 处理的数据类型差别很大，必须完成不同的事情。

表单字段在浏览器中呈现给用户的是一个HTML 的 “`widget`”  —— 用户界面的一个片段。每个字段类型都有一个合适的默认 `Widget` 类，需要时可以覆盖。

## 在 Django 中构建一个表单

### `Form` 类

```python
from django import forms

class NameForm(forms.Form):
    your_name = forms.CharField(label='Your name', max_length=100)
```

它定义一个 `Form` 类，只带有一个字段（`your_name`）。我们已经对这个字段使用一个友好的标签，当渲染时它将出现在 `<label>` 中。

字段允许的最大长度通过 `max_length` 定义。它完成两件事情。首先，它在 HTML 的 `<input>` 上放置一个 `maxlength="100"` （这样浏览器将在第一时间阻止用户输入多于这个数目的字符）。它还意味着当 Django 收到浏览器发送过来的表单时，它将验证数据的长度。

Form 的实例具有一个 `is_valid()` 方法，它为所有的字段运行验证的程序。当调用这个方法时，如果所有的字段都包含合法的数据，它将：

* 返回 `True`。

* 将表单的数据放到 `cleaned_data` 属性中。

完整的表单，第一次渲染时，看上去将像：

```html
<label for="your_name">Your name: </label>
<input id="your_name" type="text" name="your_name" maxlength="100">
```
注意它不包含 `<form>` 标签和提交按钮。我们必须自己在模板中提供它们。

### 视图

发送给 Django 网站的表单数据通过一个视图处理，一般和发布这个表单的是同一个视图。这允许我们重用一些相同的逻辑。

要操作一个通过 `URL` 发布的表单，我们要在视图中实例表单。

```python
from django.shortcuts import render
from django.http import HttpResponseRedirect

from .forms import NameForm

def get_name(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = NameForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            # ...
            # redirect to a new URL:
            return HttpResponseRedirect('/thanks/')
    # if a GET (or any other method) we'll create a blank form
    else:
        form = NameForm()
    return render(request, 'name.html', {'form': form})
```
如果访问视图的是一个 `GET` 请求，它将创建一个空的表单实例并将它放置到要渲染的模板的上下文中。这是我们在第一次访问该 `URL` 时预期发生的情况。

如果表单的提交使用 `POST` 请求，那么视图将再次创建一个表单实例并使用请求中的数据填充它：`form = NameForm(request.POST)`。这叫做”绑定数据至表单“（它现在是一个绑定的表单）。

我们调用表单的 `is_valid()` 方法；如果它不为 `True`，我们将带着这个表单返回到模板。这时表单不再为空（未绑定），所以 HTML 表单将用之前提交的数据填充，然后可以根据要求编辑并改正它。

如果 `is_valid()` 为 `True`，我们将能够在 `cleaned_data` 属性中找到所有合法的表单数据。在发送HTTP 重定向给浏览器告诉它下一步的去向之前，我们可以用这个数据来更新数据库或者做其它处理。

### 模板

我们不需要在 html 模板中做很多工作。最简单的例子是：

```html
<form action="/your-name/" method="post">
    {% csrf_token %}
    {{ form }}
    <input type="submit" value="Submit" />
</form>
```
根据 `{{ form }}`，所有的表单字段和它们的属性将通过 Django 的模板语言拆分成 HTML 标记 。

表单和跨站请求伪造的防护

Django 原生支持一个简单易用的跨站请求伪造的防护。当提交一个启用 `CSRF` 防护的 `POST` 表单时，你必须使用上面例子中的 `csrf_token` 模板标签。然而，因为 `CSRF` 防护在模板中不是与表单直接捆绑在一起的，这个标签在这篇文档的以下示例中将省略。

HTML5 输入类型和浏览器验证

如果你的表单包含 `URLField`、`EmailField` 或其它整数字段类型，Django 将使用 `url`、`email`和 `number` 这样的 HTML5 输入类型。默认情况下，浏览器可能会对这些字段进行它们自身的验证，这些验证可能比 Django 的验证更严格。如果你想禁用这个行为，请设置 `form` 标签的 `novalidate` 属性，或者指定一个不同的字段，如 `TextInput`。

## Django `Form` 类详解

所有的表单类都作为 `django.forms.Form` 的子类创建，包括 `ModelForm`。

模型和表单

实际上，如果你的表单打算直接用来添加和编辑 Django 的模型， `ModelForm` 可以节省你的许多时间、精力和代码，因为它将根据 `Model` 类构建一个表单以及适当的字段和属性。 

### 绑定的和未绑定的表单实例

绑定的和未绑定的表单之间的区别非常重要：

未绑定的表单没有关联的数据。当渲染给用户时，它将为空或包含默认的值。
绑定的表单具有提交的数据，因此可以用来检验数据是否合法。如果渲染一个不合法的绑定的表单，它将包含内联的错误信息，告诉用户如何纠正数据。
表单的 `is_bound` 属性将告诉你一个表单是否具有绑定的数据。

### 字段

#### Widgets

每个表单字段都有一个对应的 `Widget` 类，它对应一个 HTML 表单 `Widget`，例如 `<input type="text">`。

在大部分情况下，字段都具有一个合理的默认 `Widget`。例如，默认情况下，`CharField` 具有一个 `TextInput` `Widget`，它在HTML 中生成一个 `<input type="text">`。

不要将 `Widget` 与表单字段搞混淆。表单字段负责验证输入并直接在模板中使用。`Widget` 负责渲染网页上 HTML 表单的输入元素和提取提交的原始数据。但是， `Widget` 需要赋值给表单字段。

#### 字段的数据

不管表单提交的是什么数据，一旦通过调用 `is_valid()` 成功验证（`is_valid()` 返回 `True`），验证后的表单数据将位于 `form.cleaned_data` 字典中。这些数据已经为你转换好为 Python 的类型。

**注**

此时，你依然可以从 `request.POST` 中直接访问到未验证的数据，但是访问验证后的数据更好一些。

### 使用表单模板

你需要做的就是将表单实例放进模板的上下文。

你可以使用 `as_table`、`as_p`、`as_ul` 自动的以响应的形式渲染表单，或者，你可以手动的以 `{{ form.name_of_field }}` 形式渲染表单的每个字段。

`{{ form.name_of_field.errors }}` 渲染一个字段的错误信息。

另外，表单的字段在模板中是可以迭代访问的：

```jinja
{% for field in form %}
    <div class="fieldWrapper">
        {{ field.errors }}
        {{ field.label_tag }} {{ field }}
    </div>
{% endfor %}
```


