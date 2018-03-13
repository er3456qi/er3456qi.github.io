---
layout: post
title: "Typescript Handbook 精简版之基础类型"
date: 2016-02-22 17:12:22
category: programming
tags: typescript
finished: true
---

## 简介

Typescript支持与Javascript几乎一样的数据类型：布尔值、数字、字符串，结构体等，此外Typescript还提供了很实用的枚举类型。

## Boolean

```typescript

let isDone: boolean = false;

```


## Number

支持二进制、八进制、十进制、十六进制。

```typescript

let binary: number = 0b1010;
let octal: number = 0o744;
let decimal: number = 6;
let hex: number = 0xf00d;

```

## String

单双引号都可以，

```typescript

let name: string = "bob";
name = 'smith';

```

支持跟C#一样的内嵌表达式，即使用反引号`包围内嵌字符串，然后以${}的方式嵌入变量：

```typescript

let name: string = `Gene`;
let age: number = 37;
let sentence: string = `Hello, my name is ${ name }.

I'll be ${ age + 1 } years old next month.`

```


## Array

```typescript

let list: number[] = [1, 2, 3];

```


或者这样定义：

```typescript

let list: Array<number> = [1, 2, 3];

```


## Tuple

跟C#中的类似，当然python也有：

```typescript

// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error

```


## Enum

```typescript

enum Color {Red, Green, Blue};
let c: Color = Color.Green;

```


枚举默认是从0开始为元素编号，也可以手动指定成员的数值：

```typescript

enum Color {Red = 1, Green, Blue};
let c: Color = Color.Green;

```


或者全部指定：

```typescript

enum Color {Red = 1, Green = 2, Blue = 4};
let c: Color = Color.Green;

```


可以通过枚举值获得枚举的名字：

```typescript

enum Color {Red = 1, Green, Blue};
let colorName: string = Color[2];

alert(colorName); // Green

```


## Any

通常为那些在编程阶段还不能够确认数据类型的变量指定为Any类型。这些值可以来自动态内容，比如用户输入或是第三方库。
这种情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译时的检查。
这时候可以使用 `any` 类型:

```typescript

let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean

```


你可能觉得 `any` 与 `Object` 的作用一样。但是，实际并不是这样。
你的确可以给 `Object` 类型赋任何类型的值，然后你却不能在它上面调用任意方法（即使那个对象真的有这些方法）！ 但是Any类型可以！

```typescript

let notSure: any = 4;
notSure.ifItExists(); // okay, ifItExists might exist at runtime
notSure.toFixed(); // okay, toFixed exists (but the compiler doesn't check)

let prettySure: Object = 4;
prettySure.toFixed(); // Error: Property 'toFixed' doesn't exist on type 'Object'.

```


当你只知道一部分数据的类型的时候， `any` 类型也很有用。比如你有一个数组，数组内包含不同类型（如果类型全都知道，可是用Tuple）：

```typescript

let list: any[] = [1, true, "free"];

list[1] = 100;

```


## Void

`void` 有点类似于 `any` 的反义词: 它表示没有任何类型。通常用在没有返回值的方法：

```typescript

function warnUser(): void {
    alert("This is my warning message");
}

```


声明一个 `void` 类型的变量没啥用，因为你只能给它赋值 `undefined` 或是 `null` ：

```typescript

let unusable: void = undefined;

```



关于`let`

`let` 是Javascript新添加的一个关键字，功能了`var`类似，但是它们的作用域不一样（详细自己查）。`let`更像是其他语言中定义变量的关键字，所以尽量用`let`来替代`var`。