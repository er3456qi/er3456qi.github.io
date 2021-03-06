---
layout: post
title: "The Python Language Reference 手记之数据模型 1"
date: 2016-05-02 18:02:14
category: programming
tags: python
finished: true
---

## 对象,值和类型

Python 的每个对象都具有一个*标识*，一个*类型*和一个*值*。
一旦一个对象被创建，它的*标识*便永远不可改变；你可以认为它是内存中的地址。
[`is`][is]操作符可以比较两个对象的标识。[`id()`][id]函数返回一个表示该标识的整数。

对于CPython的实现，`id(x)`返回对象`x`的内存地址。

一个对象的*类型*决定了该对象所支持的操作（比如：有长度吗？），并且这个类型也定义了该类对象可能的值。[`type(x)`][type]函数返回对象`x`的类型。
和标识一样，对象的类型也是不可变的。

某些对象的*值*是可以改变的，这种对象被称为是可变的，而那些值不可以改变的对象一旦创建就被称为不可变的。
这里有个问题要强调一下，可变和不可变是由对象的类型确定的，比如数值,字符串和元组是不可变的,而字典和列表是可变的。
之所以要强调，是因为某些容器类是不可变的，但是在某些情况下，它其实是可以改变的，比如：

```python

In [1]: l = [1, 2]

In [2]: t = (l, 1)

In [3]: t
Out[3]: ([1, 2], 1)

In [4]: l[0] = 2

In [5]: t
Out[5]: ([2, 2], 1)

```

`tuple`元组是不可变类型的，但是因为它的元素中包含了可变的对象（`list`），所以元祖的值实际是可变的。
但是因为对象的可变不可变由类型来决定，所以元组是不可变的。

对象的资源不用显式的释放，但是，当某些对象变得不能访问时，它们可能会被当做垃圾收集。不同的python实现对垃圾回收机制的实现也不一样，一种实现方式是允许延迟垃圾收集或者完全忽略————这是内存垃圾回收机制如何实现的质量问题，这种实现要求不怎么高，只要不把可访问的对象当垃圾回收就可以，不要求把所有垃圾都回收掉。

对于CPython的内存垃圾回收细节：当前的CPython实现，使用一种叫做引用计数的垃圾回收机制，它还包括一个可选的对循环链接垃圾的延迟检测机制。
在这种垃圾回收机制下，只要对象不可用了,那么它们中的大部分会被回收,之所以说是大部分，是因为不能保证回收那些包含有循环引用的垃圾。对于循环回收的详细控制情况,参考[gc][]。
当一个对象变得不可访问时，不要对它会被立即终结有所依赖，因为那很可能是不会的，所以对于能手动释放内存的对象，你应该及时手动释放，比如你应该总是的手动关闭文件。

注意，在使用实现的跟踪和调试工具时可能会保留本该回收的对象。同样，`[try][]...[except][]`语句也会让对象一直存活。

有些对象包含有“外部”资源,像打开文件或窗口。我们知道在垃圾回收时这些资源也被释放,但因为垃圾回收不保证一定发生,所以这样的对象提供了显式的方法释放外部资源,通常是用`close()`方法。特别推荐使用这种方法释放包含外部资源的对象（比如文件）。
`[try]...[finally]`和`[with]`语句提供了一种便利的方式以自动释放资源。

类型对对象几乎所有的行为都有影响。
甚至在某种程度上对对象的标识也有重要的影响:
对于不可变对象,计算新值的操作可能实际上返回的是一个已经存在的具有相同类型和值的对象的引用,而这对于可变对象是不允许。
举个例子：

```python

In [1]: a1 = 1
In [2]: a2 = 1
In [3]: id(a1) == id(a2)
Out[3]: True

In [4]: id(a1)
Out[4]: 10105824

In [5]: id(a2)
Out[5]: 10105824

In [6]: s1 = 's'
In [7]: s2 = 's'
In [8]: id(s1) == id(s2)
Out[8]: True

In [9]: l1 = [1, 2, 3]
In [10]: l2 = [1, 2, 3]
In [11]: id(l1) == id(l2)
Out[11]: False

In [12]: id(l1)
Out[12]: 139673866026568

In [13]: id(l2)
Out[13]: 139673866033096

In [14]: t1 = (1, 2)
In [15]: t2 = (1, 2)
In [16]: id(t1) == id(t2)
Out[16]: False

In [17]: id(t1)
Out[17]: 139673881949960

In [18]: id(t2)
Out[18]: 139673881949576

```

通过例子可以发现，值相同的数字和字符串类型的标识（id）是一样的，因为它们是不可变的，当值相同时，给了它们相同的标识（内存地址）。
形象的说，当 `a1 = 1` 操作时，系统在内存中创建一个整数对象，值是 `1`，然后把对象 `1` 用变量 `a1` 表示。
之后，当 `a2 = 1` 操作时，系统知道在内存中已经有了值为 `1` 整数对象，所以就把对象 `1` 用变量 `a2` 表示。
因为整数类型是不可变的，所以可以放心的使用同一个地址的值。

可能有人会疑问，如果 `a2 = 2` 之后，会让 `a1` 的值为 `2` 么？回答是，当然不能。因为整数对象是不可变的啊。
`a2 = 2` 只是在内存中创建一个值为 `2` 的整数对象，然后把这个对象用变量 `a2`表示而已，这里变量 `a2` 原来表示整数对象 `1`， 现在开始表示整数对象 `2`。
正常啊，因为它是变量啊。

例子的后面，还测试了str类型、list类型和tuple类型，str和list没什么好说的，但是作为不可变类型的tuple，值相同的两个对象不是同一个，这个要注意一下了。


## Python 的数值型

Python 的数值型( `[nubmbers.Numbers][number]`) 由数值型字面值生成,或由算术运算和内置算术函数作为值返回。
数值型对象是不可变对象，其值一旦创建就不可以改变。Python 的数值型和数学上的关系非常密切,但要受到计算机的数值表达能力的限制。

对于整数类型、浮点数类型和虚数类型，Python的区别对待的。

### 整数类型

有两种整数类型：
* 数值型整数 [Integer][int]： 数值型整数的表示范围在语言上是没有限制的，它只受限于你的可用内存（虚拟内存）。
对于以移位和屏蔽为目的的运算，数值型正数被当做二进制形式表示。如果是负数,那么就被转换成二进制补码形式,符号位向左扩展。

* 布尔型整数 [Boolean][bool]: 布尔型整数的真值是用假和真来表示。布尔型整数对象只有 `False` 和 `True` 两种值。
布尔型整数是数值型整数的子类型，它的值分别用数值 0 和 1 表示，当需要转换成字符串时，会分别用 `False` 和 `True` 表现。

### 浮点数类型

Python的[浮点数][float]表示的是机器级别的双精度浮点数。Python是不支持单精度浮点数的，因为使用单精度浮点数的原因通常是减少CPU负荷和节省内存,
但是这一节省被对象在Python中的使用开销所抵消,所以Python没有必要支持两种浮点数，那会使语言变得复杂。

### 复数类型

[复数][complex]使用了一对双精度浮点数，就是说它的实部和虚部都是浮点数类型，虚数 `z` 的实部和虚部的访问方式：`z.real`、`z.imag`。


[is]: https://docs.python.org/3/reference/expressions.html#is
[id]: https://docs.python.org/3/library/functions.html#id
[type]: https://docs.python.org/3/library/functions.html#type
[gc]: https://docs.python.org/3/library/gc.html#module-gc
[try]: https://docs.python.org/3/reference/compound_stmts.html#try
[except]: https://docs.python.org/3/reference/compound_stmts.html#except
[finally]: https://docs.python.org/3/reference/compound_stmts.html#finally
[with]: https://docs.python.org/3/reference/compound_stmts.html#with
[number]: https://docs.python.org/3/library/numbers.html#numbers.Number
[int]: https://docs.python.org/3/library/functions.html#int 
[bool]: https://docs.python.org/3/library/functions.html#bool
[float]: https://docs.python.org/3/library/functions.html#float
[complex]: https://docs.python.org/3/library/functions.html#complex