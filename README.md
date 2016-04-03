Html Timeline
========================

**[Demo]**

Html Timeline is a very simple jQuery plugin. The event is automatically placed on the timeline.

![Timeline](http://htmltimeline.azurewebsites.net/)

## Getting Started

Include Css, html and script jQuery, moment, plugin on a page. This is all.

**CSS**

```html
<link rel="stylesheet" media="screen" href="css/HtmlTimeline.css">
```

**HTML**

```html
<ol id="timeline">
    <li>
        <time datetime="1991-10-01">July 1995</time>
        <p>Naissance</p>
        <div class="description">
            <p>Description...</p>
        </div>
    </li>
    <li>
        <time datetime="1994-10">September 1999</time>
        <p>First day of school!</p>
    </li>
</ol>
```
Format date is YYYY-MM-DD. Dates in the B.C. era don't work.

**jQuery**

```html
<script src="jquery.js"></script>
<script src="moment.min.js"></script>
<script src="jquery.HtmlTimeline.js"></script>
<script>
    $(function() {
        $('#timeline').HtmlTimeline({
            'height' : 600
        });
    });
</script>
```
You must adjust manually the height of timeline with the height parameter.

Design by and css inspired [@csswizardry HTML/CSS timeline]

[Demo]: http://www.b1nj.fr/tests/b1njTimeline/
[@csswizardry HTML/CSS timeline]: http://csswizardry.com/2011/03/coding-up-a-semantic-lean-timeline/

