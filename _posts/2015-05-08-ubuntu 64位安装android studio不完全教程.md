---
layout: post
title:  "ubuntu x64 安装 android studio 不完全教程"
date:   2015-05-08 18:33:00
meta_description: ubuntu x64 安装 android studio
categories:
- blog
tags:
- android
---

先说下，Ubuntu 上安装[Android Studio][]真是一路坑阿，一路坑阿，加上天  朝 防火墙挡着，折腾了快一天才弄好阿

找了n多教程，不是抄的就是转的，而且都没说清楚具体咋装阿，一个图一个图截的挺爽的，可是不实用阿，我不再废话了，说正经的

首先装java，看准你的ubuntu是64位还是32位，找相应版本下，然后安装就好。我装的是这个jdk1.8.0-25_1.8.025-1_amd64.deb，现在应该有新版了，直接去oracle网上下载就行，没什么好说的，不过有可能会遇到一个不能运行的main clas异常，这个可能是在你的安装包里有没完全解压的jar包，这样的话，在java的安装目录，在lib和jre/lib里，有一些××.pack的包，比如tools.pack，这时候你需要一条命令把pack转成jar吧，这个命令的执行程序在上一级目录的bin里面，是unpack200.jar，所以你可以在有pack的目录下，敲这么一条命令 `../bin/unpack200 tools.pack tools.jar`,这样就转换了

装好java后，要配置环境变量！！！ubuntu上有好几种方法设置环境变量，比如修改/etc/environment， 修改/etc/profile，修改home目录下的 .bashrc或是  .profile，都可以。我不说怎么改阿，忘记了，不会的话去搜吧。注意修改前先备份一下要修改的文件，万一弄错了，还能恢复。

java准备好以后，开始进入正题了：

#android studio

首先下载android studio，能FQ的就FQ去官网下，不能FQ的就在墙内找，也不难找。版本应该至少1以上，以后打开有更新的话可以更新。

下载解压完就能用了，不用安装。所以你可以解压到home根目录。

下面要到坑区了...

#android sdk

首先是android sdk，如果你网不快，并且只想安装某几个版本的sdk的话看下面，否则就跳过这一节（直接看分割线以后）：

我网不快，我只想装个4.4然后再装个最新的就好，所以我决定自己下载sdk。首先下载android-sdk_r24-linux.tgz，当然版本可能不一样，这是目前最新。这个下完后，解压就能用，你可以把解压后的文件夹和android studio放一起。

解压后文件名是android-sdk_r24-linux.tgz，下面是命令行：

{% highlight bash %}

cd android-sdk_r24-linux.tgz
cd tools
.android

{% endhighlight %}

这样就打开了android sdk manager，它会自动更新列表，如果你没架梯子的话，肯定超慢然后超时，更新失败。所以这里要设置下，点击标题栏，tools-->options，设置个国内的镜像源，我这里用的是中科院的，看图，镜像地址网上有很多，可以搜下android国内镜像。不过国内的镜像我就用成功过一次！！！现在是无法更新的状态...应该是程序原因，因为sdk manager不认我给设置的镜像链接。

![android_studio_img_1](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_1.png)

设置好之后，点击标题栏packages->reload。你以为这样就行了吗？too simple！反正我当时弄得时候还不行，即使换了镜像地址，这货还是会先找google，尝试多次后才会找这个地址，不过也不一定成功，所以多试几次，只要更新出来列表就好，没梯子的话，千万别这样下载sdk。

更新出来列表后是这样（我已经装好了，所以肯定和你的不一样）：

![android_studio_img_2](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_2.png)

![android_studio_img_3](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_3.png)

更新出来列表后，你要自己下载这些sdk包，怎么下载呢，前面我们找了一个镜像地址，比如这里的http://mirrors.opencas.org，直接浏览器打开，进入android，进入repository，之后，就可以下载了，不用全下载，你可以对照着我上面的图里installed的下载。tools目录下和extra目录下的是一定要安装的，但是中间android4.4 adnroid5.1这个就是可选的了，你想下那个版本就下哪个（其实只下SDK platform就可以，sample是一些程序例子，需要就下不需要就不下）。

这样，差不多就准备好sdk了。

下面去android studio目录，进入bin，然后运行studio.sh: `./studio.sh`

不出意外就可以运行了

这里会有些设置，但是我之前没截图（那时候根本就没打算发教程其实 = =），就直接说文字了。刚打开会有fetching android sdk component information，这个要等！如果等了很久还不行的话才去搜fetching android sdk component information卡死了怎么办....

我先说fetching android sdk component information自动完成的情况，自动完成后，会有初始化设置啥的，我没截图，而且是昨天的事，有点忘了，大概会有让你选择安装方式，这里不要选standard，选下面那个，好像是custom，然后后面会有让你选择安装什么，有个sdk啥的是可以取消的，还有个2.5G的不能取消，这里重点来了！！！如果你没有按照分割线前面那样自己下载sdk，这里你就继续下一步还是啥的让它自己下载吧，应该会比较久。如果你自己下载了sdk，直接左上角把这个窗口关掉吧，关掉后来这里,忽略左边的项目，到了这里，如果你的版本不是最新的话，可以选择下面的更新，当然也可以以后再说。之后呢，选择configure

![android_studio_img_4](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_4.png)

之后project defaults：

![android_studio_img_5](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_5.png)

之后progect structure:

![android_studio_img_6](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_6.png)

之后到了这里：

![android_studio_img_7](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_7.png)

这里要选择你的，注意是你的，不是上面的我的，你的androidsdk目录，java目录不用你设置。选择好之后，就可以关掉，后退后退去这里创建新项目了（前面fetching android sdk component information有问题的，解决后大概也是这样）：

![android_studio_img_8](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_8.png)

后面可能还要下东西，我不记得了，如果下就下吧，没关系，在墙内的。好像是gradle，这个你不用自己单独下载，别的教程都推荐自己下载，其实不用的，会自动下载。

之后就打开了：

![android_studio_img_9](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_9.png)

和你那个布局可能不一样，没关系，自己设置就好。

现在我们可以进android studio的编辑器了。感觉不错。挺好的，先不说genymotion，先看看你的android项目有没有r文件，项目有没有错误？

![android_studio_img_10](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_10.png)

如果没有问题的话，下面这一节就可以跳过了，我下面说没有R文件，或是目录文件夹一路飘红线的情况。这是一个大坑，我最后差点放弃安装阿，真是。

首先说下我们现在是以ubuntu 64位为基础！！注意这里说的是64位，如果不是64位的话，也可以跳过这一节了。

如果你有上面说的问题的话，那你进入androidsdk文件目录后，在platform文件夹里，运行adb会提示没有文件或是目录，这里的情况是64位ubuntu不能直接运行32位的程序！而adb是32位的！所以这里要安装一些64位系统运行32位程序的依赖：

{% highlight bash %}

sudo apt-get install lib32z1 lib32ncurses5 lib32bz2-1.0
sudo apt-get install lib32stdc++6

{% endhighlight %}

这样差不多就可以了。你可以很新建个工程看看。如果还有问题的话，可能和你的java有关系，关于java的问题，前面我们说了，如果java的问题严重，可能连android studio都无法打开。

#genymotion

下面开始说genymotion了！！！这个没啥坑，去官网下载，下载要注册，ubuntu下要自己下载 virtual box，下好后直接安装，安装完后再安装genymotion，genymotion.bin的安装过程其实就是解压而已，你也可以把解压后的文件夹跟android studio放到一起。启动genymotion也是要命令行里运行，在genymotion里面有一个可运行的genymotion文件，运行它就可以，然后你要自己创建一个虚拟机，就是要自己选择一个rom，不到200M，直接点下载就好，不用配置。还有虚拟机的分辨率是可以改的，默认的分辨率很高，在电脑上看着不太和谐，建议最好改一下。具体过程不会的话可以搜一下，我就不截图了。

创建完之后，要改一下设置，在ADB里面，要把sdk位置设为自己的：

![android_studio_img_11](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_11.png)

ok,设置完了，下面去android studio里面装插件:

>1. In Android Studio, go to File > Settings.
>2. Select Plugins and click Browse Repositories.
>3. Right-click on Genymotion and click Download and install.

这是genymotion官网的方法，但是后来我发现这样下载的文件不是最新的！！！！官网上在这个介绍下面还有一个jar包的链接，这个是最新的，所以可以下载这个最新的，然后在第二步那里手动安装（下面三个按钮最后那个install plugin from disk）：

![android_studio_img_12](http://7xj0rk.com1.z0.glb.clouddn.com/android_studio_12.png)

装完后重启android studio，上面会有个genymotion的图标，你要点一下它，设置好genymotion的安装路径。运行的时候先启动genymotion的虚拟机，然后点绿色箭头图标就可以了，差不多就这样了。


[Android Studio]: http://en.wikipedia.org/wiki/Android_Studio