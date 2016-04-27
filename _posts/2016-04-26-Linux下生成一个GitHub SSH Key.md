---
layout: post
title:  "Linux下生成一个GitHub SSH Key"
date:   2016-04-26 14:25:41
meta_description: blog
categories:
- blog
tags:
- GitHub
---

SSH密钥 是一种不用密码就可辨认出可信赖电脑的方法。你可以通过以下步骤生成一个SSH key然后把公钥添加到你的GitHub账户中。


## 检查电脑种是否有已经存在的SSH密钥

在你创建一个SSH key之前，你可以检查下你的电脑中是否已经有SSh密钥。

1. 打开终端。
2. 输入`ls -al ~/.ssh`，看看是否有已存在的SSH密钥（如果提示.ssh文件夹不存在，直接跳到下一标题，生成一个SSH key）。
    
默认情况下，公钥的文件名是下列之一：

* id_dsa.pub
* id_ecdsa.pub
* id_ed25519.pub
* id_rsa.pub 
 
如果你的电脑中没有具有上述文件名的文件（或者你想重新生成），那么直接跳到下一标题，生成一个SSH key）。

如果你的电脑种有，那直接跳到下一个标题的下一个标题（把SSH添加到ssh-agent)。

 
## 生成一个新的SSH key

1. 打开终端。
2. 输入 `ssh-keygen -t rsa -b 4096 -C "your_email@example.com"` ，回车。注意邮箱地址写你自己的github的登陆邮箱。
3. 之后会有下面的提示，让你输入密钥保存位置，这个一般不用改，直接回车用默认就行:
    Enter a file in which to save the key (/Users/you/.ssh/id_rsa): [Press enter]
4. 再之后会提示让你输入一个安全密码，这个自便（可参考[Working with SSH key passphrases][passphrases])。
    Enter passphrase (empty for no passphrase): [Type a passphrase]


## 添加SSH key到ssh-agent

1. 输入 `eval "$(ssh-agent -s)"` 确保ssh-agent已经启用，正常情况下返回的是"Agent pid xxxxx"。
2. 添加你的SSH key到ssh-agent ： `ssh-add ~/.ssh/id_rsa`


## 添加SSH key到你的GitHub账户

1. 把你的公钥文件内容复制到系统剪贴板。你可以直接去打开文件，或者用xclip：

~~~ bash
    sudo apt-get install xclip  #安装xclip 
    xclip -sel clip < ~/.ssh/id_rsa.pub  #使用xclip将文件内容复制到剪贴板
~~~

2. 然后用浏览器打开GitHub，在右上角点击你的头像，选择`Settings`。
3. 在设置页面的左边，点击`SSH and GPG keys`。
4. 点击`New SSH key`。
5. 在`Title`中输入一个key的描述，这个只是个标识符而已，比如 Ubuntu SSH key.
6. 然后把`1`中你复制的公玥内容粘贴到`Key`处。
7. 点击`Add SSH key`。
8. 通过输入你的github密码确认上述操作是你本人。


## 测试你的SSH连接

打开终端，输入`ssh -T git@github.com`。如果返回的内容最后有：
    Hi username! You've successfully authenticated, but GitHub does not provide shell access.
否则，参考这里找到问题的答案：

* [Error: Agent admitted failure to sign][Agent admitted]
* [Error: Permission denied (publickey)][Permission denied]


注，本文参考自[Generating an SSH key][from]。


[from]: https://help.g* ithub.com/articles/generating-an-ssh-key/
[passphrases]: https://help.github.com/articles/working-with-ssh-key-passphrases/
[Agent admitted]: https://help.github.com/articles/error-agent-admitted-failure-to-sign
[Permission denied]: https://help.github.com/articles/error-permission-denied-publickey