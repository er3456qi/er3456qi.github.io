---
layout: default
permalink: /archive/
---
<div class="card">
  <h1>{{ site.str_blog_archive }}</h1>  
  {% for post in site.posts %}
  	{% capture currentyear %}{{post.date | date: "%Y"}}{% endcapture %}
  	{% if currentyear != year %}
    	{% unless forloop.first %}</ul></div>{% endunless %}
    		<div style="padding:0px 0px 16px 0px"><h5>{{ currentyear }}</h5>
    		<ul>
    		{% capture year %}{{currentyear}}{% endcapture %} 
  		{% endif %}
    <li><a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a></li>
{% endfor %}
</div>