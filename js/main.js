class Main extends React.Component {
  constructor() {
    super()

  }

  render() {
    return (
      <div className = "mainContainer">
        <Chart />
        <Post />
      </div>
    );
  }
}


ReactDOM.render(
  <Main />,
  document.getElementById('main')
);
