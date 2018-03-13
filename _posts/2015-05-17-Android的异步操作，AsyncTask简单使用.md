---
layout: post
title: "Android的异步操作，AsyncTask简单使用"
date: 2015-05-17 19:33:00
subtitle: Android异步操作, AsyncTask
category: programming
tags: android asynctask
finished: true
---

AsyncTask，顾名思义，异步任务。说到异步，最简单的理解就是不同步。再复杂一点理解，就得举例子了。

假设我要去火车站买票，刚到火车站我突然发现我忘了带身份证。怎么办？怎么办！

想办法，想办法！我想我应该找个在学校的同学帮我送过来，因为我不能自己回去拿啊，还要排队呢，走不开。嗯，要找人送过来。但是问题来了，我找人送身份证了，我去排队了，如果排到第一位了身份证还没到怎么办？叮，脑袋上面突然亮了一个小灯泡，机智的我在排队前想到了两种方案：

第一种方案，让售票员等着我，我后面队伍里买票的人也等着我，我一直在窗口第一位置等着同学来送身份证，直到，我的身份证被送来，然后顺利买票。

另一种方案呢，就是我跟售票员说一下，让我在一边等着送身份证，后面的人继续买票，等我的身份证送来的时候我通知下售票员，就可以尽快排到队伍第一位（不一定是立即排到第一位，因为万一有人正在买票，我不能过去打断他）然后买票。

所以呢，选第一种还是第二种？我肯定选第二种，因为选第一种肯定会被后面排队的人骂死，而且还有可能被售票员骂，搞不好还会挨揍，毕竟因为我一个人，浪费了这么多人的时间，也拖慢了售票员的工作效率。

好了，例子就说到这里。在例子里，第二种方法就是异步的。异步往往和多线程有关，而且异步任务也大多是交由一个单独的线程完成，然后返回结果给主线程。这里售票员相当于cpu，而排队买票的人相当于等待被执行的任务，而我是个被标记为异步的任务（因为我知道我带身份证，不能立即买到票，所以排队前就想好了第二种方案），当cpu执行到我这个任务的时候，发现我这个任务可执行的条件（身份证）不具备，所以由我发起了一个异步任务（同学送票），去获取可执行的条件，之后立即把位置让出来，让其他排队的任务继续执行。直到我的身份证拿来，然后立马通知cpu准备接待我。

嗯，差不多就是这样了。开始说正文，android里面的[AsyncTask][]。先上一段官网的引用：

>AsyncTask enables proper and easy use of the UI thread. This class allows to perform background operations and publish results on the UI thread without having to manipulate threads and/or handlers.

是英语，虽然我能懂大概是什么意思，但是还是不翻译了，怕误人子弟，等我英语学的再好些再来翻译吧。不过还是要解释下大概的意思，就是说AsyncTask可以在UI线程上做一些后台操作，也能返回操作结果到UI线程上。我们知道UI线程是不能做一些耗时的操作的，但是有了AsyncTask，我们可以这样做了。但是，

>AsyncTask is designed to be a helper class around Thread and Handler and does not constitute a generic threading framework. AsyncTasks should ideally be used for short operations (a few seconds at the most.) If you need to keep threads running for long periods of time, it is highly recommended you use the various APIs provided by the java.util.concurrent package such as Executor, ThreadPoolExecutor and FutureTask.

对于耗时比较久的任务，还是不建议放在AsyncTask中执行。AysncTask被设计成Thread和Handler的辅助类，并不能执行过于复杂和耗时的任务，这种任务应该用其他方法这里就不说了。AsyncTask最好用于耗时最多只有几秒钟的操作，比如向网络请求个xml或是json之类的网络操作，或是用在程序的初始化界面等等。

下面说下AsyncTask的使用。其实很简单。

首先你需要定义一个AsyncTask的子类，并且必须重写父类的`doInBackground(Params...)`方法。另外还有`onPostExecute(Result)`方法也可重写，这个方法在`doInBackground`之后被自动调用，所以你可以在这里写一些任务完成的通知代码。

先给一个官方的例子：

```java
private class DownloadFilesTask extends AsyncTask<URL, Integer, Long> {
    protected Long doInBackground(URL... urls) {
        int count = urls.length;
        long totalSize = 0;
        for (int i = 0; i < count; i++) {
            totalSize += Downloader.downloadFile(urls[i]);
            publishProgress((int) ((i / (float) count) * 100));
            // Escape early if cancel() is called
            if (isCancelled()) break;
        }
        return totalSize;
    }

    protected void onProgressUpdate(Integer... progress) {
        setProgressPercent(progress[0]);
    }

    protected void onPostExecute(Long result) {
        showDialog("Downloaded " + result + " bytes");
    }
 }
```

执行AsyncTask的时候，必须在UI线程中执行，如下语句。

```java
new DownloadFilesTask().execute(url1, url2, url3);
```
 
可以看到，在继承AsyncTask的时候，有几个泛型类型，如`AsyncTask<URL, Integer, Long>`，简单解释下。

1. 第一个可以指定输入参数的类型,就是`new DownloadFilesTask().execute()`的参数（最后传到了`doInBackground`），这里的参数可以不只一个，因为最后到方法里面，收到的是个数组。
2. 第二个可指定发送进度更新需要的类型，一般都是整型，用在`publishProgress`（用来在后台进程中发送进度的方法，直接使用的，不用定义）和`onProgressUpdate`两个方法中。
3. 第三个是AsyncTask返回结果的数据类型，它设置了`doInBackground`的返回类型，以及`onPostExecute`的输入参数类型

当然，如果你什么都不需要，可以都使用`Void`。

```java
private class MyTask extends AsyncTask<Void, Void, Void> { ... }
```
 
另外，还有一个可以重写的方法，是`onPreExecute()`，它在`doInBackground`之前被调用，所以如果需要的话，你可以重写它然后做一些实例化进度条啊之类的工作。


最后，总结一下：

使用AsyncTask，你要做的是，继承父类，然后重写`doInBackground(Params...)`，在里面实现后台操作，如果有返回结果的话，重写`onPostExecute(Result)`然后处理后台程序的结果。

如果需要更新进度的话，在`onPreExecute()`里实例化进度条（也可以不在这），之后在`doInBackground(Params...)`里面用`publishProgress()`发布进度值，然后重写`onProgressUpdate(Progress...)`接收`onPreExecute()`发布的结果，并添加更新进度条的代码。


[AsyncTask]: http://developer.android.com/reference/android/os/AsyncTask.html