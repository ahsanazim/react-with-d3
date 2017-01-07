
class Chart extends React.Component {

  constructor() {
    super();

    this.state = {
      dataQueue: [
        [],[],[],[],[],[],[],[],[],[]       // holds 10
      ],
      isLineChart: true
    };
    this.getNext = this.getNext.bind(this);
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
        newDataQueue.pop();                              // deque last element
        newDataQueue.unshift(JSON.stringify(newData));   // enqueue new data
        self.setState({ data: newDataQueue });
        timer = setTimeout(self.getNext(delay, serverID, timer, requestObj), delay);
      });
  }

  render() {
    const dataItems = this.state.dataQueue.map((item,idx) => {
      return <div><h1>{idx}</h1>{item}</div>;
    });

    return (
      <div className="container">
        <h1>{`${this.state.dataQueue.length} data items`}</h1>
        {dataItems}
      </div>
    );
  }
}

ReactDOM.render(
  <Chart />,
  document.getElementById('main')
);



/*
so you have data on 5 fields (some with sub-fields), coming according to time.

you can either plot everything on one view (easier with a line chart), or let the
user be able to toggle between plotting different things

you'll probably want to take the rolling window approach, and have the x (time)
axis start from data point # 1 and end at # 10.

Thus you only have to store the previous 10 data points

How do you start things up? Just continue adding to the chart, you reserve 10 points so
the graph will start filling up

Issues:

- how do you continue running this get in the background?
http://mediatemple.net/blog/tips/loading-and-using-external-data-in-react/
- d3 tutorial
https://square.github.io/intro-to-d3/

https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=using%20d3%20with%20react
https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=react%20making%20a%20continuous%20api%20call%20in%20the%20background
http://stackoverflow.com/questions/28771098/do-something-once-then-every-15-seconds-in-react-js


this.state = {
  data: [ [],[],[],[],[],[],[],[],[],[] ],  // use as a queue, enqueu and dequeu, will fill up with
  line: true                                // obj's as data comes
  // maybe other things for determining what to plot
}


change this to

<App />

which contains

<div>
  <Chart />
  <Modal />
</div>


*/
