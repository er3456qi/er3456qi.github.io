---
layout: post
title:  "Django validation 文档手记"
date:   2016-08-06 21:51:32
meta_description: Django validation 文档手记
categories:
- blog
tags:
- Python
---


# 表单验证和字段验证

表单验证是对表单的字段进行验证，而字段验证是在你自定义一个新的字段的时候对字段的需求进行验证。

表单验证发生在数据验证之后。如果你需要定制化这个过程，有几个不同的地方可以修改，每个地方的目的不一样。表单处理过程中要运行三种类别的验证方法。它们通常在你调用表单的 `is_valid()` 方法时执行。还有其它方法可以触发验证过程（访问 `errors` 属性或直接调用 `full_clean()` ），但是通用情况下不需要。

一般情况下，如果处理的数据有问题，每个类别的验证方法都会引发 `ValidationError`，并将相关信息传递给 `ValidationError`。 如果没有引发 `ValidationError`，这些方法应该返回验证后的（规整化的）数据的 Python 对象。

大部分表单和字段验证可以使用 `validators` 完成，它们也可以很容易地重用。`Validators` 是简单的函数（或可调用对象），它们接收一个参数并对非法的输入抛出 `ValidationError`。 `Validators` 在字段的 `to_python` 和 `validate` 方法调用之后运行。

表单的验证划分成几个步骤，它们可以定制或覆盖（注意区分**字段**的验证方法和**表单**的验证方法）：

1. **字段**的 `to_python()` 方法是验证的第一步。它将值强制转换为正确的数据类型，如果不能转换则引发 `ValidationError` 。 这个方法从 `widget` 接收原始的值并返回转换后的值。例如， `FloatField` 将数据转换为 Python 的 `float` 或引发 `ValidationError`。

2. **字段**的 `validate()` 方法处理字段特异性的验证，这种验证不适合位于 `validator` 中。它接收一个已经转换成正确数据类型的值， 并在发现错误时引发 `ValidationError`。这个方法不返回任何东西且不应该改变任何值。当你遇到不可以或不想放在 `validator` 中的验证逻辑时，应该覆盖它来处理验证。

3. **字段**的 `run_validators()` 方法运行字段的所有 `Validator`，并将所有的错误信息聚合成一个单一的 `ValidationError`。你应该不需要覆盖这个方法。

4. **字段子类**的 `clean()` 方法。它负责以正确的顺序运行 `to_python`、`validate` 和 `run_validators` 并传播它们的错误。如果任何时刻、任何方法引发 `ValidationError`，验证将停止并引发这个错误。这个方法返回验证后的数据，这个数据在后面将插入到表单的 `cleaned_data` 字典中。

5. **表单子类**中的 `clean_<fieldname>()` 方法 —— `<fieldname>` 通过表单中的字段名称替换。这个方法完成于特定属性相关的验证，这个验证与字段的类型无关。这个方法没有任何传入的参数。你需要查找 `self.cleaned_data` 中该字段的值，记住此时它已经是一个 Python 对象而不是表单中提交的原始字符串（它位于 `cleaned_data` 中是因为字段的 `clean()` 方法已经验证过一次数据）。

    例如，如果你想验证名为 `serialnumber` 的 `CharField` 的内容是否唯一， `clean_serialnumber()` 将是实现这个功能的理想之处。你需要的不是一个特别的字段（它只是一个 `CharField`），而是一个特定于表单字段特定验证，并规整化数据。

    这个方法返回从 `cleaned_data` 中获取的值，无论它是否修改过。

6. **表单子类**的 `clean()` 方法。这个方法可以实现需要同时访问表单多个字段的验证。这里你可以验证如果提供字段 A，那么字段 B 必须包含一个合法的邮件地址以及类似的功能。 这个方法可以返回一个完全不同的字典，该字典将用作 `cleaned_data`。

    因为字段的验证方法在调用 `clean()` 时会运行，你还可以访问表单的 `errors` 属性，它包含验证每个字段时的所有错误。

    注意，你覆盖的 `Form.clean()` 引发的任何错误将不会与任何特定的字段关联。它们位于一个特定的“字段”（叫做 `__all__`）中，如果需要可以通过 `non_field_errors()` 方法访问。如果你想添加一个特定字段的错误到表单中，需要调用 `add_error()`。

    还要注意，覆盖 `ModelForm` 子类的 `clean()` 方法需要特殊的考虑。

这些方法按以上给出的顺序执行，一次验证一个字段。也就是说，对于表单中的每个字段（按它们在表单定义中出现的顺序），先运行 `Field.clean()` ，然后运行 `clean_<fieldname>()`。每个字段的这两个方法都执行完之后，最后运行 `Form.clean()` 方法，无论前面的方法是否抛出过异常。

我们已经提到过，所有这些方法都可以抛出 `ValidationError`。对于每个字段，如果 `Field.clean()` 方法抛出 `ValidationError`，那么将不会调用该字段对应的 `clean_<fieldname>()` 方法。 但是，剩余的字段的验证方法仍然会执行。

注：字段的验证方法（如 `to_python`、 `validate`）一般在自定义字段中使用，表单的验证方法主要是 `clean_fields()` 和 `clean()`。例子：

```python
class MultiEmailField(forms.Field):
    def to_python(self, value):
        "Normalize data to a list of strings."
        # Return an empty list if no input was given.
        if not value:
            return []
        return value.split(',')

    def validate(self, value):
        "Check if value consists only of valid emails."
        # Use the parent's handling of required fields, etc.
        super(MultiEmailField, self).validate(value)
        for email in value:
            validators.validate_email(email)


class ContactForm(forms.Form):
    def clean_recipients(self):
        data = self.cleaned_data['recipients']
        if 'fred@example.com' not in data:
            raise forms.ValidationError('You have forgotten about Fred!')
        # Always return the cleaned data, whether you have changed it or not.
        return data
```

## 抛出 `ValidationError`

在自定义的验证过程中，你可以能需要抛出 `ValidationError` 异常。为了让错误信息更加灵活或容易重写，下面有几条准侧：

* 给构造函数提供一个富有描述性的错误码code：

```python
# Good
ValidationError(_('Invalid value'), code='invalid')

# Bad
ValidationError(_('Invalid value'))
```

* 不要预先将变量转换成消息字符串；使用占位符和构造函数的params 参数：

```python
# Good
ValidationError(
    _('Invalid value: %(value)s'),
    params={'value': '42'},
)

# Bad
ValidationError(_('Invalid value: %s') % value)
```

* 使用字典参数而不要用位置参数。这使得重写错误信息时不用考虑变量的顺序或者完全省略它们：

```python
# Good
ValidationError(
    _('Invalid value: %(value)s'),
    params={'value': '42'},
)

# Bad
ValidationError(
    _('Invalid value: %s'),
    params=('42',),
)
```

* 用 `gettext` 封装错误消息使得它可以翻译：

```python
# Good
ValidationError(_('Invalid value'))

# Bad
ValidationError('Invalid value')
```
所有的准则放在一起就是：

```python
raise ValidationError(
    _('Invalid value: %(value)s'),
    code='invalid',
    params={'value': '42'},
)
```
如果你想编写可重用的表单、表单字段和模型字段，遵守这些准则是非常必要的。

如果在一个验证方法中检查到多个错误并且希望将它们都反馈给表单的提交者，可以传递一个错误的列表给ValidationError 构造函数。

```python
# Good
raise ValidationError([
    ValidationError(_('Error 1'), code='error1'),
    ValidationError(_('Error 2'), code='error2'),
])

# Bad
raise ValidationError([
    _('Error 1'),
    _('Error 2'),
])
```