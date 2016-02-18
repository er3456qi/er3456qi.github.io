---
layout: post
title:  "C#的checked和unchecked"
date:   2015-05-08 18:27:00
meta_description: C# checked unchecked
categories:
- blog
tags:
- c#
---

C#的 [checked][] 关键字用于对整型算术运算和转换显式启用溢出检查。

简单点说，我们在进行数值计算时，运算结果可能会超出该类型能表达的数值范围，因而结果溢出。而这个溢出如果是**含有变量的表达式**的话，编译器默认是不会检查的（见第三段代码），为什么不检查，因为溢出检查比较耗时。可是我们在实际应用中，可能会遇到计算结果不能溢出的情况，因而我们可以使用checked块标记这段代码，然后运行时一旦发生溢出，这里会抛出异常，从而我们可以对其采取相应的解决方法。

[unchecked][] 关键字则阻止溢出检查。注意这里说的是不检查溢出，而不是检查了不抛出异常。详细可以点链接查看msdn文档。至于为啥会有unchecked存在的必要，还是那句，因为检查溢出比较耗时，所以当无溢出危险时，使用不检查的代码可以提高性能。但是，如果可能发生溢出，则应使用检查环境。

我在学习这段时，遇到的问题是写了unchecked和什么都不写有什么区别，对于代码段3来说，确实没有区别。但是对于代码段1、2，就能看出区别了，代码段1在vs2013里面会有红线，编译出错，而代码段2就没问题。貌似对于直接能看出来的溢出编译器还是能发现的，所以我上面说了**含有变量的表达式**。

{% highlight c# %}

//1. 这句编译器在编译时会报错，因为值溢出了 
Console.WriteLine(int.MaxValue + 1);
 
//2. 下面这样就不会报错，正常运行，输出溢出的值
unchecked { Console.WriteLine(int.MaxValue + 1); }
 
//3. 这里的结果会溢出，但编译器检查不到，会正常运行，输出溢出的值
int n = int.MaxValue;
n += 1;
 
//4. 加上checked，这样在编译后，运行时一旦溢出就会引发System.OverflowException异常。
int n = int.MaxValue;
checked { n += 1; }

{% endhighlight %}


[checked]: http://msdn.microsoft.com/zh-cn/library/74b4xzyw.aspx
[unchecked]: http://msdn.microsoft.com/zh-cn/library/a569z7k8.aspx