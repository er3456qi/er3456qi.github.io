---
layout: post
title: "Django query 文档手记"
date: 2016-07-09 19:21:52
category: programming
tags: python django
finished: true
---

## 查询

一旦你建立好数据模型，Django 会自动为你生成一套数据库抽象的API，可以让你创建、检索、更新和删除对象。

Django也支持原生sql查询。欲详自查。

另外，对数据库操作结束后，不要忘了用`save()`保存。


## 基本

获取一个表中所有对象的最简单的方式是全部获取。可以使用管理器的`all()`方法:

```python
all_entries = Entry.objects.all()
```

通过`get()`获取一个单一的对象:

```python
one_entry = Entry.objects.get(pk=1)
```

为了方便，Django 提供一个查询快捷方式`pk`，它表示“primary key” 的意思。和`id`等价。

使用过滤器获取特定对象：

```python
Entry.objects.filter(pub_date__year=2006)
```
等价于（上面是种缩写的省略形式）:
```python
Entry.objects.all().filter(pub_date__year=2006)
```

链式过滤:

```python
>>> Entry.objects.filter(
...     headline__startswith='What'
... ).exclude(
...     pub_date__gte=datetime.date.today()
... ).filter(
...     pub_date__gte=datetime(2005, 1, 30)
... )
```


## 查询集是惰性执行的

一般来说，Django只有在“请求”查询集的结果时才会到数据库中去获取它们。比如下面的操作，实际上只有在最后一行时采访问了一次数据库。

```python
>>> q = Entry.objects.filter(headline__startswith="What")
>>> q = q.filter(pub_date__lte=datetime.date.today())
>>> q = q.exclude(body_text__icontains="food")
>>> print(q)
```

## 一些查询集方法

大多数情况下，需要从数据库中查找对象时，你会使用`all()`、 `get()`、`filter()` 和`exclude()`，这几个最常用，其他的还有很多，欲详自查。

## 限制查询集

可以使用Python的切片语法（不支持负索引）来限制查询集记录的数目 。它等同于SQL 的`LIMIT`和`OFFSET`子句。

例如，下面的语句返回前面5 个对象(`LIMIT 5`)：

```python
>>> Entry.objects.all()[:5]
```
下面这条语句返回第6 至第10 个对象(`OFFSET 5 LIMIT 5`)：

```python
>>> Entry.objects.all()[5:10]
```

通常，查询集 的切片返回一个新的查询集 —— 它不会执行查询。有一个例外，是如果你使用Python切片语法中"step"参数。例如，下面的语句将返回前10 个对象中每隔2个对象，它将真实执行查询：

```python
>>> Entry.objects.all()[:10:2]
```

## 字段查询

字段查询是指如何指定SQL `WHERE`子句的内容。它们通过查询集方法`filter()`、`exclude()` 和 `get()` 的关键字参数指定。

查询的关键字参数的基本形式是`field__lookuptype=value`。（中间是两个下划线）。例如：

```python
>>> Entry.objects.filter(pub_date__lte='2006-01-01')
```
翻译成SQL（大体）是：

```sql
SELECT * FROM blog_entry WHERE pub_date <= '2006-01-01';
```

查询条件中指定的字段必须是模型字段的名称。但有一个例外，对于ForeignKey你可以使用字段名加上`_id`后缀。在这种情况下，该参数的值应该是外键的原始值。例如：

```python
>>> Entry.objects.filter(blog_id=4)
```

Django支持约24种查询类型，下面举一些常用的：

* `exact` 精确匹配：

```python
>>> Entry.objects.get(headline__exact="Cat bites dog")
```
对应的sql：

```sql
SELECT ... WHERE headline = 'Cat bites dog';
```

* `iexact` 大小写不敏感的匹配：

```python
>>> Blog.objects.get(name__iexact="beatles blog")
```

* `contains` 大小写敏感（`icontains`是大小写不敏感）的包含关系测试：

```python
Entry.objects.get(headline__contains='Lennon')
```
对应的sql：

```sql
SELECT ... WHERE headline LIKE '%Lennon%';
```

还有如`startswith`, `endswith`就不一一举例了。

## 跨关联关系的查询

Django 提供一种强大而又直观的方式来“处理”查询中的关联关系，它在后台自动帮你处理`JOIN`。 若要跨越关联关系，只需使用关联的模型字段的名称，并使用双下划线分隔，直至你想要的字段。

下面这个例子获取所有Blog的`name`为'Beatles Blog' 的Entry对象（blog是Entry的一个外键）：

```python
>>> Entry.objects.filter(blog__name='Beatles Blog')
```
这种跨越可以是任意的深度。

它还可以反向工作。若要引用一个“反向”的关系，只需要使用该模型的小写的名称。

下面的示例获取所有的Blog对象，它们至少有一个Entry的`headline`包含'Lennon'：

```python
>>> Blog.objects.filter(entry__headline__contains='Lennon')
```

如果你在多个关联关系直接过滤而且其中某个中介模型没有满足过滤条件的值，Django 将把它当做一个空的（所有的值都为NULL）但是合法的对象。这意味着不会有错误引发。

### 跨越多值的关联关系

考虑：Blog/Entry 关联关系（Blog 和 Entry 是一对多的关系）。我们可能想找出`headline`为“Lennon” 且`pub_date`为'2016'的Entry。或者`headline`为“Lennon” 或`pub_date`为'2016'的Entry。针对两种情况，Django提供了解决方法，下面是代码。

这是且的情况：

```python
Blog.objects.filter(entry__headline__contains='Lennon', entry__pub_date__year=2008)
```
这是或的情况：

```python
Blog.objects.filter(entry__headline__contains='Lennon').filter(entry__pub_date__year=2008)
```

不满足时都返回空。


## Filter 可以引用模型的字段

到目前为止给出的示例中，我们构造过将模型字段与常量进行比较的filter。但是，如果你想将模型的一个字段与同一个模型的另外一个字段进行比较该怎么办？

Django 提供`F`表达式 来允许这样的比较。`F()`返回的实例用作查询内部对模型字段的引用。这些引用可以用于查询的filter 中来比较相同模型实例上不同字段之间值的比较。

例如，为了查找`n_comments`数目多于`n_pingbacks`的Entry，我们将构造一个`F()`对象来引用`n_pingback`数目，并在查询中使用该`F()`对象：

```python
>>> from django.db.models import F
>>> Entry.objects.filter(n_comments__gt=F('n_pingbacks'))
```

`F()`对象支持算术运算：

```python
>>> Entry.objects.filter(n_comments__gt=F('n_pingbacks') * 2)
>>> Entry.objects.filter(rating__lt=F('n_comments') + F('n_pingbacks'))
```

你还可以在`F()`对象中使用双下划线标记来跨越关联关系。带有双下划线的`F()`对象将引入任何需要的`join`操作以访问关联的对象。例如，如要获取`author`的名字与`blog`名字相同的Entry，我们可以这样查询：

```python
>>> Entry.objects.filter(authors__name=F('blog__name'))
```

对于`date`和`date/time`字段，你可以给它们加上或减去一个`timedelta`对象。下面的例子将返回发布超过3天后被修改的所有Entry：

```python
>>> from datetime import timedelta
>>> Entry.objects.filter(mod_date__gt=F('pub_date') + timedelta(days=3))
```
`F()`对象支持`.bitand()`和`.bitor()`两种位操作，例如：

```python
>>> F('somefield').bitand(16)
```

## 使用`Q`对象进行复杂的查询

`filter()`等方法中的关键字参数查询都是一起进行“`AND`” 的。 如果你需要执行更复杂的查询（例如`OR`语句），你可以使用`Q`对象。

`Q`对象 (`django.db.models.Q`) 对象用于封装一组关键字参数。这些关键字参数就是上文“字段查询” 中所提及的那些。

例如，下面的`Q`对象封装一个`LIKE`查询：

```python
from django.db.models import Q
Q(question__startswith='What')
```
`Q`对象可以使用`&`和`|`操作符组合起来。当一个操作符在两个`Q`对象上使用时，它产生一个新的`Q`对象。

例如，下面的语句产生一个`Q`对象，表示两个"`question__startswith`"查询的“`OR`”：

```python
Q(question__startswith='Who') | Q(question__startswith='What')
```
它等同于下面的SQL `WHERE`子句：

```sql
WHERE question LIKE 'Who%' OR question LIKE 'What%'
```
你可以组合`&`和`|`操作符以及使用括号进行分组来编写任意复杂的`Q`对象。同时，`Q`对象可以使用`~`操作符取反，这允许组合正常的查询和取反(`NOT`)查询：

```python
Q(question__startswith='Who') | ~Q(pub_date__year=2005)
```

每个接受关键字参数的查询函数（例如`filter()`、`exclude()`、`get()`）都可以传递一个或多个`Q`对象作为位置（不带名的）参数。如果一个查询函数有多个`Q`对象参数，这些参数的逻辑关系为“`AND`"。例如：

```python
Poll.objects.get(
    Q(question__startswith='Who'),
    Q(pub_date=date(2005, 5, 2)) | Q(pub_date=date(2005, 5, 6))
)
```

```sql
SELECT * from polls WHERE question LIKE 'Who%'
    AND (pub_date = '2005-05-02' OR pub_date = '2005-05-06')
```
查询函数可以混合使用`Q`对象和关键字参数。所有提供给查询函数的参数（关键字参数或`Q`对象）都将"`AND`”在一起。但是，如果出现`Q`对象，它必须位于所有关键字参数的前面。例如：

```python
Poll.objects.get(
    Q(pub_date=date(2005, 5, 2)) | Q(pub_date=date(2005, 5, 6)),
    question__startswith='Who')
```

# 其他

缓存，Django对数据库查询会做缓存，每个查询集都包含一个缓存来最小化对数据库的访问。

两个模型实例的比较（`==`）是比较的主键，主键一样，就是同一个实例。

想要拷贝一个对象，直接将其主键置为`None`即可。如果有继承的存在，需要把子类和父类的主键都置空。

### 反向查询

如果模型有一个`ForeignKey`，那么该`ForeignKey`所指的模型实例可以通过一个管理器（可以自定义）返回前一个模型的所有实例。默认情况下，这个管理器的名字为`foo_set`，其中`foo`是源模型的小写名称。

```python
>>> b = Blog.objects.get(id=1)
>>> b.entry_set.all() # Returns all Entry objects related to Blog.

# b.entry_set is a Manager that returns QuerySets.
>>> b.entry_set.filter(headline__contains='Lennon')
>>> b.entry_set.count()
```

你可以在`ForeignKey`定义时设置`related_name`参数来覆盖`foo_set`的名称。

## 反向的关联关系是如何实现的？

其它对象关系映射要求你在关联关系的两端都要定义。Django 的开发人员相信这是对DRY（不要重复你自己的代码）原则的违背，所以Django 只要求你在一端定义关联关系。

但是这怎么可能？因为一个模型类直到其它模型类被加载之后才知道哪些模型类是关联的。

答案在`app registry`中。当Django启动时，它导入`INSTALLED_APPS`中列出的每个应用，然后导入每个应用中的`models`模块。每创建一个新的模型时，Django添加反向的关系到所有关联的模型。如果关联的模型还没有导入，Django将保存关联关系的记录并在最终关联的模型导入时添加这些关联关系。

由于这个原因，你使用的所有模型都定义在`INSTALLED_APPS`列出的应用中就显得特别重要。否则，反向的关联关系将不能正确工作。