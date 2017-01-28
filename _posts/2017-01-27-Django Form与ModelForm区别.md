---
layout: post
title:  "Django Form与ModelForm区别"
date:   2017-01-27 15:32:05
categories:
- blog
---

注：本文会不定期补充，这里的例子还是博客应用。

在django中，我们有两种方式创建一个form：一种是继承`[forms.Form][]`另一种是继承`[forms.ModelForm][]`。
前者的自定义化程度高一些，比如我们可以指定某个`field`的类型和一些其他属性。
但是`ModelForm`不可以，`ModelForm`的`field`属性类型是和与其绑定的`model`所对应的。这里有个[对照表][]。

示例：

```python
class PostForm(forms.Form):
    title = forms.CharField(max_length=64,
                            widget=forms.TextInput(
                                attrs={
                                    'placeholder': 'title',
                                    'class': 'form-control'
                                }
                            ))
    content = forms.CharField(widget=forms.Textarea)

class PostForm(forms.ModelForm):

    class Meta:
        model = Post
        fields = ('title', 'content')
```

另外，ModelForm还自带一个save方法，该方法会自动保存数据到数据库，比较方便，详细请看文档。

```python
# 使用Form时
if form.is_valid():
    cd = form.cleaned_data
    post = Post(title=cd['title'], content=cd['content'])
    post.save()

# 使用ModelForm时
if form.is_valid():
    form.save()
```

由于`ModelForm`与`Model`绑定，因此，在创建`ModelForm`对象时，可以指定其`instance`参数为与其绑定的`Model`：

```python
    post = get_object_or_404(Post, id=id)
    form = PostForm(request.POST or None, instance=post)
```

而`Model`则不可以这样。



[forms.Form]: https://docs.djangoproject.com/en/1.10/topics/forms/
[forms.ModelForm]: https://docs.djangoproject.com/en/1.10/topics/forms/modelforms/
[对照表]: https://docs.djangoproject.com/en/1.10/topics/forms/modelforms/#field-types

