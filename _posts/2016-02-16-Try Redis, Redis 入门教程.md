---
layout: post
title: "Try Redis : Redis 入门教程"
subtitle: "总结自 Redis 官方文档"
date: 2016-02-16 17:06:01
category: programming
tags: redis
finished: true
---

## 开篇

Redis 是一种以键值对（key-value）存储数据的NoSQL数据库。

键值对存储数据的本质是以某个键存储某个值。之后你可以用这个键把存储的值取出来。可以用`SET`命令以键‘servername’存储值‘fido’：

```SQL

    SET servername 'fido'

```


这样，数据就被存储了，之后可以使用`GET`取出刚刚存储的数据：

```SQL

    GET servername // 返回 "fido"

```

对于数据的操作，还有一些基本的命令，比如`INCR`和`DEL`。

`INCR` 用于*原子地*递增一个数值数据。而`DEL`则是删除一个值。

```SQL

    SET connections 10
    INCR connections // 返回 11
    INCR connections // 返回 12
    DEL connections
    INCR connections // 返回 1

```

## 给值指定寿命

可以通过`EXPIRE`设置一个值的存活时间，过了这个时间，该值就会被删除。通过`TTL`可以查看值的存活时间。

对于`TTL`，
* 如果一个值没有设置存活时间，那么`TTL`会返回`-1`，表示这个值不会过期（这是值的默认寿命：长生）;
* 如果一个值设置了存活时间，在存活时间内，对值使用`TTL`会返回相应的生命剩余时间;
* 如果对一个不存在的值或是已经超过存活时间（会被删除）的值使用`TTL`，会返回`-2`。

注意，每使用`SET`设置一个值时，该值的`TTL`都会被重置为默认。

例子：

```SQL

    SET resource:lock 'Redis Demo 1'
    TTL resource:lock // 返回 -1
    
    EXPIRE resource:lock 120 //设置存活时间为120秒
    
    // 7秒后
    TTL resource:lock // 返回 113
    // 120秒以后
    TTL resource:lock // 返回 -2
    
    SET resource:lock 'Redis Demo 2'
    TTL resource:lock // 返回 -1

```


## 列表(list)

Redis也支持一些复杂的/复合的（complex）数据结构。这里第一个要说的是列表。列表是一系列有序的值的集合。
与列表交互的几个重要方法有：`RPUSH`, `LPUSH`, `LLEN`, `LRANGE`, `LPOP`和`RPOP`。
* `RPUSH`和`LPUSH`用于在列表的右端和左端插入数据。
* `LLEN`返回列表的长度。
* `LRANGE`返回一个子列表，它接收两个参数，它们标识你所要的子序列的首尾元素在原序列的位置。
如果第二个元素是-1，则表示到序列的末尾。
* `LPOP`和`RPOP`删除并返回左右两端的第一个元素（跟栈的pop一样）。

例子（不用显式的创建列表，在向一个不存在的列表中插入值时，列表会被自动创建，当列表中的最后一个元素被pop后，列表会被自动删除）：

```SQL

    RPUSH friends "Alice" // 创建一个列表friends并对其添加一个元素"Alice"
    RPUSH friends "Bob"  // 向friends添加元素"Bob"
    LPUSH friends "Sam" // 向friends添加元素"Sam"

    LRANGE friends 0 -1 // 返回 1) "Sam", 2) "Alice", 3) "Bob"
    LRANGE friends 0 1 // 返回 1) "Sam", 2) "Alice"
    LRANGE friends 1 2 // 返回 1) "Alice", 2) "Bob"

    LLEN friends // 返回 3
    LPOP friends // 返回 "Sam"
    RPOP friends // 返回 "Bob"
    
    LLEN friends // 返回 1
    LRANGE friends 0 -1 // 返回 1) "Alice"

```


## 集合（set)

集合跟列表类似，但是集合是无序的，且集合内元素唯一。

集合的几个常用命令为：`SADD`, `SREM`, `SISMEMBER`, `SMEMBERS`和`SUNION`。

* `SADD` 向集合中添加值。
* `SREM` 从集合中删除给定的值。
* `SISMEMBER` 接收一个参数，用以判断该参数的值是否在集合中，若在集合中返回1，否则返回0。
如果不给参数，则返回整个列表。
* `SMEMBERS` 返回集合中所有元素。
* `SUNION` 合并两个集合。

例子（跟列表一样，集合也不用显式创建）：

```SQL

    SADD superpowers "flight"
    SADD superpowers "x-ray vision"
    SADD superpowers "reflexes"

    SREM superpowers "reflexes"

    SISMEMBER superpowers "flight" // 返回 1
    SISMEMBER superpowers "reflexes" // 返回 0

    SMEMBERS superpowers // 返回 1) "flight", 2) "x-ray vision"

    SADD birdpowers "pecking"
    SADD birdpowers "flight"
    SUNION superpowers birdpowers // 返回 1) "pecking", 2) "x-ray vision", 3) "flight"

```


## 有序集合（Sorted Sets)

集合是个很好用的数据结构，但是因为它是无序的，在某些情况下使用会不太方便。所以Redis 1.2 引入了有序集合。

有序集合的命令是`Z`开头，比如：有序集合的数据插入用的是`ZADD`而不是`SADD`。
有序集合跟常规集合类似，不过有序集合的每个值都有一个与其关联的分数（associated score），这个分数用于排序集合内元素。

来一个例子：

```SQL

    ZADD hackers 1940 "Alan Kay"
    ZADD hackers 1906 "Grace Hopper"
    ZADD hackers 1953 "Richard Stallman"
    ZADD hackers 1965 "Yukihiro Matsumoto"
    ZADD hackers 1916 "Claude Shannon"
    ZADD hackers 1969 "Linus Torvalds"
    ZADD hackers 1957 "Sophie Wilson"
    ZADD hackers 1912 "Alan Turing"

```

在例子中，第一个参数（出生年）是排序的分数，下面获取索引值2到4的元素（从0开始）：

```SQL

    ZRANGE hackers 2 4 // 返回 1) "Claude Shannon", 2) "Alan Kay", 3) "Richard Stallman"

```


## Hashes

`Hashes` 是字符串字段和字符串值之间的映射。所以它是表示对象的最佳数据类型：

```SQL

    HSET user:1000 name "John Smith"
    HSET user:1000 email "john.smith@example.com"
    HSET user:1000 password "s3cret"

```

使用`HGETALL`获得存储的数据（返回所有的字段名和字段值）:

```SQL

    HGETALL user:1000

```

也可以把对象的属性一次设置完：

```SQL

    HMSET user:1001 name "Mary Jones" password "hidden" email "mjones@example.com"

```

获取某个特定字段：

```SQL

    HGET user:1001 name // 返回 "Mary Jones"

```

数值类型在hash字段中也是很好用的，比如原子地步进一个数啥的都是可以的：

```SQL

    HSET user:1000 visits 10
    HINCRBY user:1000 visits 1 // 返回 11
    HINCRBY user:1000 visits 10 // 返回 21
    HDEL user:1000 visits
    HINCRBY user:1000 visits 1 // 返回 1

```

## 结束

本文翻译自[Try Redis][tryredis]。

到此为止，try redis教程结束。更多内容，请看下面链接：
   
[Redis Documentation](http://redis.io/documentation)

[Command Reference](http://redis.io/commands)

[Implement a Twitter Clone in Redis](http://redis.io/topics/twitter-clone)

[Introduction to Redis Data Types](http://redis.io/topics/data-types-intro)

[tryredis]: http://try.redis.io/
