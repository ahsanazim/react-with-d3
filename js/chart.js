
class Chart extends React.Component {

  constructor() {
    super();

    this.state = {
      dataQueue: [
        [],[],[],[],[],[],[],[],[],[]       // holds 10
      ],
      chartType: "line",
      drawn: false,
      updateGraph: true,
      y: "memory_usage",
      color: "blue",
      color2: "red",
      color3: "purple",
      title: "memory usage VS time"
    };

    // color to hash code
    this.colorDict = {
      "blue" : "#6d84b4",
      "red": "#ff6666",
      "green" : "#7fff7f",
      "black" : "#191919",
      "orange" : "#ffc04c",
      "yellow" : "#ffff66",
      "purple" : "#D8BFD8",
      "gray" : "#D3D3D3"
    }

    this.upperBounds = {
      'memory_usage': 40,
      'memory_available': 40,
      'network_throughput': 20,
      'network_packet': 1000,
      'cpu_usage': 100,
      'errors': 5
    }

    /* bound functions: */

    // api
    this.getNext = this.getNext.bind(this);

    // misc helpers
    this.yAxisUnit = this.yAxisUnit.bind(this);
    this.getNumLines = this.getNumLines.bind(this);
    this.changeGraph = this.changeGraph.bind(this);
    this.changeColor = this.changeColor.bind(this);
    this.changeColor2 = this.changeColor2.bind(this);
    this.changeColor3 = this.changeColor3.bind(this);
    this.changeChartType = this.changeChartType.bind(this);
    this.getBarColor = this.getBarColor.bind(this);

    // graphing + graphing helpers
    this.formatData = this.formatData.bind(this);
    this.getYDomain = this.getYDomain.bind(this);
    this.drawGraph = this.drawGraph.bind(this);
    this.drawBarGraph = this.drawBarGraph.bind(this);

    // rendering
    this.renderColorList = this.renderColorList.bind(this);
    this.renderColorPicker = this.renderColorPicker.bind(this);
    this.renderLegend = this.renderLegend.bind(this);
  }

  /*  -------=========[ MISC. HELPER FUNCTIONS ]=========-------  */

  getBarColor(name) {
    return this.state[name];
  }

  changeGraph(event) {
    this.setState({ y: event.target.value, drawn: false });
  }

  changeColor(event) {
    this.setState({ color: event.target.value });
  }

  changeColor2(event) {
    this.setState({ color2: event.target.value });
  }

  changeColor3(event) {
    this.setState({ color3: event.target.value });
  }

  changeChartType(event) {
    this.setState({ chartType: event.target.value, drawn: false });
  }

  yAxisUnit() {
    const kb_unit = ['memory_usage', 'network_throughput', 'memory_available'];
    if (kb_unit.includes(this.state.y)) {
      return 'kb'
    } else if (this.state.y == 'cpu_usage') {
      return  '%'
    } else {
      return ''
    }
  }

  getNumLines(field) {
    if (field == 'errors') {
      return 3;
    } else if (field == 'network_packet' || field == 'network_throughput') {
      return 2;
    } else {
      return 1;
    }
  }

  /* initiate graphing once mounted */
  componentDidMount() {
    let delay = 1000;
    let serverID = "server1";
    let timer = null;
    let requestObj = null;

    this.getNext(delay,serverID,timer,requestObj);
  }

  /*  -------=========[ API INTERACTION ]=========-------  */
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
          if(self.state.chartType == 'bar') {
            self.drawBarGraph(true);
          } else {
            self.drawGraph(true);
          }
        } else if ((self.state.dataQueue[9].length != 0) && self.state.drawn && self.state.updateGraph) {
          if(self.state.chartType == 'bar') {
            self.drawBarGraph(false);
          } else {
            self.drawGraph(false);
          }
        }

        timer = setTimeout(self.getNext(delay, serverID, timer, requestObj), delay);
      });
  }


  /*  -------=========[ GRAPHING HELPER FUNCTIONS ]=========-------  */

  formatData(inputData) {
    var data = inputData.filter(function(d) {
      return !d.error               // skip over overall error
    }).map((d) => {
      let val1, val2, val3;
      let date = new Date(d.result.data[0].timestamp);
      date = date.getTime();
      switch(this.getNumLines(this.state.y)) {
        case 3:         // errors field
          val1 = d.result.data[0][this.state.y].system
          val2 = d.result.data[0][this.state.y].sensor
          val3 = d.result.data[0][this.state.y].component
          return {
            date: date,
            val1: val1,
            val2: val2,
            val3: val3
          };
          break;
        case 2:
          val1 = d.result.data[0][this.state.y].in
          val2 = d.result.data[0][this.state.y].out
          val1 = this.yAxisUnit() == 'kb' ? val1 / 1000 : val1
          val2 = this.yAxisUnit() == 'kb' ? val2 / 1000 : val2
          return {
            date: date,
            val1: val1,
            val2: val2
          };
          break;
        case 1:
          val1 = d.result.data[0][this.state.y]
          val1 = this.yAxisUnit() == 'kb' ? val1 / 1000 : val1
          val1 = this.yAxisUnit() == '%' ? val1 * 100 : val1
          console.log(val1);
          return {
            date: date,
            val1: val1
          };
          break;
      }
    });

    return data;
  }

  getYDomain(data) {
    let y_domain = [];
    switch(this.getNumLines(this.state.y)) {
      case 3:         // errors field
        y_domain = [0, d3.max(data, function(d) { return Math.max(...[d.val1, d.val2, d.val3]); })]
        break;
      case 2:
        y_domain = [0, d3.max(data, function(d) { return Math.max(...[d.val1, d.val2]); })]
        break;
      case 1:
        y_domain = d3.extent(data, function(d) { return d.val1; });
        break;
    }
    y_domain[0] = 0;      // y min is always 0
    y_domain[1] = this.upperBounds[this.state.y];

    return y_domain;
  }

  /*  -------=========[ GRAPHING ]=========-------  */

  drawGraph(firstDraw) {
    var data = this.formatData(this.state.dataQueue);

    var width = 700,   // width of svg
        height = 400,  // height of svg
        padding = 100; // space around the chart, not including labels

    var x_domain = d3.extent(data, function(d) { return d.date; }),
        y_domain = this.getYDomain(data);

    // display date format
    var date_format = d3.time.format("%H:%M:%S");

    var vis = null;
    if (firstDraw) {
      // create an svg container
      d3.select(".svgAnchor").select("svg").remove();
      vis = d3.select(".svgAnchor")
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
      .domain(x_domain)
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

    // Define the line(s)
    var valueline1, valueline2, valueline3;
    valueline1 = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.val1); })
        .interpolate("basis");
    if (this.getNumLines(this.state.y) > 1) {
      valueline2 = d3.svg.line()
          .x(function(d) { return xScale(d.date); })
          .y(function(d) { return yScale(d.val2); })
          .interpolate("basis");
    }
    if (this.getNumLines(this.state.y) > 2) {
      valueline3 = d3.svg.line()
          .x(function(d) { return xScale(d.date); })
          .y(function(d) { return yScale(d.val3); })
          .interpolate("basis");
    }

    if (!firstDraw) {
      // Select the section we want to apply our changes to
      var svg = d3.select(".svgAnchor").transition();

      // Make the changes
      svg.select(".line1")   // change the line
          .duration(750)
          .attr("d", valueline1(data))
          .attr("stroke", this.colorDict[this.state.color]);
      if (this.getNumLines(this.state.y) > 1) {
        svg.select(".line2")   // change the line
            .duration(750)
            .attr("d", valueline2(data))
            .attr("stroke", this.colorDict[this.state.color2]);
      }
      if (this.getNumLines(this.state.y) > 2) {
        svg.select(".line3")   // change the line
            .duration(750)
            .attr("d", valueline3(data))
            .attr("stroke", this.colorDict[this.state.color3]);
      }
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

      svg.select("text.title")
        .text(this.state.title);

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
    vis.selectAll(".xaxis text")  // select all the text elements for the xaxis
      .attr("transform", function(d) {
         return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
     });

    // now add titles to the axes
    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(`${this.state.y.replace(/_/g, " ")} (${this.yAxisUnit(this.state.y)})`);
    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height-(padding/3))+")")  // centre below axis
        .text("Time");

    // Add the valueline path.
    vis.append("path")
        .attr("class", "line line1")
        .attr("d", valueline1(data))
        .attr("stroke", this.colorDict[this.state.color]);
    if (this.getNumLines(this.state.y) > 1) {
      vis.append("path")
          .attr("class", "line line2")
          .attr("d", valueline2(data))
          .attr("stroke", this.colorDict[this.state.color2]);
    }
    if (this.getNumLines(this.state.y) > 2) {
      vis.append("path")
          .attr("class", "line line3")
          .attr("d", valueline3(data))
          .attr("stroke", this.colorDict[this.state.color3]);
    }

    // title
    vis.append("text")
      .attr("x", (width / 2))
      .attr("y", 0 + (width / 8))
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .style("font-size", "16px")
      .text(this.state.title);

  }

  drawBarGraph(firstDraw) {
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var y = d3.scale.linear()
        .range([height, 0]);

    var data = this.formatData(this.state.dataQueue);

    if (this.getNumLines(this.state.y) == '3') {
      data = [
        { key: "color", value: data.reduce(function(p,c,i,a){return p + (c.val1/a.length)},0) },
        { key: "color2", value: data.reduce(function(p,c,i,a){return p + (c.val2/a.length)},0) },
        { key: "color3", value: data.reduce(function(p,c,i,a){return p + (c.val3/a.length)},0) }
      ]
    } else if (this.getNumLines(this.state.y) == '2')  {
      data = [
        { key: "color", value: data.reduce(function(p,c,i,a){return p + (c.val1/a.length)},0) },
        { key: "color2", value: data.reduce(function(p,c,i,a){return p + (c.val2/a.length)},0) }
      ]
    } else {
      data = [{ key: "color", value: data.reduce(function(p,c,i,a){return p + (c.val1/a.length)},0) }]
    }

    var barWidth = width / data.length;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .5);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    x.domain(data.map(function(d) { return d.key; }));
    y.domain([0, this.upperBounds[this.state.y]]);

    d3.select(".svgAnchor").select("svg").remove();
    let chart = d3.select(".svgAnchor")
            .append("svg:svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    let self = this;
    chart.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .attr("width", x.rangeBand())
        .attr("fill", function(d) { return self.colorDict[self.state[d.key]]; });

    // title
    chart.append("text")
      .attr("x", (width / 2))
      .attr("y", 0 + height/15)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .style("font-size", "16px")
      .text(this.state.title);
  }

  /*  -------=========[ RENDER HELPER FUNCTIONS ]=========-------  */

  renderColorList(colorChangeFunc,color) {
    return (
      <select value={color} onChange={colorChangeFunc} className="custom-select" id="lineColorSelector">
        <option value="blue">blue</option>
        <option value="red">red</option>
        <option value="green">green</option>
        <option value="black">black</option>
        <option value="orange">orange</option>
        <option value="yellow">yellow</option>
        <option value="purple">purple</option>
        <option value="gray">gray</option>
      </select>
    );
  }

  renderColorPicker() {
    switch(this.getNumLines(this.state.y)) {
      case 3:         // errors field
        return (
          <div className="form-group">
            <label htmlFor="lineColorSelector">line color 1</label>
            {this.renderColorList(this.changeColor,this.state.color)}
            <label htmlFor="lineColorSelector">line color 2</label>
            {this.renderColorList(this.changeColor2,this.state.color2)}
            <label htmlFor="lineColorSelector">line color 3</label>
            {this.renderColorList(this.changeColor3,this.state.color3)}
          </div>
        );
        break;
      case 2:
        return (
          <div className="form-group">
            <label htmlFor="lineColorSelector">line color 1</label>
            {this.renderColorList(this.changeColor,this.state.color)}
            <label htmlFor="lineColorSelector">line color 2</label>
            {this.renderColorList(this.changeColor2,this.state.color2)}
          </div>
        );
        break;
      case 1:
        return (
          <div className="form-group">
            <label htmlFor="lineColorSelector">line color</label>
            {this.renderColorList(this.changeColor,this.state.color)}
          </div>
        );
        break;
    }
  }

  renderLegend() {
    switch(this.getNumLines(this.state.y)) {
      case 3:         // errors field
        return (
          <ul className="list-group">
            <li className="list-group-item">system<span style={{color: this.colorDict[this.state.color]}}>&#x2587;</span></li>
            <li className="list-group-item">sensor<span style={{color: this.colorDict[this.state.color2]}}>&#x2587;</span></li>
            <li className="list-group-item">component<span style={{color: this.colorDict[this.state.color3]}}>&#x2587;</span></li>
          </ul>
        );
        break;
      case 2:
        return (
            <ul className="list-group">
              <li className="list-group-item">in <span style={{color: this.colorDict[this.state.color]}}>&#x2587;</span></li>
              <li className="list-group-item">out <span style={{color: this.colorDict[this.state.color2]}}>&#x2587;</span></li>
            </ul>
        );
        break;
      case 1:
        return (
            <ul className="list-group">
              <li className="list-group-item">{this.state.y} <span style={{color: this.colorDict[this.state.color]}}>&#x2587;</span></li>
            </ul>
        );
        break;
    }
  }

  render() {
    return (
      <div className="container">
        <div className="svgAnchor"></div>
        <div>Legend:
          {this.renderLegend()}
        </div>
        <form>
          <div className="form-group">
            <label htmlFor="titleInput">title: </label>
            <input type="text" id="titleInput" className="form-control" id="formGroupExampleInput" value={this.state.title}
              onChange={(event) => this.setState({title: event.target.value})}/>
          </div>
          <div className="form-group">
            <label htmlFor="chartTypeSelector">Chart type</label>
            <select value={this.state.chartType} onChange={this.changeChartType} className="custom-select" id="chartTypeSelector">
              <option value="line">line</option>
              <option value="bar">bar</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="yAxisSelector">y-axis</label>
            <select value={this.state.y} onChange={this.changeGraph} className="custom-select" id="yAxisSelector">
              <option value="memory_usage">memory usage</option>
              <option value="memory_available">memory available</option>
              <option value="network_throughput">network throughput</option>
              <option value="network_packet">network packet</option>
              <option value="cpu_usage">cpu usage</option>
              <option value="errors">errors</option>
            </select>
          </div>
          {this.renderColorPicker()}
        </form>
        <button onClick={() => this.setState({updateGraph: !this.state.updateGraph})} type="button" className="btn btn-outline-warning">Pause</button>
      </div>
    );
  }
}

ReactDOM.render(
  <Chart />,
  document.getElementById('main')
);
