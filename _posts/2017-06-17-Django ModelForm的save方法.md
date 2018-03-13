---
layout: post
title: "Django ModelForm的save方法"
subtitle: 截取自Django官方文档
date: 2017-06-17 10:19:21
category: programming
tags: python django
finished: true
---


## The save() method

Every ModelForm also has a `save()` method. This method creates and saves a database object from the data bound to the form. A subclass of ModelForm can accept an existing model instance as the keyword argument instance; if this is supplied, `save()` will update that instance. If it’s not supplied, `save()` will create a new instance of the specified model:

```python
>>> from myapp.models import Article
>>> from myapp.forms import ArticleForm

# Create a form instance from POST data.
>>> f = ArticleForm(request.POST)

# Save a new Article object from the form's data.
>>> new_article = f.save()

# Create a form to edit an existing Article, but use
# POST data to populate the form.
>>> a = Article.objects.get(pk=1)
>>> f = ArticleForm(request.POST, instance=a)
>>> f.save()
```

Note that if the form hasn’t been validated, calling `save()` will do so by checking form.errors. A ValueError will be raised if the data in the form doesn’t validate – i.e., if form.errors evaluates to True.

If an optional field doesn’t appear in the form’s data, the resulting model instance uses the model field default, if there is one, for that field. This behavior doesn’t apply to fields that use CheckboxInput, CheckboxSelectMultiple, or SelectMultiple (or any custom widget whose `value_omitted_from_data()` method always returns `False`) since an unchecked checkbox and unselected don’t appear in the data of an HTML form submission. Use a custom form field or widget if you’re designing an API and want the default fallback behavior for a field that uses one of these widgets.

Changed in Django 1.10.1:
Older versions don’t have the exception for CheckboxInput which means that unchecked checkboxes receive a value of `True` if that’s the model field default.
Changed in Django 1.10.2:
The `value_omitted_from_data()` method was added.
This `save()` method accepts an optional commit keyword argument, which accepts either `True` or `False`. If you call `save()` with `commit=False`, then it will return an object that hasn’t yet been saved to the database. In this case, it’s up to you to call `save()` on the resulting model instance. This is useful if you want to do custom processing on the object before saving it, or if you want to use one of the specialized model saving options. commit is `True` by default.

Another side effect of using `commit=False` is seen when your model has a many-to-many relation with another model. If your model has a many-to-many relation and you specify `commit=False` when you save a form, Django cannot immediately save the form data for the many-to-many relation. This is because it isn’t possible to save many-to-many data for an instance until the instance exists in the database.

To work around this problem, every time you save a form using `commit=False`, Django adds a `save_m2m()` method to your ModelForm subclass. After you’ve manually saved the instance produced by the form, you can invoke `save_m2m()` to save the many-to-many form data. For example:

```python
# Create a form instance with POST data.
>>> f = AuthorForm(request.POST)

# Create, but don't save the new author instance.
>>> new_author = f.save(commit=False)

# Modify the author in some way.
>>> new_author.some_field = 'some_value'

# Save the new instance.
>>> new_author.save()

# Now, save the many-to-many data for the form.
>>> f.save_m2m()
# Calling save_m2m() is only required if you use save（commit=False). When you use a simple save() on a form, all data – including many-to-many data – is saved without the need for any additional method calls. For example:

# Create a form instance with POST data.
>>> a = Author()
>>> f = AuthorForm(request.POST, instance=a)

# Create and save the new author instance. There's no need to do anything else.
>>> new_author = f.save()
```
Other than the `save() `and `save_m2m()` methods, a ModelForm works exactly the same way as any other forms form. For example, the `is_valid()` method is used to check for validity, the `is_multipart()` method is used to determine whether a form requires multipart file upload (and hence whether request.FILES must be passed to the form), etc. See Binding uploaded files to a form for more information.


Specifying which fields to save

If `save()` is passed a list of field names in keyword argument update_fields, only the fields named in that list will be updated. This may be desirable if you want to update just one or a few fields on an object. There will be a slight performance benefit from preventing all of the model fields from being updated in the database. For example:

```python
product.name = 'Name changed again'
product.save(update_fields=['name'])
```

The update_fields argument can be any iterable containing strings. An empty update_fields iterable will skip the save. A value of None will perform an update on all fields.

Specifying update_fields will force an update.

When saving a model fetched through deferred model loading (`only()` or `defer()`) only the fields loaded from the DB will get updated. In effect there is an automatic update_fields in this case. If you assign or change any deferred field value, the field will be added to the updated fields.