---
layout: page
title: Category
---

{% for category in site.categories %}
{% capture cat %}{{ category | first }}{% endcapture %}

<h3>{{ cat | capitalize }}</h3>
<ul class="posts">
{% for post in site.categories[cat] %}
  <li itemscope>
    <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    <p class="post-date"><span><i class="fa fa-calendar" aria-hidden="true"></i> {{ post.date | date: "%B %-d" }} - <i class="fa fa-clock-o" aria-hidden="true"></i> {% include read-time.html %}</span></p>
  </li>
{% endfor %}
</ul>

{% endfor %}
