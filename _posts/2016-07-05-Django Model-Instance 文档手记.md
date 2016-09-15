---
layout: post
title:  "Django Model-Instance 文档手记"
date:   2016-07-05 21:12:31
meta_description: Django Model-Instance 文档手记
categories:
- blog
tags:
- Python
---


## 创建对象

要创建模型的一个新实例，只需要像其它Python类一样实例化它：

```python
class Model(**kwargs)
```

关键字参数就是在你的模型中定义的字段的名称。注意，当你实例化一个模型时，Django并不会数据库进行读写，若要保存实例化后的数据，你需要调用方法 `save()` 。也就是说Django在 `save()` 时才会对数据库进行写操作。

也许你会想通过重写 `__init__` 方法来自定义模型。无论如何，如果你这么做了，小心不要改变了调用签名——任何改变都可能阻碍模型实例被保存。尝试使用下面两个方法之一，而不是重写 `__init__` :

1. 在模型类中增加一个类方法：

```python
from django.db import models

class Book(models.Models):
    title = models.CharField(max_length=100)

    @classmethod
    def create(cls, title):
        book = Book(title=title)
        # do sth you want with the book
        return book

book = Book.create('Pride an Prejudice')

2. 在自定义管理器中添加一个方法（推荐）：

```python
class BookManager(models.Manager):
    def create_book(self, title):
        book = self.create(title=title)
        # do sth you want with the book
        return book

class Book(models.Manager):
    title = models.CharField(max_length=127)
    objects = BookManager()

book = Book.objects.create_book("Pride and Prejudice")
```

### 自定义化模型加载

在模型实例从数据库中加载的时候，你可以使用 `classmethod Model.from_db(db, field_names, values)` 方法对要加载的实例进行自定义。

欲详自查。

## 从数据库中更新对象

当你需要从数据库中重新载入一个模型实例的字段时，你可以删除这个字段，然后再访问它即可：

```python
>>> obj = MyModel.objects.first()
>>> del obj.field
>>> obj.field  # Loads the field from the database
```
这样做显得有点麻烦，Django提供了 `refresh_from_db()` 方法，让你在需要从数据库中重新加载模型的值时使用。当该方法以无参数的形式调用时，会发生下面几件事：

1. 模型的所有非延迟字段都更新成数据库中的当前值。

2. 之前加载的关联实例，如果关联的值不再合法，将会从重新加载的实例中删除。

注意，只有本模型的字段会从数据库重新加载。其它依赖数据库的值不会重新加载，例如聚合的结果。

可以回使用 `fields` 参数强制设置加载的字段。

例如，要测试 `update()` 调用是否得到预期的更新，可以编写类似下面的测试：

```python
def test_update_result(self):
    obj = MyModel.objects.create(val=1)
    MyModel.objects.filter(pk=obj.pk).update(val=F('val') + 1)
    # At this point obj.val is still 1, but the value in the database
    # was updated to 2. The object's updated value needs to be reloaded
    # from the database.
    obj.refresh_from_db()
    self.assertEqual(obj.val, 2)
```

实际上，延迟字段就是通过 `refresh_from_db()` 在用户访问该字段时从数据库中加载的。所以，我们可以重写这个方法，来实现自定义的延迟加载行为（不要忘了调用 `super` ）：

```python
class ExampleModel(models.Model):
    def refresh_from_db(self, using=None, fields=None, **kwargs):
        # fields contains the name of the deferred field to be
        # loaded.
        if fields is not None:
            fields = set(fields)
            deferred_fields = self.get_deferred_fields()
            # If any deferred field is going to be loaded
            if fields.intersection(deferred_fields):
                # then load all of them
                fields = fields.union(deferred_fields)
        super(ExampleModel, self).refresh_from_db(using, fields, **kwargs)
```
 `Model.get_deferred_fields()` 是一个辅助方法，它返回一个集合，包含模型当前所有延迟字段的属性名称。


## 验证对象

验证一个模型涉及三个步骤：

1. 验证模型的字段 —— `Model.clean_fields()`

2. 验证模型的完整性 —— `Model.clean()`

3.验证模型的唯一性 —— `Model.validate_unique()`

当你调用模型的 `full_clean()` 方法时，这三个方法都将执行（顺序执行）。

当你使用 `ModelForm` 时， `is_valid()` 将为表单中的所有字段执行这些验证。

注意，当你调用模型的 `save()` 方法时， `full_clean()` 不会自动调用。如果你想一步就可以为你手工创建的模型运行验证，你需要手工调用它。

 `Model.clean_fields(exclude=None)` 和 `Model.validate_unique(exclude=None)` 都有一个可选的 `exclude` 参数让你提供一个字段名称列表来从验证中排除。如果有字段验证失败，它将引发一个 `ValidationError`。

 ## 对象保存

将一个对象保存到数据库，需要调用 `save()` 方法：

```python
Model.save([force_insert=False, force_update=False, using=DEFAULT_DB_ALIAS, update_fields=None])
```
该方法可以重写，重写的时候不要忘了调用 `super()` 。


### 当你保存时，发生了什么？

当你保存一个对象时，Django 执行以下步骤：

1. **发出一个 `pre-save` 信号**。 发送一个 `django.db.models.signals.pre_save` 信号，以允许监听该信号的函数完成一些自定义的动作。

2. **预处理数据**。 如果需要，对对象的每个字段进行自动转换。

大部分字段不需要预处理 —— 字段的数据将保持原样。预处理只用于具有特殊行为的字段。例如，如果你的模型具有一个 `auto_now=True` 的 `DateField`，那么预处理阶段将修改对象中的数据以确保该日期字段包含当前的时间戳。（我们的文档还没有所有具有这种“特殊行为”字段的一个列表。）

3. **准备数据库数据**。 要求每个字段提供的当前值是能够写入到数据库中的类型。

大部分字段不需要数据准备。简单的数据类型，例如整数和字符串，是可以直接写入的Python对象。但是，复杂的数据类型通常需要一些改动。

例如， `DateField` 字段使用 Python 的 `datetime` 对象来保存数据。数据库保存的不是 `datetime` 对象，所以该字段的值必须转换成ISO兼容的日期字符串才能插入到数据库中。

4. **插入数据到数据库中**。 将预处理过、准备好的数据组织成一个SQL语句用于插入数据库。

5. **发出一个 `post-save` 信号**。 发送一个 `django.db.models.signals.post_save` 信号，以允许监听听信号的函数完成一些自定义的动作。


### Django 如何知道是 `UPDATE` 还是 `INSER`

我们知道，Django 数据库对象使用同一个 `save()` 方法来创建和改变对象。实际上，Django 对 `INSERT` 和 `UPDATE` SQL 语句的使用进行抽象。当你调用 `save()` 时，Django 使用下面的算法：

* 如果对象的主键属性为一个求值为 `True` 的值（例如，非 `None` 值或非空字符串），Django 将执行 `UPDATE` 。

* 如果对象的主键属性没有设置或者 `UPDATE` 没有更新任何记录，Django 将执行 `INSERT`。

你可以设置　`save()`　的 `force_insert`　或 `force_update`
参数为　`True` 来强制实现插入或是更新。

在更新时，你可以使用　`update_fields`　参数来指定要更新的字段，从而获得一点轻微的性能提升：

```python
product.name = 'Name changed again'
product.save(update_fields=['name'])
```

### 基于已存在字段值的属性更新

有时候你需要在一个字段上执行简单的算法操作，例如增加或者减少当前值。实现这点的简单方法是像下面这样：

```python
>>> product = Product.objects.get(name='Venezuelan Beaver Cheese')
>>> product.number_sold += 1
>>> product.save()
```

如果从数据库中读取的旧的 `number_sold` 值为 `10` ，那么写回到数据库中的值将为 `11`。

通过将更新基于原始字段的值而不是显式赋予一个新值，这个过程可以避免**竞态条件**而且更快。Django 提供 `F` 表达式用于这种类型的相对更新。利用 `F` 表达式，前面的示例可以表示成：

```python
>>> from django.db.models import F
>>> product = Product.objects.get(name='Venezuelan Beaver Cheese')
>>> product.number_sold = F('number_sold') + 1
>>> product.save()
```

## 额外的实例方法

除了 `save()`、`delete()` 之外，模型的对象还可能具有以下一些方法：
`Model.get_FOO_display()`

对于每个具有 `choices` 的字段，每个对象将具有一个 `get_FOO_display()` 方法，其中 `FOO` 为该字段的名称。这个方法返回该字段对“人类可读”的值。

