//DEFINE MARGINS AND SVG CONTAINER

margin = {top: 55, right: 50, bottom: 20, left: 50};

width = 800 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

var svgContainer = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

//CREATE A TITLE//

svgContainer.append("text")
  .text("Population forecasts for South Uist")
  .attr("id",'chartTitle')
  .attr("x", width/2)             
  .attr("y", margin.top/2.5)
  .attr('transform', `translate(${margin.top})`)
  .attr("text-anchor", "middle");

//HELPER FUNCTIONS AND OTHER RE-USABLE STUFF

var parseTime = d3.timeParse("%Y");
var t = d3.transition()
    .duration(2000)
    .ease(d3.easeLinear);


function tabulate(years, min_arr, max_arr) {
    
    var table = d3.select('body').append('table')
      .attr('style', `position: fixed; left: ${width + margin.left + margin.right + 50}px; top: ${70 + margin.top}px`)
      .attr('id','minmax_table')
      
      thead = table.append('thead')
      tbody = table.append('tbody');
    
    //APPEND THE HEADER ROW
    
    var header = [, 'Minimum', 'Maximum'];
    
    thead.append('tr')
      .selectAll('th')
      .data(header)
      .enter()
      .append('th')
      .text(function(column) { return column; });
    
    //RESTRUCTURE THE DATA TO BE TABLE-LIKE
    
    var data_arr = [];
    for (i = 0; i < years.length; i++) { data_arr.push([years[i], min_arr[i], max_arr[i]]); }
    
    //APPEND A ROW FOR EACH ARRAY IN THE ARRAY OF ARRAYS: EACH ARRAY IS NOW BOUND TO A ROW
    
    var rows = tbody.selectAll('tr')
      .data(data_arr)
      .enter()
      .append('tr');

    //CREATE CELLS (REVIEW AS DON'T YET UNDERSTAND IT 100%)

    var cells = rows.selectAll("td")
      .data(function(row) {
            return [0,1,2].map(function(column) {
                return {column: column, value: row[[0,1,2].indexOf(column)]};
            });
      })
      .enter()
      .append("td")
      .attr("style", "font-family: Courier")
      .html(function(d) { return d.value; });
              
    return table;
}

//LOAD DATA//

var f = "data/pop_projection.csv"

d3.csv(f).then(function(data) {
    
    //DO EVERYTHING THAT DOESN'T DEPEND ON GROUPED DATA

    //clean all of the data (it comes in as strings)
    data.forEach(function(d) {
        d.Pop_Count = +d.Pop_Count;
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
      .domain([0, d3.max(data, function(d) { return d.Pop_Count; })]);
    
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
      .x(function(d) {return xScale(d.Year);})
      .y(function(d) {return yScale(d.Pop_Count);})

    
    //                        LAST STEP: NEST THE DATA                  //
    //split it into a hierarchical array based on variant and SIM values//  
    
    var nestedGroup = d3.nest()
      .key(function(d) { return d.variant; })
      .key(function(d) { return d.SIM; })
      .entries(data);
    
    //SET THE INITIAL VARIANT OF THE PROJECTION: LOW, MEDIUM OR HIGH
    
    nestedGroup.forEach(function(d,i) {
        
        if (d.key == 'Low') { finalGroup = nestedGroup[i].values ;}
    });

    var init_arr = ['1'];
    var dg = finalGroup.filter(function(d) { return init_arr.indexOf(`${d.key}`) != -1 })
    
    //CREATE INITIAL ARRAYS TO POPULATE THE TABLE
    
    var year_arr = [];
    dg[0]['values'].forEach(function(d,i) { year_arr.push(d['Year'].getFullYear()); } );
    
    var pop_arr = [];
    dg[0]['values'].forEach(function(d,i) { pop_arr.push(d['Pop_Count']); } );
    
    //GENERATE THE TABLE: MIN AND MAX ARRAYS ARE THE SAME FOR A SINGLE LINE
    var test_table = tabulate(year_arr, pop_arr, pop_arr);
    
    dg.forEach(function(d,i) {
       
        //create(append) a new line (path) for every group in the nest
        svgContainer.append('path')
          .attr('d', line_path(d.values))
          .attr("class", "line")
          .attr('id', 'line_' + i)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", "1px")
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
        
        var dg = finalGroup.filter(function(d) { return arr.indexOf(`${d.key}`) != -1 })
        
        //CREATE ZERO ARRAYS 
        
        min_arr = new Array(year_arr.length).fill(4679);
        max_arr = new Array(year_arr.length).fill(0);
           
        dg.forEach(function(d, i) {
            
            d['values'].forEach(function(d,i) { 
                
                if ( d['Pop_Count'] < min_arr[i] ) {
                    
                    min_arr[i] = d['Pop_Count'];
                }
                    });
            
            d['values'].forEach(function(d,i) { 
                
                if ( d['Pop_Count'] > max_arr[i] ) {
                    
                    max_arr[i] = d['Pop_Count'];
                }
                    });
       
            //create(append) a new line (path) for every group (single sim) in the nest
            svgContainer.append('path')
              .attr('d', line_path(d.values))
              .attr("class", "line")
              .attr('id', 'line_' + i)
              .attr("fill", "none")
              .attr("stroke", "black")
              .attr("stroke-width", "1px")
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
            
            d3.select('#minmax_table').remove();

            tabulate(year_arr,min_arr,max_arr);
            
        });
        
    ;}, false);
    
});