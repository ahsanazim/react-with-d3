
class Chart extends React.Component {

  constructor() {
    super();

    this.state = {
      dataQueue: [
        [],[],[],[],[],[],[],[],[],[]       // holds 10
      ],
      isLineChart: true,
      drawn: false
    };

    this.getNext = this.getNext.bind(this);
    this.drawGraph = this.drawGraph.bind(this);
  }

  componentDidMount() {
    let delay = 1000;
    let serverID = "server1";
    let timer = null;
    let requestObj = null;

    this.getNext(delay,serverID,timer,requestObj);
  }

  getNext(delay, serverID, timer, requestObj) {
    let self = this;
    let newData = [];
    let startTime = new Date(),
        endTime = new Date(startTime.getTime() + 1000),
        queryParam = ["from=", startTime.getTime(), "&to=", endTime.getTime()].join("");
    requestObj = $.ajax({
          url: ["/server_stat/", serverID, "?" + queryParam].join("")
      }).done(function(response) {
          newData = {
            from: startTime,
            to: endTime,
            result: response,
            error: false
          };
      }).fail(function(jqXHR, textStatus, errorThrown) {
          newData = {
            from: startTime,
            to: endTime,
            error: true,
            errorMsg: textStatus
          };
      }).always(function() {
        let newDataQueue = self.state.dataQueue;
        newDataQueue.pop();                     // deque last element
        newDataQueue.unshift(newData);          // enqueue new data
        self.setState({ data: newDataQueue });

        // graph only when 10 elements present
        if ((self.state.dataQueue[9].length != 0) && !self.state.drawn) {
          self.setState({ drawn: true });
          self.drawGraph(true,'memory_usage');
        } else if ((self.state.dataQueue[9].length != 0) && self.state.drawn) {
          self.drawGraph(false,'memory_usage');
        }

        timer = setTimeout(self.getNext(delay, serverID, timer, requestObj), delay);
      });
  }

  drawGraph(firstDraw, field) {
    var data = this.state.dataQueue.map(function(d) {
      if (d.error){
        return {
          date: d.from,
          value: 0
        };
      } else {
        return {
          date: d.from,
          value: d.result.data[0][field]
        };
      }
    });

    console.log(data);

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var mindate = data[0].date,
        maxdate = data[9].date;

    var width = 700,   // width of svg
        height = 400,  // height of svg
        padding = 100; // space around the chart, not including labels

    var x_domain = d3.extent(data, function(d) { return d.date; }),
        y_domain = d3.extent(data, function(d) { return d.value; });

    // display date format
    var date_format = d3.time.format("%H:%M:%S");

    var vis = null;
    if (firstDraw) {
      // create an svg container
      vis = d3.select("body")
              .append("svg:svg")
              .attr("width", width)
              .attr("height", height);
    }

    // define the y scale  (vertical)
    var yScale = d3.scale.linear()
      .domain(y_domain).nice()   // make axis end in round number
      .range([height - padding, padding]);   // map these to the chart height, less padding.  In this case 300 and 100
      //REMEMBER: y axis range has the bigger number first because the y value of zero is at the top of chart and increases as you go down.


    var xScale = d3.time.scale()
      .domain(x_domain)    // values between for month of january
      .range([padding, width - padding]);   // map these sides of the chart, in this case 100 and 600


    // define the y axis
    var yAxis = d3.svg.axis()
        .orient("left")
        .scale(yScale);

    // define the x axis
    var xAxis = d3.svg.axis()
        .orient("bottom")
        .scale(xScale)
        .tickFormat(date_format);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return xScale(d.date.getTime()); })
        .y(function(d) { return yScale(d.value); });

    if (!firstDraw) {
      // Select the section we want to apply our changes to
      var svg = d3.select("body").transition();

      // Make the changes
      svg.select(".line")   // change the line
          .duration(750)
          .attr("d", valueline(data));
      svg.select(".xaxis") // change the x axis
          .duration(750)
          .attr("transform", "translate(0," + (height - padding) + ")")
          .call(xAxis);
      svg.select(".yaxis") // change the y axis
          .duration(750)
          .call(yAxis);

      svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
       });

      return
    }

    // draw y axis with labels and move in from the size by the amount of padding
    vis.append("g")
    	  .attr("class", "yaxis axis")
        .attr("transform", "translate("+padding+",0)")
        .call(yAxis);
    // draw x axis with labels and move to the bottom of the chart area
    vis.append("g")
        .attr("class", "xaxis axis")  // two classes, one for css formatting, one for selection below
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    // now rotate text on x axis
    // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
    // first move the text left so no longer centered on the tick
    // then rotate up to get 45 degrees.
    vis.selectAll(".xaxis text")  // select all the text elements for the xaxis
      .attr("transform", function(d) {
         return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
     });

    // now add titles to the axes
    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(field.replace(/_/g, " "));
    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height-(padding/3))+")")  // centre below axis
        .text("Time");

    // Add the valueline path.
    vis.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));
  }

  render() {

    return (
      <div className="container">
      </div>
    );
  }
}

ReactDOM.render(
  <Chart />,
  document.getElementById('main')
);



/*

<App />

which contains

<div>
  <Chart />
  <Modal />
</div>


*/
