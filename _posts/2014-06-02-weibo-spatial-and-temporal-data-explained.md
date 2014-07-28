---
layout: post
title: "Weido spatial and temporal data explained"
author: Laetitia
image_big: /assets/weibo-spatial-and-temporal-data/big.png
image_small: /assets/weibo-spatial-and-temporal-data/square.png
image_alt: Weibo data over the map of Shanghai
code_content: true
comments: true
keywords:
description:
categories:
---

The following post goes along with the article [Weibo spatial and temporal data](/studies/). The visualization was built on two JavaScript libraries: [D3.js](http://d3js.org) for the bar chart and [Mapbox.js](http://mapbox.com) for the map. The purpose of this tutorial is to explain the technical side and hence give a practical example around these two libraries. It assumes you know a little about web development though: how to edit a web page and view it in your browser, how to include JavaScript on the page and the like.

##The data

For the [Digital Eternity Project](/projects/), we queried the Weibo API with a Python script using a tessellation of Shanghai made with 4 km diameter cells centered on 85 locations. Thus, we collected about 245,000 messages created between April 1 and April 9. These messages were stored into a SQLite database. Then, another Python script was in charge of counting the messages. The result is a JavaScript dictionary (or associative array) associating the number of messages at the 24 hours of the day to each of the 85 GPS coordinates:

{% highlight javascript %}
var weibo = {
  '31.254200, 121.532400': [88, 37, 19, 12, 9, 11, 35, 47, 80, 103, 74, 71, 73, 87, 70, 54, 80, 71, 101, 117, 152, 168, 180, 141],
  …
  '31.308200, 121.511400': [261, 96, 47, 36, 12, 23, 76, 114, 150, 226, 196, 255, 251, 263, 294, 224, 303, 311, 332, 350, 338, 325, 303, 345]
};
{% endhighlight %}
	
So, for example, the number of messages created in the cell centered in (31.254200, 121.532400) between 3 and 4 am is given by <code class="highlight"><span class="nx">weibo</span><span class="p">\[</span><span class="s1">'31.254200, 121.532400'</span><span class="p">\]</span><span class="p">\[</span><span class="mi">3</span><span class="p">\]</span></code>.

This variable is stored in the external file weibo.js.

##The code

The full code for the visualization can be found on [GitHub](https://github.com/ComplexCity/weibo-qingmingjie) but globally it looks like:

{% highlight html %}
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Weibo messages during QingMing Jie</title>
  
  <!-- prepare and load everything for Mapbox -->
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <script src="https://api.tiles.mapbox.com/mapbox.js/v1.6.3/mapbox.js"></script>
  <link href="https://api.tiles.mapbox.com/mapbox.js/v1.6.3/mapbox.css" rel="stylesheet" />

  <!-- the style -->
  <style>
  div#barchart {}
  /* ... some CSS ... */
  </style>
</head>
<body>

<div id="content">
  <div id="map"></div>
  <div id="barchart">
    <div id="tip" style='display:none'></div>
  </div>
</div>

<!-- load the data -->
<script src="weibo.js"></script>

<!-- load the d3.js library -->
<script src="http://d3js.org/d3.v3.min.js"></script>

<!-- the script -->
  <script>
/* ... some JavaScript ... */
  </script>
</body>
</html>
{% endhighlight %}

##The bar chart explained

The [D3](http://d3js.org) SVG ([Scalable Vector Graphics](http://www.w3.org/Graphics/SVG/)) bar chart is made of a *g* element for the y axis, a *g* element for the bars and a *text* element for the title. The *g* element of the bars contains itself 24 *g* elements. Each of them contains a *rect* for the actual bar and a *text* for the hour in the x axis.

<svg width="400" height="190">
	<g transform="translate(1,1)" width="50" height="100">
		<rect x="0" y="0" width="50" height="106" style="fill:white; stroke:#3182bd; stroke-width:1px;"></rect>
		<text x="7" y="50" style="fill:#3182bd;">y axis</text>
	</g>
	<g transform="translate(54,1)" width="345" height="141">
		<rect x="0" y="0" width="345" height="141" style="fill:white; stroke:#3182bd; stroke-width:1px;"></rect>
		<g transform="translate(3,3)" width="46" height="135">
			<rect x="0" y="0" width="46" height="135" style="fill:white; stroke:#3182bd; stroke-width:1px;"></rect>
			<rect x="3" y="3" width="40" height="99" style="fill:white; stroke:red; stroke-width:1px;"></rect>
			<text x="11" y="50" style="fill:red;">bar</text>
			<rect x="3" y="105" width="40" height="27" style="fill:white; stroke:orange; stroke-width:1px;"></rect>
			<text x="6" y="123" style="fill:orange;">x axis</text>
		</g>
		<text x="60" y="80" style="fill:#ccc;">x 24</text>
	</g>
	<g transform="translate(54,145)" width="345" height="45">
		<rect x="0" y="0" width="345" height="40" style="fill:white; stroke:orange; stroke-width:1px;"></rect>
		<text x="150" y="20" style="fill:orange;">title</text>
	</g>
</svg>

Let's focus now on the JavaScript part.

First, we define some constants for the colors and sizes.

{% highlight javascript %}
var barColorOut = '#4c5b68',
  barColorOn = '#a7b7b6',
  legendColor = '#404040';

var barWidth = 20,
  barsWidth = 24 * barWidth,
  yAxisWidth = 55,
  chartWidth = yAxisWidth + barsWidth;
  
var barMaxHeight = 100,
  xAxisHeight = 15,
  chartTitleHeight = 45,
  chartHeight = barMaxHeight + xAxisHeight + chartTitleHeight;
{% endhighlight %}

Before we create the chart, we prepare the data we are going to use. We need to count the total number of messages for each hour of the day. To do so, we make a loop over the <code class="highlight"><span class="nx">weibo</span></code> variable to sum the number of every location for each hour. The results are stored in an array called <code class="highlight"><span class="nx">nbMsgByHour</span></code>.

{% highlight javascript %}
var nbMsgsByHour = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
for (var coord in weibo) {
  for (var j=0; j < 24; j++) {
    nbMsgsByHour[j] += weibo[coord][j];
  }
}
{% endhighlight %}

We find the maximum value so that we can define the function to scale the values to the appropriate bar heights.

{% highlight javascript %}
var countMax = nbMsgsByHour[0];
for (var i=1; i < 24; i++) {
  if (nbMsgsByHour[i] > countMax) {
    countMax = nbMsgsByHour[i];
  }
}
var barHeight = d3.scale.linear()
  .domain([0, countMax])
  .range([0, barMaxHeight]);
{% endhighlight %}

Now we can create the bar chart. The following block of code selects the <code class="highlight"><span class='nt'>div</span><span class='nf'>#barchart</span></code> on the page and appends an svg object to it of the size that we have set up.

{% highlight javascript %}
var chart = d3.select('div#barchart').append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight);
{% endhighlight %}

First, we create the y Axis. It uses almost the same scale function as the bars except that in the axis the values are oriented from top to bottom by default so we reverse the order for range. This axis is going to be oriented to the left with 5 ticks on it. As already told, the y axis is appended to the chart within a *g* element.

{% highlight javascript %}
var yAxis = d3.svg.axis()
  .scale(d3.scale.linear()
    .domain([0, countMax])
    .range([barMaxHeight, 0]))
  .orient('left')
  .ticks(5);

chart.append('g')
  .attr('class', 'y axis')
  .attr('width', yAxisWidth)
  .attr('transform', "translate(45, 0)")
  .call(yAxis);
{% endhighlight %}

For the bars, we append a new *g* element to the chart on the right of the y axis.

{% highlight javascript %}
var bars = chart.append('g')
  .attr('width', barsWidth)
  .attr('transform', "translate(" + yAxisWidth + ", 0)");
{% endhighlight %}

And we add the bars to this element:

{% highlight javascript %}
var gEnter = bars.selectAll('g')
  .data(nbMsgsByHour)
  .enter().append('g')
  .attr('transform', function(d,i){ return "translate(" + i * barWidth + ", 0)"; })
  .attr('width', barWidth)
  .attr('height', barMaxHeight + xAxisHeight);
{% endhighlight %}

This block of code creates the bars and associates each of them with a data set ( <code class="highlight"><span class='p'>.</span><span class='nx'>data</span><span class='p'>(</span><span class='nx'>nbMsgsByHour</span><span class='p'>)</span></code> ). For each value in <code class="highlight"><span class='nx'>nbMsgsByHour</span></code>, a *g* element is to be created. Note that the position of each *g* is determined by a function so that its x position can depend on the index of the value in <code class="highlight"><span class='nx'>nbMsgsByHour</span></code>. The <code class="highlight"><span class='nx'>i</span></code> parameter of this function stands for the index in <code class="highlight"><span class='nx'>nbMsgsByHour</span></code> and the <code class="highlight"><span class='nx'>d</span></code> parameter stands for the value (that is to say <code class="highlight"><span class='nx'>nbMsgsByHour</span><span class='p'>\[</span><span class='nx'>i</span><span class='p'>\]</span></code>).

As previously said, each of these 24 *g* element in turn contains a *rect* and a *text*. So we add a *rect* and a *text* to these *g*.

{% highlight javascript %}
gEnter.append('rect')
  .attr('x', 0)
  .attr('y', function(d){ return barMaxHeight - barHeight(d); })
  .attr('width', barWidth)
  .attr('height', function(d){ return barHeight(d); })
  .style('fill', barColorOut)
  .style('stroke', 'white')
  .style('stroke-width', 1);

gEnter.append('text')
  .attr('x', 0)
  .attr('y', barMaxHeight + xAxisHeight)
  .attr('width', barWidth)
  .attr('height', xAxisHeight)
  .style('fill', legendColor)
  .style('font-size', '10px')
  .text(function(d,i){ return i; });
{% endhighlight %}

Note that the height (and the position) of the bar relies on the call of our <code class="highlight"><span class="nx">barHeight</span></code> function with each value. The hour in the x axis is simply the index of the value.

Lastly we have to add a title to our chart:

{% highlight javascript %}
chart.append('text')
  .attr('x', yAxisWidth)
  .attr('y', chartHeight - 13)
  .attr('width', barsWidth)
  .style('fill', legendColor)
  .style('font-size', '13px')
  .style('font-weight', 'bold')
  .style('text-align', 'center')
  .text("Number of messages by hour of the day");
{% endhighlight %}

We are also want a tooltip to show up when one mouses over a bar to display the actual value. To do so, we are going to use the <code class="highlight"><span class='nt'>div</span><span class='nf'>#tip</span></code> of our HTML code and add two functions to show and hide the tooltip.

{% highlight javascript %}
function showTip(count, top, left) {
  d3.select('#tip')
    .text(count)
    .style('top', top + "px")
    .style('left', left + "px")
    .style('display', 'block');
}

function hideTip() {
  d3.select('#tip')
    .text("")
    .style('display', 'none');
}
{% endhighlight %}

We change the code for the bar *rect* to handle the *mouseover* and *mouseout* events. To help the user know which bar is emphasized, we also change the color of the bar.

{% highlight javascript %}
gEnter.append('rect')
  .attr('x', 0)
  .attr('y', function(d){ return barMaxHeight - barHeight(d); })
  .attr('width', barWidth)
  .attr('height', function(d){ return barHeight(d); })
  .style('fill', barColorOut)
  .style('stroke', 'white')
  .style('stroke-width', 1)
  .on('mouseover', function(d,i) {	// <<-
    d3.select(this).transition()
      .duration(100)
      .style('fill', barColorOn);
    showTip(d, (barMaxHeight - barHeight(d) - 30), (yAxisWidth + i * barWidth - 13));
  })
  .on('mouseout', function(d,i){	// <<-
    d3.select(this).transition()
      .duration(500)
      .style('fill', barColorOut);
    hideTip();
  });
{% endhighlight %}

And check the resulting bar chart in [Weibo spatial and temporal data](/studies/)!

##The map explained

First, we need to initialize the [Mapbox](http://mapbox.com) map into the <code class="highlight"><span class='nt'>div</span><span class='nf'>#map</span></code> element (change <code class="highlight"><span class="s1">'USER.MAP'</span></code> to your own map reference). The map is centered on Shanghai coordinates with a zoom of 11.

{% highlight javascript %}
var map = L.mapbox.map('map', 'USER.MAP')
  .setView([31.2542, 121.4904], 11);
{% endhighlight %}

Now that we have a map on the web page, let's customize it with some data. Just as for the bar chart, we need to prepare the data. The next block of code stores into a <code class="highlight"><span class="nx">circles</span></code> array the list of circles to be displayed on the map for each hour. And at the end ( <code class="highlight"><span class="nx">circles</span><span class="p">\[</span><span class="mi">24</span><span class="p">\]</span></code> ), another list of circles represents the total number of messages by location regardless of the time of the day. To get these numbers, we simply sum the numbers of messages of every hours for each location.

Each circle is a [L.Circle](https://www.mapbox.com/mapbox.js/api/v1.6.3/l-circle/) object centered on one of our 85 locations with a radius of 2000 m. The color used to fill each circle depends on the number of messages. Therefore, we use a function to determine the color depending of the given value. Actually, we are going to make two functions to implement different scales for the number of messages by hour or in total: getColor will serve for the hourly values and getGlobalColor for the total values.

{% highlight javascript %}
var colors = ['#f0f9e9', '#ccecc7', '#a8deb7', '#7ecdc4', '#4aa2c8', '#1d67a9'];

function getGlobalColor(value) {
  if (value <= 800) {
    return colors[0];
  } else if (value <= 1600) {
    return colors[1];
  } else if (value <= 4500) {
    return colors[2];
  } else if (value <= 6400) {
    return colors[3];
  } else if (value <= 9600) {
    return colors[4];
  }
  return colors[5];
}

function getColor(value) {
  if (value <= 70) {
    return colors[0];
  } else if (value <= 140) {
    return colors[1];
  } else if (value <= 250) {
    return colors[2];
  } else if (value <= 400) {
    return colors[3];
  } else if (value <= 600) {
    return colors[4];
  }
  return colors[5];
}

var circles = [[], [], [], [], [], [], [], [], [], [],
 [], [], [], [], [], [], [], [], [], [],
 [], [], [], [], []];

for (var coord in weibo) {
  latlng = coord.split(", ");
  latlng[0] = parseFloat(latlng[0]);
  latlng[1] = parseFloat(latlng[1]);
  var count = 0;
  for (var i=0; i < 24; i++) {
    count += weibo[coord][i];
    var circle_options = {
      stroke: false,
      fillColor: getColor(weibo[coord][i]),
      fillOpacity: 0.5
    };
    circles[i].push(L.circle([latlng[0], latlng[1]], 2000, circle_options));
  }
  var circle_options = {
    stroke: false,
    fillColor: getGlobalColor(count),
    fillOpacity: 0.6
  };
  circles[24].push(L.circle([latlng[0], latlng[1]], 2000, circle_options));
}
{% endhighlight %}

Then, we need to be able to add (and remove) circles to (from) the map. The purpose of the following functions is to add or remove all the circles for a given hour, that is to say the list of circles at <code class="highlight"><span class="nx">circles</span><span class="p">\[</span><span class="nx">i</span><span class="p">\]</span></code>.

{% highlight javascript %}
function addLayer(i) {
  for (var j=0; j < circles[i].length; j++) {
    circles[i][j].addTo(map);
  }
  currentLayer = i;
}

function removeLayer(i) {
  for (var j=0; j < circles[i].length; j++) {
    map.removeLayer(circles[i][j]);
  }
}
{% endhighlight %}

By default, we want the map to show the total number of messages for each location.

{% highlight javascript %}
addLayer(24);
var currentLayer = 0;
{% endhighlight %}

The variable <code class="highlight"><span class="nx">currentLayer</span></code> is going to help us keep track of the index of the list of circles currently displayed.

Now, we simply have to to modify the handlers of the *mouseover* and *mouseout* events in the bar chart to display the proper list of circles. When the mouse passes over a bar we want to remove the list of circles currently displayed ( <code class="highlight"><span class="nx">removeLayer</span><span class="p">(</span><span class="nx">currentLayer</span><span class="p">)</span></code> ) and to show the list of circles corresponding to the selected hour ( <code class="highlight"><span class="nx">addLayer</span><span class="p">(</span><span class="nx">i</span><span class="p">)</span></code> ). On the contrary, when the mouse moves out of a bar, we want to display the default list of circles with the total numbers of messages.

{% highlight javascript %}
gEnter.append('rect')
  .attr('x', 0)
  .attr('y', function(d){ return barMaxHeight - barHeight(d); })
  .attr('width', barWidth)
  .attr('height', function(d){ return barHeight(d); })
  .style('fill', barColorOut)
  .style('stroke', 'white')
  .style('stroke-width', 1)
  .on('mouseover', function(d,i) {
    d3.select(this).transition()
      .duration(100)
      .style('fill', barColorOn);
    showTip(d, (barMaxHeight - barHeight(d) - 30), (yAxisWidth + i * barWidth - 13));
    removeLayer(currentLayer);	// <<-
    addLayer(i);		// <<-
  })
  .on('mouseout', function(d,i){
    d3.select(this).transition()
      .duration(500)
      .style('fill', barColorOut);
    hideTip();
    removeLayer(i);	// <<-
    addLayer(24);	// <<-
  });
{% endhighlight %}
  
Finally, we need to add a legend to the map. As we have two scales of values, we need two different legends and be able to switch between them depending on what is displayed on the map.

Each legend will consist in a *div*: <code class="highlight"><span class="nt">div</span><span class="nf">#legend</span></code> for the total values and <code class="highlight"><span class="nt">div</span><span class="nf">#layerLegend</span></code> for the hourly values. Those *div* are added in the HTML along with the map container.

{% highlight html %}
<div id="content">
  <div id="legend" style='display:none'>
    <strong class="legend-title">Number of messages</strong>
    <nav class='legend clearfix'>
      <span style='background:#f0f9e9'></span>
      <span style='background:#ccecc7'></span>
      <span style='background:#a8deb7'></span>
      <span style='background:#7ecdc4'></span>
      <span style='background:#4aa2c8'></span>
      <span style='background:#1d67a9'></span>
    </nav>
    <nav class='legend cleafix'>
      <label id="label1">≤ 800</label>
      <label id="label2">> 800</label>
      <label id="label3">> 1600</label>
      <label id="label4">> 4500</label>
      <label id="label5">> 6400</label>
      <label id="label6">> 9600</label>
    </nav>
  </div>
  <div id="layerLegend" style='display:none'>
    <strong class="legend-title">Number of messages</strong>
   <nav class='legend clearfix'>
      <span style='background:#f0f9e9'></span>
      <span style='background:#ccecc7'></span>
      <span style='background:#a8deb7'></span>
      <span style='background:#7ecdc4'></span>
      <span style='background:#4aa2c8'></span>
      <span style='background:#1d67a9'></span>
    </nav>
    <nav class='legend cleafix'>
      <label id="label1">≤ 70</label>
      <label id="label2">> 70</label>
      <label id="label3">> 140</label>
      <label id="label4">> 250</label>
      <label id="label5">> 400</label>
      <label id="label6">> 600</label>
    </nav>
  </div>
  <div id="map"></div>
  <div id="barchart">
    <div id="tip" style='display:none'></div>
  </div>
</div>
{% endhighlight %}

By default, naturally we will display the legend of <code class="highlight"><span class="nt">div</span><span class="nf">#legend</span></code>.

{% highlight javascript %}
map.legendControl.addLegend(document.getElementById('legend').innerHTML);
{% endhighlight %}

We now add two functions to switch the legends.

{% highlight javascript %}
function showLayerLegend() {
  map.legendControl.removeLegend(document.getElementById('legend').innerHTML);
  map.legendControl.addLegend(document.getElementById('layerLegend').innerHTML);
}

function hideLayerLegend() {
  map.legendControl.removeLegend(document.getElementById('layerLegend').innerHTML);
  map.legendControl.addLegend(document.getElementById('legend').innerHTML);
}
{% endhighlight %}

And we modify the handlers of the *mouseover* and *mouseout* events in the bar chart to effectively switch the legends.

{% highlight javascript %}
  .on('mouseover', function(d,i) {
    d3.select(this).transition()
      .duration(100)
      .style('fill', barColorOn);
    showTip(d, (barMaxHeight - barHeight(d) - 30), (yAxisWidth + i * barWidth - 13));
    removeLayer(currentLayer);
    addLayer(i);
    showLayerLegend();	// <<-
  })
  .on('mouseout', function(d,i){
    d3.select(this).transition()
      .duration(500)
      .style('fill', barColorOut);
    hideTip();
    removeLayer(i);
    addLayer(24);
    hideLayerLegend();	// <<-
  });
{% endhighlight %}

And we're done! Check the full code on [GitHub](https://github.com/ComplexCity/weibo-qingmingjie) and the working example in the article [Weibo spatial and temporal data](/studies/).