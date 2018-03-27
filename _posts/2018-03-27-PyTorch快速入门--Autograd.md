---
layout: post
title: "PyTorch快速入门--Autograd"
date: 2018-03-27 10:37:43
category: programming
tags: python, pytorch
finished: true
---


PyTorch 中，神经网络的核心就是`autograd`模块。

`autograd`模块对所有针对Tensor的运算提供自动微分功能。

## Variable

`autograd`模块的核心类是`Variable`。`Variable` 封装了Tensor，支持几乎所有Tensor的运算功能。可以使用`.backward()`方法来自动地计算梯度。

`Variable`对象中：
* `.data` 属性可以获取`Variable`中封装的tensor；
* `.grad` 属性可以获得梯度值；
* `.grad_fn` 属性可以获得创建该对象方法的引用，即，这个属性保存着创建该variable的方法的引用（由用户创建的variable对象的·`.grad_fn` 属性是 `None`)。

![variable](http://pytorch.org/tutorials/_images/Variable.png)

`Variable` 的一些示例代码：

```python
import torch
from torch.autograd import Variable

x = Variable(torch.ones(2, 2), requires_grad=True)
print(x)
```

输出：

```
Variable containing:
 1  1
 1  1
[torch.FloatTensor of size 2x2]
```

对 variable做运算：

```python
y = x + 2
print(y)
```

输出：

```
Variable containing:
 3  3
 3  3
[torch.FloatTensor of size 2x2]
```

`x`是由用户创建的，而`y`是通过运算创建的，所以：

```python
print(x.grad_fn)  # None
print(y.grad_fn)  # <AddBackward0 object at 0x7f84ebc216d8>
```

更多运算：

```python
z = y * y * 3
out = z.mean()

print(z, out)
```

输出：

```
Variable containing:
 27  27
 27  27
[torch.FloatTensor of size 2x2]
 Variable containing:
 27
[torch.FloatTensor of size 1]
```

## Gradients

现在可以试试计算梯度了：

```python
out.backward()
print(x.grad)  # print gradients d(out)/dx
```

输出：

```
Variable containing:
 4.5000  4.5000
 4.5000  4.5000
[torch.FloatTensor of size 2x2]
```

这里要特别说明一下， `backward()` 方法的原型是:
> `torch.autograd.backward(variables, grad_variables=None, retain_graph=None, create_graph=None, retain_variables=None)`

该方法需要两个参数，一个是 `variables`，即被求导的对象；另一个是 `grad_variables` ，如果是对一个标量进行反向传播，那么这个参数可以省略（缺省值为 `1.0` ）。比如上面的例子， `out` 是一个标量，那么对其调用 `backward()` 时，可以不传参数用默认的值 `1.0`.

实际上：

> `y.backward(w)` 的含义是：先计算 `l = torch.sum(y * w)`，然后求 `l` 对（能够影响到 `y` 的）所有变量 `x` 的导数。这里，`y` 和 `w` 是同型 Tensor。

另外，在官网文档中说：`torch.autograd.backward` 的第二个参数 `grad_variables` 应该是第一个参数 `variables` 的对应的导数。

关于为什么要这样，以及这个地方更详细的解释，推荐一篇讲的很好文章: [PyTorch 的 backward 为什么有一个 grad_variables 参数？][post]

## 其他

插播一下标量和向量和张量的关系，举个简单的例子。它们三个用矩阵表示的话：
* 标量：`1*1` 维矩阵
* 向量：`1*n` 维矩阵
* 张量：`n*n` 维矩阵


[post]: https://zhuanlan.zhihu.com/p/29923090