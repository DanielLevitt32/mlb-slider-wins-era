
/* Set the margins and widths as global variables to be referenced as needed */
var margin = {
  top: 10, 
  right: 60, 
  bottom: 20, 
  left: 100},


    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* Set the x scale as "linear" (as opposed to time or ordinal) */
/* And apply it to the available space we've reserved */
/* The range is a pixel value => the amount of space we'll use for our x axis */
var x = d3.scale.linear()
    .range([0, width]);

/* Do the same with the y scale, mapped to the available height */
var y = d3.scale.linear()
    .range([height, 0]);

/* Axis are automated in D3, so you don't have to draw and place numbers and hash marks */
/* We call the svg.axis() function and pass the scales as arguments. */
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

/* Tick format allows us to control how the tick labels appear 
/* Handy for units like currencies and percentages */
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(function(d) {
      return +d;
    });



 /*trendline*/   

    /*var svg = d3.select(".trendline")
      .data("Wins", "Miles");*/
      
    /*trendline.enter()
      .append("line")
      /*.attr("class", "trendline")
     /* .attr("x1", function(d) { return xScale(d[0]); })
      .attr("y1", function(d) { return yScale(d[1]); })
      .attr("x2", function(d) { return xScale(d[2]); })
      .attr("y2", function(d) { return yScale(d[3]); })
      .attr("stroke", "black")
      .attr("stroke-width", 1);*/


/* This is where we draw our svg canvas. SVG is a markup element, so we just append it to our target div */
/* In this case, it's a div called .chart */
/* We use the margins and transforms to draw a smaller canvas inside of the target div and to center it appropriately */
var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



/* ------------------------------- */
/* EXTRA SUPER ADDED BONUS LESSON */
/* ------------------------------- */
/* We've added two global variables to make our animation work.
`theData` stores our dataset globally so we can access it throughout,
and `currYearData` stores the current year, so we can update it with our buttons */
var theData;
var currYear = "2015";
/* ------------------------------- */

/* This is an ajax call to load our csv-formatted data */
d3.csv("data/mlbdata.csv", function(error, data) {

  /* Since we're using csv, all values are automatically strings. */
  /* So we loop through the data and cast our charting values as numbers */
  /* D3 lets us do that with `+` signs. */
  data.forEach(function(d) {
    d.Wins = +d["Wins"];
    d.ERA = +d["ERA"];
  });

  //Assign data to our global variable so we can access it throughout.
  theData = data;

  /* We want to assign domains to our x and y scales. */
  /* Domains are the lowest and highest possible values in the data set. */
  /* We find these values by checking a nested property from each object in the array using `d3.extent()` */
  x.domain(d3.extent(theData, function(d) { return d.Wins; })).nice();
  y.domain(d3.extent(theData, function(d) { return d.ERA; })).nice();


  //Draw the axis for the charts.
  chartInit();

  //Draw the datapoints in a separate function.
  //We separate this in case we need to update the data
  //Without redrawing the axis.
  chartUpdate();


  /* This is the button functionality. Whenever we click a button,
  we'll update the current year and run the chartUpdate() function again */

  d3.selectAll(".btn").on("click", function() {

    //Set the currYear global to be equal to the selected button.
    currYear = d3.select(this).attr("val");

    //Remove the .active class from all buttons, add it to the one we just clicked.
    d3.selectAll(".btn").classed("active", false);
    d3.select(this).classed("active", true);

    //Update the chart!!
    chartUpdate();
  });

  /* ------------------------------- */

});


function chartInit() {

    //Append the x axis to the chart.
  svg.append("g")
      .attr("class", "x axis")
      // Translate is an SVG property that helps us move the X axis below the chart.
      .attr("transform", "translate(0," + height + ")") 
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width) // width represents the farthest point right on our chart
      .attr("y", -6)
      .style("text-anchor", "end") // Anchoring the text to the end lets us flow it left from that end point.
      .text("Wins");

  //Append the y axis to the chart.
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)") // Rotate is another SVG property.
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Earned Run Average")

      
}

function chartUpdate() {

  // d3.nest lets us break our data into 4 separate years.
  // We're basically reorganizing 120 rows (30 MLB teams x 4 years)
  // Into 4 arrays of 30 teams, with "Year" as the object key.
  var nestedData = d3.nest()
    .key(function(d) { return d.Year; })
    .map(theData);

  //Now we can target a single year of the data.
  //We'll use the current year (2015 is default, but will update when we click the buttons)
  var currYearData = nestedData[currYear];


  // This is where the magic happens, where we actually create elements on the page
  // using our data. Let's break it down.
  
  // SELECT 
  // First we select the elements we're going to create.
  // That may sound a little weird since these elements don't exist yet,
  // but just hang with it.
  svg.selectAll(".dot")
  // JOIN 
  // Now we join our data to those elements. This creates a one-to-one relationship
  // between each data point and element that represents it, in this case a dot!
      

  /* We need to bind each dot to a specific team so they stay the same each upate 
  This dot should always represent this team when the data updates 
  If we DON'T DO THIS, the circles will update in the order of the data. The number of dots will stay the same,
  but they might not update according to their original team name */
  /* ------------------------------- */

      .data(currYearData, function(d) {
        return d.Team;
      })

  // ENTER 
  // This is where d3 is amazing. It knows to check the page, and if there are more data points
  // than elements representing them, it adds them to the page.
    .enter().append("circle")
      // Here on out, we're just adding properties to the elements we just created.
      .attr("class", "dot")


//3) Use the mouseover listener to get the x and y positions of the element when mousing over and pass those values to the tooltip styles to position it.

//.on("mousemove", function(d) {

    //var xPos = d3.mouse(this)[0] + margin.left + 10;
    //var yPos = d3.mouse(this)[1] + margin.top + 10;

//     $(".tt").css({
//         "left": xPos + "px",
//         "top": yPos + "px"
//     })
// })

//4) Pass the data values to the tooltip as html. (Notice we're using the Moment.js library here to format our dates for display):
  
// var Wins = Wins;
// var ERA = ERA;

//Append the values to the tooltip with some markup.
// $(".tt").html(
//   "<div class='Wins'>"+Wins+"</div>"+
//   "<div class='ERA'>"+ERA+"</div>"
//   //"<div class='Salary'>"+d.Salary+"</div>"
// )

    d3.selectAll(".dot")
      .transition().duration(500)
      .attr("r", function(d) {

         return Math.sqrt(d.Salary/1000000);
        
      })
      .attr("cx", function(d) { return x(d.Wins); })
      .attr("cy", function(d) { return y(d.ERA); })
     .style("fill", function(d) {
        

      if (d.Playoffs === "yes") {
        return "#bd0026";

      }

      if (d.Playoffs === "no") {
        return "#fd8d3c";

      }

      });

  svg.selectAll(".name")
      .data(currYearData, function(d) {
        return d.Team;
      })
    .enter().append("text")
      .attr("class", "name")
      .text(function(d) {
        return d.Team;
        })
  
  d3.selectAll(".name")
      .transition().duration(500)
      .attr("x", function(d) { return x(d.Wins) + 5; })
      .attr("y", function(d) { return y(d.ERA); })
    }
        
