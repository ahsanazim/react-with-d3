class Post extends React.Component {
  constructor() {
    super()

    this.state = {
      memUsage: "",
      memAvailable: "",
      netPacketIn : "",
      netPacketOut : "",
      netThroughIn : "",
      netThroughOut : "",
      errSys : "",
      errSen : "",
      errComp : "",
      cpuUsage : ""
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.onReqSuccess = this.onReqSuccess.bind(this);
  }

  onReqSuccess(data, textStatus, jqXHR) {
    alert(textStatus);
  }

  onSubmit() {
    $.ajax({
          type: 'POST',
          url: "/server_stat",
          data: {
              timestamp: (new Date()),
              memory_usage: this.state.memUsage,
              memory_available: this.state.memAvailable,
              cpu_usage: this.state.cpuUsage,
              network_throughput: {
                  "in": this.state.netThroughIn,
                  out: this.state.netThroughOut
              },
              network_packet: {
                  "in": this.state.netPacketIn,
                  out: this.state.netPacketOut
              },
              errors: {
                  system: this.state.errSys,
                  sensor: this.state.errSen,
                  component: this.state.errComp
              }
          },
          success: this.onReqSuccess
      });
  }

  render() {
    return (
      <form className="form-horizontal" role="form">
          <div className="form-group">
           <h1>Post to our server!</h1>
           <p>Fill in any or all of the fields below, and click submit when you're done!</p>
          </div>
          <div className="form-group">
            <span className="col-md-2 control-label"><h4>CPU Usage</h4></span>
            <div className="col-md-12">
              <div className="col-md-3">
                <input type="text" id="cpuUsageInput" className="form-control" value={this.state.cpuUsage}
                    onChange={(event) => this.setState({cpuUsage: event.target.value})}/>
              </div>
            </div>
          </div>
          <div className="form-group">
              <span className="col-md-2 control-label"><h4>Memory</h4></span>
              <div className="col-md-12">
                  <div className="form-group row">
                      <label htmlFor="memUsageInput" className="col-md-1 control-label">usage</label>
                      <div className="col-md-3">
                          <input type="text" id="memUsageInput" className="form-control" value={this.state.memUsage}
                              onChange={(event) => this.setState({memUsage: event.target.value})}/>
                      </div>
                      <label htmlFor="memAvailable" className="col-md-1 control-label">available</label>
                      <div className="col-md-3">
                        <input type="text" id="memAvailable" className="form-control" value={this.state.memAvailable}
                            onChange={(event) => this.setState({memAvailable: event.target.value})}/>
                      </div>
                  </div>
              </div>
          </div>
          <div className="form-group">
              <span className="col-md-2 control-label"><h4>Network Packets</h4></span>
              <div className="col-md-12">
                  <div className="form-group row">
                      <label htmlFor="netPacketIn" className="col-md-1 control-label">in</label>
                      <div className="col-md-3">
                        <input type="text" id="netPacketIn" className="form-control" value={this.state.netPacketIn}
                            onChange={(event) => this.setState({netPacketIn: event.target.value})}/>
                      </div>
                      <label htmlFor="netPacketOut" className="col-md-1 control-label">out</label>
                      <div className="col-md-3">
                        <input type="text" id="netPacketOut" className="form-control" value={this.state.netPacketOut}
                            onChange={(event) => this.setState({netPacketOut: event.target.value})}/>
                      </div>
                  </div>
              </div>
          </div>
          <div className="form-group">
              <span className="col-md-2 control-label"><h4>Network Throughput</h4></span>
              <div className="col-md-12">
                  <div className="form-group row">
                      <label htmlFor="netThroughIn" className="col-md-1 control-label">in</label>
                      <div className="col-md-3">
                        <input type="text" id="netThroughIn" className="form-control" value={this.state.netThroughIn}
                            onChange={(event) => this.setState({netThroughIn: event.target.value})}/>
                      </div>
                      <label htmlFor="netThroughOut" className="col-md-1 control-label">out</label>
                      <div className="col-md-3">
                        <input type="text" id="netThroughOut" className="form-control" value={this.state.netThroughOut}
                            onChange={(event) => this.setState({netThroughOut: event.target.value})}/>
                      </div>
                  </div>
              </div>
          </div>
          <div className="form-group">
              <span className="col-md-2 control-label"><h4>Errors</h4></span>
              <div className="col-md-12">
                  <div className="form-group row">
                      <label htmlFor="errSys" className="col-md-1 control-label">System</label>
                      <div className="col-md-3">
                        <input type="text" id="errSys" className="form-control" value={this.state.errSys}
                            onChange={(event) => this.setState({errSys: event.target.value})}/>
                      </div>
                      <label htmlFor="errSen" className="col-md-1 control-label">Sensor</label>
                      <div className="col-md-3">
                        <input type="text" id="errSen" className="form-control" value={this.state.errSen}
                            onChange={(event) => this.setState({errSen: event.target.value})}/>
                      </div>
                      <label htmlFor="errComp" className="col-md-1 control-label">Component</label>
                      <div className="col-md-3">
                        <input type="text" id="errComp" className="form-control" value={this.state.errComp}
                            onChange={(event) => this.setState({errComp: event.target.value})}/>
                      </div>
                  </div>
              </div>
          </div>
          <div className="form-group">
            <button type="button" onClick={this.onSubmit} className="btn btn-outline-primary">Submit</button>
          </div>
      </form>
    );
  }
}
