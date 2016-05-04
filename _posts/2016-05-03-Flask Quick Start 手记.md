---
layout: post
title:  "Flask Quick Start 手记"
date:   2016-05-03 20:48:11
meta_description: Flask Quick Start 手记
categories:
- blog
tags:
- Python
---


## 一个最小的 Flask 应用

{% highlight python %}

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run()

{% endhighlight %}

那么，这些代码是什么意思呢？

1. 首先我们导入了 Flask 类。这个类的实例将会成为我们的 WSGI 应用。

2. 接着我们创建了这个类的实例。第一个参数是应用模块或者包的名称。如果你使用一个单一模块（就像本例），那么应当使用 `__name__` ，因为名称会根据这个模块是按应用方式使用还是作为一个模块导入而发生变化（可能是 `'__main__'` ，也可能是实际导入的名称）。
这个参数是必需的，这样 Flask 就可以知道在哪里找到模板和静态文件等东西。

3. 然后我们使用 `route()` 装饰器来告诉 Flask 触发函数的 URL 。

4. 函数名称可用于生成相关联的 URL ，并返回需要在用户浏览器中显示的信息。

5. 最后，使用 `run()` 函数来运行本地服务器和我们的应用。 `if __name__ == '__main__':` 确保服务器只会在使用 Python 解释器运行代码的情况下运行，而不会在作为模块导入时运行。

开启调试模式时，服务器会在代码修改时自动重启。开启的方式有两种：

{% highlight python %}

app.debug = True
app.run()

""" 或者 """
app.run(debug=True)

{% endhighlight %}


## 路由

`route()` 装饰器用于把一个函数绑定到一个 URL:

{% highlight python %}

@app.route('/')
def index():
    return 'Index Page'

@app.route('/hello')
def hello():
    return 'Hello World'

{% endhighlight %}

通过把 URL 的一部分标记为 `<variable_name>` 就可以在 URL 中添加变量。标记的部分会作为关键字参数传递给函数。
通过使用 `<converter:variable_name>` ，可以选择性的加上一个转换器，为变量指定规则。比如：

{% highlight python %}

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return 'User %s' % username

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return 'Post %d' % post_id

{% endhighlight %}

现有的转换器（converter）有：

* int: 接受整数
* float: 接受浮点数
* path: 和缺省情况相同，但也接受斜杠


## URL 构建

 `url_for()` 函数用于构建指定函数的 URL 的。类似于反射。
 它把函数名称作为第一个参数，其余参数对应 URL 中的变量。未知变量将添加到 URL 中作为查询参数。比如：
 
{% highlight python %}

>>> from flask import Flask, url_for
>>> app = Flask(__name__)
>>> @app.route('/')
... def index(): pass
...
>>> @app.route('/login')
... def login(): pass
...
>>> @app.route('/user/<username>')
... def profile(username): pass
...
>>> with app.test_request_context():
...  print url_for('index')
...  print url_for('login')
...  print url_for('login', next='/')
...  print url_for('profile', username='John Doe')
...
/
/login
/login?next=/
/user/John%20Doe

{% endhighlight %}

动态的 web 应用也需要静态文件，一般是 CSS 和 JavaScript 文件。
Flask 默认静态文件位于应用的 `/static` 文件夹中。静态文件的链接也可以由 `url_for()` 函数生成：

{% highlight python %}

# 使用选定的 'static' 端点就可以生成相应的 URL，
# 这个静态文件在文件系统中的位置应该是 static/style.css
url_for('static', filename='style.css')

{% endhighlight %}


## HTTP 方法

默认情况下，一个路由只回应 GET 请求，但是可以通过 `methods` 参数使用不同方法。比如：

{% highlight python %}

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        do_the_login()
    else:
        show_the_login_form()

{% endhighlight %}

如果当前使用的是 GET 方法，会自动添加 HEAD ，你不必亲自操刀。


## 模板

Flask 使用 [Jinja2][jinja2] 作为模板引擎。
在Flask中，使用 `render_template()` 方法可以渲染模板，你只要提供模板名称和需要作为参数传递给模板的变量就行了。例子：

{% highlight python %}

from flask import render_template

@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)
    
{% endhighlight %}

Flask 默认会在 `/templates` 文件夹内寻找模板。

模板举例：

<pre>

<!doctype html>
<title>Hello from Flask</title>
{% if name %}
    <h1>Hello {{ name }}!</h1>
{% else %}
    <h1>Hello World!</h1>
{% endif %}

</pre>

提醒：在模板内部你也可以访问 `request` 、`session` 和 `g` 对象，以及 `get_flashed_messages()` 函数。

## 请求对象

在 Flask 中，客户端向服务器发送的数据由全局（本线程内）对象 `request` 来提供。关于 `request` 的使用，
首先，你必须从 flask 模块导入请求对象，之后通过使用 `method` 属性可以操作当前请求方法，通过使用 form 属性处理表单数据。
以下是使用两个属性的例子:

{% highlight python %}

from flask import request

@app.route('/login', methods=['POST', 'GET'])
def login():
    error = None
    if request.method == 'POST':
        if valid_login(request.form['username'],
                       request.form['password']):
            return log_the_user_in(request.form['username'])
        else:
            error = 'Invalid username/password'
    # 如果请求访求是 GET 或验证未通过就会执行下面的代码
    return render_template('login.html', error=error)

{% endhighlight %}

当 form 属性中不存在这个键时会引发一个 `KeyError` 。如果你不像捕捉一个标准错误一样捕捉 `KeyError` ，
那么会显示一个 `HTTP 400 Bad Request` 错误页面。因此，多数情况下你不必处理这个问题。

要操作 URL （如 `?key=value` ）中提交的参数可以使用 `args` 属性:

{% highlight python %}

""" 这里 args 是个字典dict，get的第二个参数是没有key的时候返回的值 """
searchword = request.args.get('key', '')

{% endhighlight %}

## 文件上传

用 Flask 处理文件上传很容易，只要确保不要忘记在你的 HTML 表单中设置 `enctype="multipart/form-data"` 属性就可以了。
否则浏览器将不会传送你的文件。

已上传的文件被储存在内存或文件系统的临时位置。你可以通过请求对象的 `files` 属性(即`request.files`)来访问上传的文件。
每个上传的文件都储存在这个字典型属性中。
这个属性基本和标准 Python file 对象一样，另外多出一个用于把上传文件保存到服务器的文件系统中的 `save()` 方法。
下例展示其如何运作:

{% highlight python %}

from flask import request

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['the_file']
        f.save('/var/www/uploads/uploaded_file.txt')
    ...

{% endhighlight %}

如果想要知道文件上传之前其在客户端系统中的名称，可以使用`filename` 属性。但是请牢记这个值是可以伪造的，永远不要信任这个值。
如果想要把客户端的文件名作为服务器上的文件名，可以通过 Werkzeug 提供的 `secure_filename()` 函数:

{% highlight python %}

from flask import request
from werkzeug import secure_filename

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['the_file']
        f.save('/var/www/uploads/' + secure_filename(f.filename))
    ...

{% endhighlight %}

[这里][upload]有更详细的文件上传的介绍。

## Cookies

要访问 cookies ，可以使用 [cookies][] 属性。可以使用请求对象 的 [`set_cookie`][setcookie]方法来设置 cookies。
请求对象的 cookies 属性是一个包含了客户端传输的所有 cookies 的字典。 
在 Flask 中，如果能够使用 会话（session） ，那么就不要直接使用 cookies，因为会话比较安全一些。

读取 cookies:

{% highlight python %}

from flask import request

@app.route('/')
def index():
    username = request.cookies.get('username')
    # 使用 cookies.get(key) 来代替 cookies[key] ，
    # 以避免当 cookie 不存在时引发 KeyError 。

{% endhighlight %}

储存 cookies:

{% highlight python %}

from flask import make_response

@app.route('/')
def index():
    resp = make_response(render_template(...))
    resp.set_cookie('username', 'the username')
    return resp

{% endhighlight %}

注意， cookies 设置在响应对象上。通常只是从视图函数返回字符串， Flask 会把它们转换为响应对象。
如果你想显式地转换，那么可以使用 `make_response()` 函数获得一个响应对象，然后再修改它。

## 重定向和错误

使用 `redirect()` 函数可以重定向。使用 `abort()` 可以更早退出请求，并返回错误代码:

{% highlight python %}

from flask import abort, redirect, url_for

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    abort(401)
    this_is_never_executed()

{% endhighlight %}

上例实际上是没有意义的，它让一个用户从索引页重定向到一个无法访问的页面（401 表示禁止访问）。
但是上例可以说明重定向和出错跳出是如何工作的。

缺省情况下每种出错代码都会对应显示一个黑白的出错页面。使用 `errorhandler()` 装饰器可以定制出错页面:

{% highlight python %}

from flask import render_template

@app.errorhandler(404)
def page_not_found(error):
    return render_template('page_not_found.html'), 404

{% endhighlight %}

注意 `render_template()` 后面的 404，这表示页面对就的出错代码是 404 ，即页面不存在。缺省情况下 200 表示一切正常。

## 关于响应

视图函数的返回值会自动转换为一个响应对象。如果返回值是一个字符串，那么会被转换为一个包含作为响应体的字符串、一个 `200 OK` 状态码和一个 `text/html MIME` 类型的响应对象。
以下是转换的规则：

1. 如果视图要返回的是一个响应对象，那么就直接返回它。
2. 如果要返回的是一个字符串，那么根据这个字符串和缺省参数生成一个用于返回的响应对象。
3. 如果要返回的是一个元组，那么元组中的项目可以提供额外的信息。
元组中必须至少包含一个项目，且项目应当由 (response, status, headers) 组成。
`status` 的值会重载状态代码， `headers` 是一个由额外头部值组成的列表或字典。
4. 如果以上都不是，那么 Flask 会假定返回值是一个有效的 WSGI 应用并把它转换为一个响应对象。

如果想要在视图内部掌控响应对象的结果，那么可以使用 `make_response()` 函数，它会返回一个用于响应的对象，可以对其修改：

{% highlight python %}

@app.errorhandler(404)
def not_found(error):
    resp = make_response(render_template('error.html'), 404)
    resp.headers['X-Something'] = 'A value'
    return resp

{% endhighlight %}

## 会话

除了请求对象之外还有一种称为 session 的对象，允许你在不同请求之间储存信息。
这个对象相当于用密钥签名加密的 cookie， 即用户可以查看你的 cookie ，但是如果没有密钥就无法修改它。

使用会话之前你必须设置一个密钥。举例说明:

{% highlight python %}

from flask import Flask, session, redirect, url_for, escape, request

app = Flask(__name__)

@app.route('/')
def index():
    if 'username' in session:
        return 'Logged in as %s' % escape(session['username'])
    return 'You are not logged in'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('index'))
    return '''
        <form action="" method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
    '''

@app.route('/logout')
def logout():
    # 如果会话中有用户名就删除它。
    session.pop('username', None)
    return redirect(url_for('index'))

# 设置密钥，复杂一点：
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

{% endhighlight %}

这里用到的 `escape()` 是用来转义的。如果不使用模板引擎就可以像上例一样使用这个函数来转义。

### 如何生成一个好的密钥

生成随机数的关键在于一个好的随机种子，困此一个好的密钥应当有足够的随机性。 你的操作系统可以使用一个随机生成器来生成一个好的随机种子：

{% highlight python %}

>>> import os
>>> os.urandom(24)
'\xfd{H\xe5<\x95\xf9\xe3\x96.5\xd1\x01O<!\xd5\xa2\xa0\x9fR"\xa1\xa8'

{% endhighlight %}

只要复制这个随机种子到你的代码中就行了。

## 消息闪现

一个好的应用和用户接口都有良好的反馈，否则到后来用户就会讨厌这个应用。 Flask 通过闪现系统来提供了一个易用的反馈方式。闪现系统的基本工作原理是在请求结束时 记录一个消息，提供且只提供给下一个请求使用。通常通过一个布局模板来展现闪现的 消息。

[flash()][flash] 用于闪现一个消息。在模板中，使用 `get_flashed_messages()` 来操作消息。
完整的例子参见[消息闪现][flashsample]。

## 日志

有时候可能会遇到数据出错需要纠正的情况。
例如因为用户篡改了数据或客户端代码出错而导致一个客户端代码向服务器发送了明显错误的 HTTP 请求。
多数时候在类似情况下返回 `400 Bad Request` 就没事了，但也有不会返回的时候，而代码还得继续运行下去。

这时候就需要使用日志来记录这些不正常的东西了。自从 Flask 0.3 后就已经为你配置好了一个日志工具。

以下是一些日志调用示例:

{% highlight python %}

app.logger.debug('A value for debugging')
app.logger.warning('A warning occurred (%d apples)', 42)
app.logger.error('An error occurred')

{% endhighlight %}

[logger][] 是一个标准的 Python Logger 类， 更多信息详见官方的 [logging 文档][logger] 。


[jinja2]: http://jinja.pocoo.org/2/documentation/templates
[upload]: http://dormousehole.readthedocs.io/en/latest/patterns/fileuploads.html#id2
[cookies]: http://dormousehole.readthedocs.io/en/latest/api.html#flask.Request.cookies
[setcookie]: http://dormousehole.readthedocs.io/en/latest/api.html#flask.Response.set_cookie
[flash]: http://dormousehole.readthedocs.io/en/latest/api.html#flask.flash
[flashsample]: http://dormousehole.readthedocs.io/en/latest/patterns/flashing.html#message-flashing-pattern
[logger]: http://docs.python.org/library/logging.html
[doc]: http://dormousehole.readthedocs.io/en/latest/quickstart.html#id14
