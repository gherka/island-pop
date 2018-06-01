//DEFINE MARGINS AND SVG CONTAINER

var margin = {top: 40, right: 50, bottom: 20, left: 50};

var width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svgContainer = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

//CREATE A TITLE//

svgContainer.append("text")
  .attr("x", width/2)             
  .attr("y", margin.top/2.5)
  .attr('transform', `translate(${margin.top})`)
  .attr("text-anchor", "middle")  
  .style("font-size", "20px")  
  .text("Population forecasts for South Uist");

//HELPER FUNCTIONS AND OTHER RE-USABLE STUFF

var parseTime = d3.timeParse("%d/%m/%Y");
var t = d3.transition()
    .duration(1500)
    .ease(d3.easeLinear);

//LOAD DATA//

var f = "data/multi_data.csv"

d3.csv(f).then(function(data) {
    
    //DO EVERYTHING THAT DOESN'T DEPEND ON GROUPED DATA
    
    //clean all of the data (it comes in as strings)
    data.forEach(function(d) {
        d.count = +d.count;
        d.date = parseTime(d.date);
        });
        
    //Scales and Axes first so that Scale function can be reused;
    var xScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(data, function(d) { return d.date; }));
    
    var xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.timeFormat("%B"));
    
    var yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return d.count; })]);
    
    var yAxis = d3.axisLeft()
      .scale(yScale);
    
    // Draw the axes using the full extent of the data; don't redraw for each group in the nest
    svgContainer.append("g")
      .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
      .call(xAxis);
    
    svgContainer.append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis);
    
   //Define coordinates for path using scaling defined earlier
   var line_path = d3.line()
      .x(function(d) {return xScale(d.date)})
      .y(function(d) {return yScale(d.count)})
    
   //            LAST STEP: NEST THE DATA                  //
   //split it into arrays based on Column (category) values//
    var dataGroup = d3.nest()
    .key(function(d) { return d.category; })
    .entries(data);
   
   dataGroup.forEach(function(d, i) {
       
    //create(append) a new line (path) for every group in the nest
    svgContainer.append('path')
      .attr('d', line_path(d.values))
      .attr("class", "line")
      .attr('id', 'line_' + i)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", "1")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr("shape-rendering", "geometricPrecision")
      .attr("color-rendering", "optimizeQuality")
       
      path = d3.select('#line_'+i)
      //length of the path will be different for each simulation
      var totalLength = path.node().getTotalLength()
      
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition(t)
        .attr("stroke-dashoffset", 0);
       
      });
    

    var b = document.getElementById("inputButton");
    var v = document.getElementById("inputValue")
    
    b.addEventListener('click', function() { 
        
        //re-draw the visualisation picking up data corresponding to the random numbers from arr
        
        var lineNums = v.value
        
        var arr = []
        while(arr.length < lineNums){
        var randomnumber = Math.floor(Math.random()*100) + 1;
        if(arr.indexOf(randomnumber) > -1) continue;
        arr[arr.length] = randomnumber;
        }
        
        console.log(arr)
        
        ;}, false);
    
    });