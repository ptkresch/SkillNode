var NodeBox = React.createClass({
	loadNodesFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadNodesFromServer();
		setInterval(this.loadNodesFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div className="nodeBox">
				<NodeList data={this.state.data} />
			</div>
		);
	}
});

var NodeList = React.createClass({
	render: function() {
		var nodeCores = this.props.data.map(function(node) {
			return (
				<NodeCore author={node.author} key={node.id} text={node.text}>
				</NodeCore>
			);
		});
		return (
			<div className="nodeList">
				{nodeCores}
			</div>
		);
	}
});

var NodeCore = React.createClass({
	render: function() {
		return (
			<div className="nodeCore">
				<h2 className="nodeAuthor">
					{this.props.author}
				</h2>
				<h4 className="nodeText">
					{this.props.text}
				</h4>
			</div>
		);
	}
});

ReactDOM.render(
	<NodeBox url="/api/skills" pollInterval={2000} />,
	document.getElementById('nodes')
);