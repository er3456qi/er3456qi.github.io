---
layout: post
title: "Typescript Handbook 精简版之变量声明"
date: 2016-02-23 17:12:22
category: programming
tags: Typescript
finished: true
---

## 变量声明

 `let` 和 `const` 是JavaScript新出的两个变量声明的方式。前面说过`let` 和 `var`类似，但是它们的作用域是不一样的。
 
关于作用域，在ES6之前的Javascript中，*函数体是唯一能能够创建新作用域的地方*。那时候没有`let`，用`var`声明的变量，作用域要么是全局，要么是函数体，没有块级的作用域（块作用域变量在包含它们的块外部或for循环外部是不能被访问的）。而新版的Javascript引入了`let`关键字，用以声明一个块级域的本地变量，这样能避免一些问题。

至于`const`，它的作用域和`let`一样，但是是声明创建一个只读常量，这里要注意一下，这并不意味着该常量指向的值不可变，而是该常量只能被赋值一次！

举个例子：

```typescript

// numLivesForCat的值不能再变了
const numLivesForCat = 9;
const kitty = {
    name: "Aurora",
    numLives: numLivesForCat,
}

// 错误，kitty指向的对象不能变
kitty = {
    name: "Danielle",
    numLives: numLivesForCat
};

// 没问题，对象的属性可以变化
kitty.name = "Rory";
kitty.name = "Kitty";
kitty.name = "Cat";
kitty.numLives--;

```

另外，使用`const`定义常量时，一定要初始化。

Typescript作为Javascript的超集，自然也是支持`let`和`const`的。


## 该用哪个

`const`没什么好说的，你需要常量就用它，不需要就不用。但是`let`和`var`要比较一下。

使用`var`声明变量时，不管你声明多少次，你得到的只有一个变量，而使用`let`时，同一个变量名在同一作用域内声明一次以上会报错。

使用`var`时很容易出bug，比如：

```typescript

function sumMatrix(matrix: number[][]) {
    var sum = 0;
    for (var i = 0; i < matrix.length; i++) {
        var currentRow = matrix[i];
        for (var i = 0; i < currentRow.length; i++) {
            sum += currentRow[i];
        }
    }

    return sum;
}

```

里层for循环中的i会覆盖外层的i，因为i引用的都是相同的函数作用域内的变量。

但是如果把`var`换成`let`，内层的for循环自己是一个块级作用域，会屏蔽外部的作用域中的相同名字的变量，所以这两个i会井水不犯河水。

另外，因为`var`是函数作用域，所以对于一个`var`声明的变量，你可以先使用再声明：

```typescript

bla = 2;
var bla;
// ...

// 可以理解为下面这样：

var bla;
bla = 2;

```

引用一段mozilla文档中的话：

>由于变量声明（以及其他声明）总是在任意代码执行之前处理的，所以在代码中的任意位置声明变量总是等效于在代码开头声明。这意味着变量可以在声明之前使用，这个行为叫做“hoisting”。

嗯，使用`var`时，这叫变量声明提升，但是如果你使用`let`时也这样做，这叫错误！ *块级作用域的变量的一个特点是，它们不能在被声明之前使用*。

最后，建议尽量用`let`替换`var`。

本文参考：

[Typescript Handbook 变量声明](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Variable%20Declarations.md)

[Typescript Handbook 翻译版变量声明](https://zhongsp.gitbooks.io/typescript-handbook/content/doc/handbook/Variable%20Declarations.html)

[mozilla Javascript参考文档 var](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)

[mozilla Javascript参考文档 let](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)

[mozilla Javascript参考文档 const](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const)