---
layout: post
title:  "Django模板中的url与模型的get_absolute_url"
date:   2017-01-27 15:00:21
categories:
- blog
tags:
- Python
---


注，本文的代码是以一个博客系统为例子。

在django模板中，我们会经常遇到需要写url的地方。下面简单说下会用到的几种方法。

## 硬编码

我们可以硬编码，比如，我们要给一篇博客的标题加上链接，当用户点击这个标题时会跳转到该博客内容页面，我们可以这样写：

```html
<a href='post/{{ post.id }}'>\{{ post.title }}</a>
```

这好像没什么问题，功能也能实现。
但是当你的路由以后改变了（比如路由不再是`post/id`，而是`blog/id`)，你需要手动过来改，所以这不是一个好的设计。


## url 标签

django模板中，提供了`[url][]`标签，即

```
{% url 'some-url-name' v1 v2 %}
# or
{% url 'some-url-name' arg1=v1 arg2=v2 %}
```

注意url的名字要有引号，后面是参数。

现在，我们使用`url`在模板中写url的时候可以这么写了：

```
{% url 'posts:post_detail' post.id %}
```

这里假设，`app_name`是`posts`，博客详细内容的视图名为：`post_detail`, 我们往里面传了一个参数：`post.id`。
这种方法很好用的，至少比硬编码好很多，我们设定的路由需要修改时，只要保证视图名不变即可。


## get_absolute_url

在我们使用`url`标签时，如果我们需要修改定位博客的属性怎么办？比如我们不用`post.id`来定位博客了，而是使用`post.title`。
当然，解决方法可以是去每个出现该`url`的地方修改`id`为`title`。不过如果有很多处的话，这样改很麻烦。那有没有只用统一改一个地方就可以的方法呢？

答案是，有的。

django模型类里有一个`[get_absolute_url][]`方法。
它的作用是用来定位该model的。具体可以看文档，这里说下怎么用。

在python代码里，我们可以在model里这样实现`get_absolute_url`：

```python
from django.db import models
from django.core.urlresolvers import reverse


class Post(models.Model):
    title = models.CharField(max_length=64)
    content = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{}, {}'.format(self.title, self.created)

    def get_absolute_url(self):
        return reverse('posts:post_detail', kwargs={'id': self.id})
        # return reverse('posts:post_detail',  args=[str(self.id),]) 也可以
```

在模板里我们这样用：

```
<a href="{{ post.get_absolute_url }}">{{ post.title}}
```

当需要修改`post.id`为`post.title`时，我们只需要修改model里面的`get_absolute_url`方法即可。


## 总结

上面的三种方式，第一种是不推荐的，后两种用哪种，自己斟酌吧。


[url]: https://docs.djangoproject.com/en/1.10/ref/templates/builtins/#url
[get_absolute_url]: https://docs.djangoproject.com/en/1.10/ref/models/instances/#get-absolute-url

