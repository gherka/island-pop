//DEFINE MARGINS AND SVG CONTAINER

var margin = {top: 55, right: 50, bottom: 20, left: 50};

var width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svgContainer = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //.attr("viewBox", "0.5 0.5 1200 500");

//CREATE A TITLE//

svgContainer.append("text")
  .text("Population forecasts for South Uist")
  .attr("id",'chartTitle')
  .attr("x", width/2)             
  .attr("y", margin.top/2.5)
  .attr('transform', `translate(${margin.top})`)
  .attr("text-anchor", "middle");

//HELPER FUNCTIONS AND OTHER RE-USABLE STUFF

var parseTime = d3.timeParse("%d/%m/%Y");
var t = d3.transition()
    .duration(2000)
    .ease(d3.easeLinear);

//LOAD DATA//

var f = "data/sim100_15_04.csv"

d3.csv(f).then(function(data) {
    
    //DO EVERYTHING THAT DOESN'T DEPEND ON GROUPED DATA

    //clean all of the data (it comes in as strings)
    data.forEach(function(d) {
        d.Population = +d.Population;
        d.Year = parseTime(d.Year);
        });
        
    //Scales and Axes first so that Scale function can be reused;
    var xScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(data, function(d) { return d.Year; }));
    
    var xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.timeFormat("%Y"));
    
    var yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return d.Population; })]);
    
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
      .x(function(d) {return Math.round(xScale(d.Year));})
      .y(function(d) {return Math.round(yScale(d.Population));})
      //.curve(d3.curveCatmullRom.alpha(0));
    
   //            LAST STEP: NEST THE DATA                  //
   //split it into arrays based on Column (category) values//
    var dataGroup = d3.nest()
    .key(function(d) { return d.SIM; })
    .entries(data);
    
    var test_arr = ['1'];
    
    var dg = dataGroup.filter(function(d) { return test_arr.indexOf(`${d.key}`) != -1 })
   
   dg.forEach(function(d,i) {
       
    //create(append) a new line (path) for every group in the nest
    svgContainer.append('path')
      .attr('d', line_path(d.values))
      .attr("class", "line")
      .attr('id', 'line_' + i)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr("shape-rendering", "geometricPrecision");
       
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
        
        d3.selectAll('.line').remove();
        
        var t = d3.transition()
        .duration(2000)
        .ease(d3.easeLinear);
        
        var sims = v.value
        
        var arr = []
        while(arr.length < sims){
        var randomnumber = Math.floor(Math.random()*100) + 1;
        if(arr.indexOf(randomnumber) > -1) continue;
        arr[arr.length] = String(randomnumber);
        }
        
        var dg = dataGroup.filter(function(d) { return arr.indexOf(`${d.key}`) != -1 })
   
        dg.forEach(function(d, i) {
       
    //create(append) a new line (path) for every group in the nest
    svgContainer.append('path')
      .attr('d', line_path(d.values))
      .attr("class", "line")
      .attr('id', 'line_' + i)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "2")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr("shape-rendering", "geometricPrecision")
       
      path = d3.select('#line_'+i)
      //length of the path will be different for each simulation
      var totalLength = path.node().getTotalLength()
      
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition(t)
        .attr("stroke-dashoffset", 0);
       
      });
        
        ;}, false);
    
    });