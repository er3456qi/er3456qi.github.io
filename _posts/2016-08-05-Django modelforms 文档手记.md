---
layout: post
title: "Django modelforms 文档手记"
date: 2016-08-05 20:11:23
category: programming
tags: python django
finished: true
---


# 从模型创建表单

## `ModelForm`

如果你正在构建一个数据库驱动的应用，那么你应该会有与 Django 的模型紧密映射的表单。举个例子，你也许会有个 `BlogComment` 模型，并且你还想创建一个表单让大家提交评论到这个模型中。 在这种情况下，在表单中定义字段将是冗余的，因为你已经在模型中定义了字段。

基于这个原因，Django 提供一个辅助类来让你可以从 Django 的模型创建表单。

```python
from django.forms import ModelForm
from myapp.models import Article

# Create the form class.
class ArticleForm(ModelForm):
    class Meta:
        model = Article
        fields = ['pub_date', 'headline', 'content', 'reporter']
```
模型的字段在表单中，都会有对应的。但模型的 `ForeignKey` 和  `ManyToManyField` 字段是特殊情况：

* `ForeignKey` 在表单中表示成 `django.forms.ModelChoiceField`，它是一个 `ChoiceField`，其选项是模型的查询集。

* `ManyToManyField` 表示成 `django.forms.ModelMultipleChoiceField`，它是一个 `MultipleChoiceField`，其选项是模型的查询集。

另外，由模型视图生成的每个表单字段都有以下属性集：

* 如果模型字段设置 `blank=True`， 那么表单字段的 `requird` 将会设置为 `False`。否则 `required=True`。

* 模型字段的 `verbose_name` 参数在表单中会被设置成 `label` ，并将第一个字母大写。

* 模型中的 `help_text` 字段在表单中也是 `help_text` 字段。

* 如果模型字段设置了 `choices` ，那么表单字段的 `Widget` 将设置成 `Select`, 其选项来自模型字段的 `choices`。 选项通常会包含空选项，并且会默认选择。如果字段是必选的，它将会强制用户选择一个项。如果模型字段的 `blank=False` 且具有一个显式的 `default` 值，将不会包含空选项。

另外，可以为给定的模型字段重新指定表单字段。

### 重写（覆盖）默认的字段

使用模型表单的内部类 `Meta` 的 `widgets` 属性可以指定一个字段的自定义 Widget。它是映射字段名到 Widget 类或实例的一个字典。

例如， `Author` 的 `name` 属性为 `CharField`，如果你希望它表示成一个 `<textarea>` 而不是默认的 `<input type="text">`，你可以覆盖字段默认的Widget：

```python
from django.forms import ModelForm, Textarea
from myapp.models import Author

class AuthorForm(ModelForm):
    class Meta:
        model = Author
        fields = ('name', 'title', 'birth_date')
        widgets = {
            'name': Textarea(attrs={'cols': 80, 'rows': 20}),
        }
```
不管是 Widget 实例（`Textarea(...)`）还是 Widget 类（`Textarea`）， `widgets` 字典都可以接收。

类似地，如果你希望进一步自定义字段，你可以指定内部类 `Meta` 的 `labels`、 `help_texts` 和 `error_messages`。

例如，如果你希望自定义 `name` 字段所有面向用户的字符串：：

```python
from django.utils.translation import ugettext_lazy as _

class AuthorForm(ModelForm):
    class Meta:
        model = Author
        fields = ('name', 'title', 'birth_date')
        labels = {
            'name': _('Writer'),
        }
        help_texts = {
            'name': _('Some useful help text.'),
        }
        error_messages = {
            'name': {
                'max_length': _("This writer's name is too long."),
            },
        }
```
最后，如果你希望完全控制字段 —— 包括它的类型、验证器等等，你可以像在普通的表单那样显式指定字段。

例如，如果你想为 `slug` 字段使用 `MySlugFormField` ，可以像下面这样：

```python
from django.forms import ModelForm
from myapp.models import Article

class ArticleForm(ModelForm):
    slug = MySlugFormField()

    class Meta:
        model = Article
        fields = ['pub_date', 'headline', 'content', 'reporter', 'slug']
```
如果想要指定字段的验证器，可以显式定义字段并设置它的 `validators` 参数：

```python
from django.forms import ModelForm, CharField
from myapp.models import Article

class ArticleForm(ModelForm):
    slug = CharField(validators=[validate_slug])

    class Meta:
        model = Article
        fields = ['pub_date', 'headline', 'content', 'reporter', 'slug']
```
**注**

当你像这样显式实例化表单字段时，需要理解 `ModelForm` 和普通 `Form` 的关系是怎样的。

`ModelForm` 就是可以自动生产相应字段的 `Form`。自动生成哪些字段取决于 `Meta` 类的 `fields` 属性和在该 `ModelForm` 中显式声明的字段。`ModelForm` 基本上只生成表单中没有的字段，换句话说就是在表单类中显式定义的字段，`ModelForm` 不再自动生成。

显式定义的字段会保持原样，所以 `Meta` 属性中任何自定义的属性例如  `widgets`、`labels`、`help_texts` 或 `error_messages` 都将忽略；它们只适用于自动生成的字段。

类似地，显式定义的字段不会从对应的模型中获取属性，例如 `max_length` 或 `required`。 如果你希望保持模型中指定的行为，你必须设置在声明表单字段时显式设置相关的参数。

例如，如果 `Article` 模型像下面这样：

```python
class Article(models.Model):
    headline = models.CharField(max_length=200, null=True, blank=True,
                                help_text="Use puns liberally")
    content = models.TextField()
```
而你想为 `headline` 做一些自定义的验证，在保持 `blank` 和 `help_text` 值的同时，你必须这样定义 `ArticleForm`：

```python
class ArticleForm(ModelForm):
    headline = MyFormField(max_length=200, required=False,
                           help_text="Use puns liberally")

    class Meta:
        model = Article
        fields = ['headline', 'content']
```
你必须保证表单字段的类型可以用于对应的模型字段。如果它们不兼容，因为不会有显示的转换你将会得到一个 `ValueError`。

### `save()` 方法

每个模型表单还具有一个 `save()` 方法。这个方法根据表单绑定的数据创建并保存数据库对象。模型表单的子类可以用关键字参数 `instance` 接收一个已经存在的模型实例；如果提供，`save()` 将更新这个实例。如果没有提供，`save()` 将创建模型的一个新实例：

```python
>>> from myapp.models import Article
>>> from myapp.forms import ArticleForm

# Create a form instance from POST data.
>>> f = ArticleForm(request.POST)

# Save a new Article object from the form's data.
>>> new_article = f.save()

# Create a form to edit an existing Article, but use
# POST data to populate the form.
>>> a = Article.objects.get(pk=1)
>>> f = ArticleForm(request.POST, instance=a)
>>> f.save()
```
注意，如果表单没有验证，`save()` 调用将通过检查 `form.errors` 来进行验证。如果表单中的数据不合法，将引发 `ValueError` —— 例如，如果 `form.errors` 为 `True`。

`save()` 接受一个可选的 `commit` 关键字参数，其值为 `True`(默认值) 或 `False`。如果 `save()` 时 `commit=False`，那么它将返回一个还没有保存到数据库的对象。这种情况下，你需要调用返回的模型实例的 `save()`。 如果你想在保存之前自定义一些处理，或者你想使用特定的模型保存选项，可以这样使用。

使用 `commit=False` 的另外一个副作用是在模型具有多对多关系的时候。如果模型具有多对多关系而且当你保存表单时指定 `commit=False`， Django 不会立即为多对多关系保存表单数据。这是因为只有实例在数据库中存在时才可以保存实例的多对多数据。

为了解决这个问题，每当你使用 `commit=False` 保存表单时，Django 将添加一个 `save_m2m()` 方法到你的模型表单子类。在你手工保存有表单生成的实例之后，你可以调用 `save_m2m()` 来保存多对多的表单数据。例如：

```python
# Create a form instance with POST data.
>>> f = AuthorForm(request.POST)

# Create, but don't save the new author instance.
>>> new_author = f.save(commit=False)

# Modify the author in some way.
>>> new_author.some_field = 'some_value'

# Save the new instance.
>>> new_author.save()

# Now, save the many-to-many data for the form.
>>> f.save_m2m()
```
`save_m2m()` 只在你使用 `save(commit=False)` 时才需要。当你直接使用 `save()`，所有的数据 —— 包括多对多数据 —— 都将保存而不需要任何额外的方法调用。例如：

```python
# Create a form instance with POST data.
>>> a = Author()
>>> f = AuthorForm(request.POST, instance=a)

# Create and save the new author instance. There's no need to do anything else.
>>> new_author = f.save()
```
除了 `save()` 和 `save_m2m()` 方法之外，模型表单与其它表单的工作方式完全一样。例如，`is_valid()` 用于检查合法性，`is_multipart()` 方法用于决定表单是否需要 `multipart` 的文件上传（以及这之后 `request.FILES` 是否必须必须传递给表单）等等。更多信息，参见绑定上传的文件到表单。

### 选择用到的字段

你可以在模型表单的 `Meta` 类中指定 `fields` 的属性来选择要使用的字段，如果 `fields = '__all__'`，表示使用所有字段，否则，提供一个列表来表明需要的字段。也可以用 `exclude = []` 来排除一些字段。

### 模型表单的 `factory` 函数

你可以用单独的函数  `modelform_factory()` 来代替使用类定义来从模型直接创建表单。这在不需要很多自定义的情况下应该是更方便的。

```python
>>> from django.forms.models import modelform_factory
>>> from myapp.models import Book
>>> BookForm = modelform_factory(Book, fields=("author", "title"))
```
这个函数还能对已有的表单类做简单的修改，比如，对给出的字段指定 `widgets` ：

```python
>>> from django.forms import Textarea
>>> Form = modelform_factory(Book, form=BookForm,
...                          widgets={"title": Textarea()})
```
