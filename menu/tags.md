---
layout: page
title: Tags
---

<section class="post-tags">
    {% assign tags_list = site.tags %}
    
    {% if tags_list.first[0] == null %}
    {% for tag in tags_list %}
    <a class="post-tags-item" href="#{{ tag | slugify }}">{{ tag | capitalize }}</a>
    {% endfor %}
    {% else %}
    {% for tag in tags_list %}
    <a class="post-tags-item" href="#{{ tag[0] | slugify }}">{{ tag[0] | capitalize }}</a>
    {% endfor %}
    {% endif %}
    
    {% assign tags_list = nil %}

</section>

{% for tag in site.tags  %}
<h3 id="{{ tag[0] | slugify }}">{{ tag[0] | capitalize }}</h3>

<ul class="posts">
    {% assign pages_list = tag[1] %}
    {% for post in pages_list reversed %}
    {% if post.title != null %}
    {% if group == null or group == post.group %}
    <li itemscope>
    <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    <p class="post-date"><span><i class="fa fa-calendar" aria-hidden="true"></i> {{ post.date | date: "%B %-d" }} - <i class="fa fa-clock-o" aria-hidden="true"></i> {% include read-time.html %}</span></p>
    </li>
    {% endif %}
    {% endif %}
    {% endfor %}
    {% assign pages_list = nil %}
    {% assign group = nil %}
</ul>
{% endfor %}