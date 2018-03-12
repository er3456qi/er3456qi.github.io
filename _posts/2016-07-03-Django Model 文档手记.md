---
layout: post
title: "Django Model 文档手记"
date: 2016-07-03 17:23:53
category: programming
tags: python django
finished: true
---

## 模型

* 每个模型都是`django.db.models.Model`的子类。
* 模型的每个属性都表示成数据库的一个字段。
* 要使用一个模型，你需要在配置文件的`INSTALLED_APPS`中添加模型所属的app。

## 字段

字段是模型的属性，模型中的每个字段都是`Field`子类的实例。Django 根据字段的类型确定以下信息：
* 数据库中的列类型。
* 渲染表单时使用的默认HTML控件。
* 最低限度的验证需求，它被用在Django管理站点和自动生成的表单中。

### 字段选项

每种字段类型都有对应的参数，如`CharField`需要`max_length`参数来指定数据库中字段的大小。还有一些常用的：

* `null`

    如果为`True`，Django 将用`NULL`来在数据库中存储空值。 默认值是`False`。

* `blank`

    如果为`True`，该字段允许不填。默认为`False`。

* `choices`

    由二项元组构成的一个可迭代对象（例如，列表或元组），用来给字段提供选择项。 如果设置了`choices` ，默认的表单将是一个选择框而不是标准的文本框，而且这个选择框的选项就是`choices`中的选项。例子：

    ```python
    YEAR_IN_SCHOOL_CHOICES = (
        ('FR', 'Freshman'),
        ('SO', 'Sophomore'),
        ('JR', 'Junior'),
        ('SR', 'Senior'),
        ('GR', 'Graduate'),
    )
    ```
    每个元组中的第一个元素，是存储在数据库中的值；第二个元素是在管理界面或 `ModelChoiceField` 中用作显示的内容。 在一个给定的 model 类的实例中，想得到某个 `choices` 字段的显示值，就调用 `get_FOO_display` 方法(这里的 `FOO` 就是 `choices` 字段的名称 )。

* `default`

    字段的默认值。可以是一个值或者可调用对象。如果可调用 ，每有新对象被创建它都会被调用。
    
* `help_text`

    表单部件额外显示的帮助内容。即使字段不在表单中使用，它对生成文档也很有用。

* `primary_key`

    如果为True，那么这个字段就是模型的主键。一个模型不指定主键的话，Django会自动添加一个`IntegerField`类型的主键。
    
    主键字段是只读的。如果你在一个已存在的对象上面更改主键的值并且保存，Django会创建一个新的对象。

* `unique`

    如果该值设置为`True`, 这个数据字段的值在整张表中必须是唯一的。

* `verbose_name`
    一个可选的位置参数用于描述该字段。如果没有给定自述名，Django 将根据字段的属性名称自动创建自述名（属性名称有下划线的会被替换成空格）。

    通常情况下，该参数可以不显式指定参数名而直接将其值放到第一个参数位置，如：

    ```python
    name = models.CharField("person's name", max_length=30)
    ```

    但`ForeignKey`、`ManyToManyField` 和 `OneToOneField`的第一个参数要求是模型类，所以在对其使用`verbose_name`，必须显式地使用：
    
    ```python
    poll = models.ForeignKey(Poll, verbose_name="the related poll")
    sites = models.ManyToManyField(Site, verbose_name="list of sites")
    place = models.OneToOneField(Place, verbose_name="related place")
    ```

## 关系

Django 提供了三种最常见的数据库关系：多对一(many-to-one)，多对多(many-to-many)，一对一(one-to-one)。

### 多对一关系

Django使用`django.db.models.ForeignKey` 定义多对一关系。在“多”的模型中存放“一”的该类型字段。

```python
from django.db import models

class Reporter(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

class Article(models.Model):
    headline = models.CharField(max_length=100)
    pub_date = models.DateField()
    reporter = models.ForeignKey(Reporter)

    def __str__(self):
        return self.headline

    class Meta:
        ordering = ('headline',)
```

### 多对多关系
`django.db.models.ManyToManyField` 用来定义多对多关系。该类型字段，放到哪个多对多关系的模型都可以，模型名建议用复数形式。

```python
from django.db import models

class Publication(models.Model):
    title = models.CharField(max_length=30)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ('title',)

class Article(models.Model):
    headline = models.CharField(max_length=100)
    publications = models.ManyToManyField(Publication)

    def __str__(self):
        return self.headline

    class Meta:
        ordering = ('headline',)
```

### 多对多关系中的其他字段

有时，在多对多关系中，需要包含一些其他信息。比如，有这样一个应用，它记录音乐家所属的音乐小组。我们可以用一个`ManyToManyField`表示小组和成员之间的多对多关系。但是，有时你可能想知道更多成员关系的细节，比如成员是何时加入小组的。

对于这些情况，Django 允许你指定一个中介模型来定义多对多关系。你可以将其他字段放在中介模型里面。源模型的`ManyToManyField` 字段将使用`through`参数指向中介模型。对于上面的音乐小组的例子，代码如下：

```python
from django.db import models

class Person(models.Model):
    name = models.CharField(max_length=128)

    def __str__(self):
        return self.name

class Group(models.Model):
    name = models.CharField(max_length=128)
    members = models.ManyToManyField(Person, through='Membership')

    def __str__(self):
        return self.name

class Membership(models.Model):
    person = models.ForeignKey(Person)
    group = models.ForeignKey(Group)
    date_joined = models.DateField()
```

如果使用`through`，还有一个`through_fields`参数。当你自定义的中间模型里出现了多个多对多关系时，该参数可以让你指定关系的双方（在某些情况下避免出现歧义）。该参数的值是一个二元组('field1', 'field2')，第一个元素的多对多关系的源实例，第二参数是关系的目标实例。源实例即声明多对多关系的那个模型实例:

```python
from django.db import models

class Person(models.Model):
    name = models.CharField(max_length=50)

class Group(models.Model):
    name = models.CharField(max_length=128)
    members = models.ManyToManyField(
        Person,
        through='Membership',
        through_fields=('group', 'person'), # 指定关系双方，因为Membership的inviter会造成歧义
    )

class Membership(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    inviter = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name="membership_invites",
    )
    date_joined = models.DateField() # 自己添加的字段
    invite_reason = models.CharField(max_length=64)

```

`on_delete`,用在外键上，用于当该模型实例删除时对所连接的模型所做的操作，`models.CASCADE`表示级联删除。欲详自查。

### 一对一关系

`django.db.models.OneToOneField`来定义一对一关系。最常用的比如一个User对应一个Profile。


## 模型Meta(元)的数据

Django可以使用内部的`class Meta` 定义模型的元数据，例如：

```python
from django.db import models

class Ox(models.Model):
    horn_length = models.IntegerField()

    class Meta:
        ordering = ["horn_length"]
        verbose_name_plural = "oxen"
```

模型元数据是“任何不是字段的数据”，比如排序选项（`ordering`），数据库表名（`db_table`）或者人类可读的单复数名称（`verbose_name` 和`verbose_name_plural`）。在模型中添加class Meta是完全可选的，所有选项都不是必须的。

对于`ordering`，排序的字段可以加一个前缀，也可以按多个字段排序。加`-`前缀表示逆序，加`？`表示随机排序。比如先按照`pub_date`的倒序排序，再按照`author`的正序排序：

`ordering=['-pub_date', 'author]`

对于`db_table`，作为数据库中的表名，如果不显示指定的话，其值为`appname_modelname`，即该app的名字加该模型的名字（全小写）。


## 模型的属性

* objects
    模型最重要的属性是`Manager`。它是Django 模型进行数据库查询操作的接口，并用于从数据库获取实例。如果没有自定义`Manager`，则默认的名称为`objects`。Managers只能通过模型类访问，而不能通过模型实例访问。

## 模型的方法

可以在模型上定义自定义的方法来给你的对象添加自定义的“底层”功能。Manager 方法用于“表范围”的事务，模型的方法应该着眼于特定的模型实例。

另外，模型还有一些自带的方法，可以被重写。常被重写的有：

* `get_absolute_url()`

    它告诉Django 如何计算一个对象的URL。Django 在它的管理站点中使用到这个方法，在其它任何需要计算一个对象的URL 时也将用到。

    任何具有唯一标识自己的URL 的对象都应该定义这个方法。

* `save()`

    当你想在保存一个对象时做一些其它事情时，你可以重写这个方法。必须要记住调用超类的方法 `super(Blog, self).save(*args, **kwargs)`来确保对象被保存到数据库中。另外，`delete()`也可以被重写。


## 模板继承

在Django 中有3种风格的继承。

1. 通常，你只想使用父类来持有一些信息，你不想在每个子模型中都敲一遍。这个类永远不会单独使用，所以你要使用抽象基类。
2. 如果你继承一个已经存在的模型且想让每个模型具有它自己的数据库表，那么应该使用多表继承。
3. 最后，如果你只是想改变一个模块Python 级别的行为，而不用修改模型的字段，你可以使用代理模型。

### 抽象基类

你编写完基类之后，在 Meta类中设置 abstract=True ，这个模型就不会被用来创建任何数据表。取而代之的是，当它被用来作为一个其他model的基类时，它的字段将被加入那些子类中。如果抽象基类和它的子类有相同的字段名，那么将会出现error（并且Django将抛出一个exception）。

```python
class CommonInfo(models.Model):
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()

    class Meta:
        abstract = True


class Student(CommonInfo):
    """
    抽象继承中，子类会继承父类的Meta
    因为类的Meta只是一个属性而已
    """
    home_group = models.CharField(max_length=5)
```

### 多表继承

这是 Django 支持的第二种继承方式。使用这种继承方式时，每一个层级下的每个 model 都是一个真正意义上完整的 model 。 每个 model 都有专属的数据表，都可以查询和创建数据表。 继承关系在子 model 和它的每个父类之间都添加一个链接 (通过一个自动创建的 `OneToOneField`来实现)。 例如：

```python
from django.db import models

class Place(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=80)

class Restaurant(Place):
    serves_hot_dogs = models.BooleanField(default=False)
    serves_pizza = models.BooleanField(default=False)
```

### 代理继承

代理继承要做的：为原始模型创建一个代理 。

你可以创建，删除，更新代理 model 的实例，而且所有的数据都可以像使用原始 model 一样被保存。

不同之处在于：你可以在代理 model 中改变默认的排序设置和默认的 manager ，更不会对原始 model 产生影响。

声明代理 model 和声明普通 model 没有什么不同。 设置Meta类中 proxy 的值为 True，就完成了对代理 model 的声明。

```python

class Apple(models.Model):
    weight = models.IntegerField()

class OrderedApple(Person):
    class Meta:
        ordering = ["weight"]
        proxy = True

    def do_something(self):
        # ...
        pass
```

### 多重继承

```python
class Article(models.Model):
    headline = models.CharField(max_length=50)
    body = models.TextField()

class Book(models.Model):
    title = models.CharField(max_length=50)

class BookReview(Book, Article):
    pass
```