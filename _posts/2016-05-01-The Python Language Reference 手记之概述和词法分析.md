---
layout: post
title:  "The Python Language Reference 手记之概述和词法分析"
date:   2016-05-01 19:57:01
meta_description: The Python Language Reference 手记
categories:
- blog
tags:
- Python
---

## 概述

首先，语言参考只是一个对python这个语言的描述，它并不能作为python的学习教程。但是通过这个语言描述，你可以知道python在语言层面上的一些知识，让你对python有更多的了解。另外，python的内建和标准模块可以参考 [The Python Standard Library][stdlib]。
我写这文的原因是想让把一些我觉得重要的东西记下来，方便以后查看。当然，既然发出来，也是分享给大家看。


## 词法分析

### python脚本的编码声明

编码声明，如下所示：

    # -*- coding: <encoding-name> -*-
   
就是我们在python脚本文件中经常能看到的，表示此脚本内容以什么编码方式编码。
它是注释的一种。如果python脚本的第一行或是第二行中出现了能匹配如下正则表达式：

    coding[=:]\s*([-\w.]+)

的语句，则会被当做是编码声明处理。正则表达式很简单，我就不解释了。只要能匹配这个正则表达式，就可以，所以还有其他的声明方式：

    # vim:fileencoding=<encoding-name>

这里说的两种编码声明是官方文件里说的两种。另一种更常见的应该是这个：

    # coding:utf-8

它也能匹配上面说的那个正则表达式，所以这个也是可用的。
如果你使用python 2，如果你的脚本里有非ASCII字符，那么最好要加上编码声明。
至于python 3，因为python 3默认采用UTF-8编码，所以一般情况下就不需要了，除非你有特殊的情况要把文件以其他格式编码。

### 标识符和保留字

python 2 中的合法标识符（名字）都是ASCII码字符，简明点说就是数字、字母和下划线，其中数字不能做第一个字符。
python 3 在 2 的基础上扩展了标识符，支持一些非ASCII字符作为标识符的一部分，所以即使你给一个变量取中文名字也是合法的。

另外，标识符的长度是没有限制的。

在Python中，除了`def`、`for`、`class`等这些保留字之外，还有几种特殊的保留字（注：下面的`*`表示任意个字符）：

* `_*`: 这类保留字不能通过`from module import *`导入。特殊字符`_`,在交互式解释器中用于存储上次估值的结果:

{% highlight python %}

    [In ]: 1 + 2
    [Out]: 3

    [In ]: _
    [Out]: 3

{% endhighlight %}

当不在交互解释器环境中时，`_`是没有定义的。

* `__*__`: 系统定义的名称。这类名称有解释器及它的实现（包括标准库）定义。更多内容参考[这里][specialnames]。
在任何上下文中不遵守文档规范使用`__*__`名称，都会更容易出现错误而不会收到任何警告。

* `__*`: 类的私有名称，在类定义的上下文中使用这类名称时，会被认为是私有的。
在内部，该名称会被以另一种方式重写（也是为了避免和其他属性名冲突），这样在类外就无法访问直接到这个属性了，从而达到私有的目的。
实际上，这种私有只是在api中不会出现，其实它还是可以访问到的。

下面举个私有属性的例子：

{% highlight python %}

[In ]: class Person():
...        name = 'tom'
...        __age = 18
... 
[In ]: p = Person()
[In ]: p.name
[Out]: 'tom'

[In ]: p.__age
Traceback (most recent call last):
File "<stdin>", line 1, in <module>
AttributeError: 'Person' object has no attribute '__age'

[In ]: dir(p)
['_Person__age', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'name']

[In ]: p._Person__age
[Out]: 18

{% endhighlight %}

看代码的最后，其实还是可以访问到的。


### 文本

python 中，字节文本总是以 `b` 或 `B` 开头。他们会生成[`bytes`][]而不是[`str`][]。它们可能只包含ASCII 字符，128及以上的数字必须使用转义字符表示。

在python 2中，字符串前面加上 `u` 表示该字符串以unicode编码，如`u'字符串``。为了简化2 to 3，python 3 里也默许了这种行为，
虽然并没啥用（python 3本来就是用unicode编码的）。

另外，字符串前面加 `r` 表示原始字符串，该字符串内的转义字符都没有作用。

对于字符串的连接，多个相邻的字符串文本或字节文本(由空白分隔),其含义与连接在一起时是一样的。也就是说：

`"hello"              'world'` 与 `"helloworld"` 是等价的。

这样件找了字符串连接符（`\`）的使用数量，可以很方便的将一个长字符串分隔在多行上，甚至可以在字符串的某一部分添加注释,比如：

{% highlight python %}

re.compile("[A-Za-z_]"       # letter or underscore
           "[A-Za-z0-9_]*"   # letter, digit or underscore
          )

{% endhighlight %}



本文参考：

[The Python Language Reference Introduction][intr]

[The Python Language Reference Lexical analysis][lexical]


[stdlib]:  https://docs.python.org/3/library/index.html#library-index
[specialnames]: https://docs.python.org/3/reference/datamodel.html#specialnames
[bytes]: https://docs.python.org/3/library/functions.html#bytes
[str]: https://docs.python.org/3/library/stdtypes.html#str
[intr]: https://docs.python.org/3/reference/introduction.html
[lexical]: https://docs.python.org/3/reference/lexical_analysis.html