//Node bubble conversations - topics posted, can join while seeing other topics/bubbles
//Changes to clicking nodes shoudld be handled by the nodecores

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
		return(
			<div>
			{this.props.data.map(function(node, i) {
				return(
					<div className="nodeList" key={performance.now()}>
						<Avatar imgurl = {node.imgurl} />
						<NodeCore author={node.author} key={node.id} id={node.id} text={node.text} skills={node.skills}>
						</NodeCore>
					</div>
				);
			})}
			</div>
		)
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
				<ul className="nodeSkills">
					{this.props.skills.map(function(skill,j) {
						return(<li key={skill.id}>{skill.skill}</li>);
					})}
				</ul>
				<Button author={this.props.author}/>
			</div>
		);
	}
});

var Avatar = React.createClass({
	render: function() {
		return (
			<div>
				<PagePic imgurl = {this.props.imgurl} />
			</div>
		)
	}
});

var PagePic = React.createClass({
	render: function() {
		return (
			<img src = {this.props.imgurl} />
		);
	}
});

class Button extends React.Component {
	constructor() {
		super();
		this.state = {
			clicked: false,
			name: 'howdy'
		};
		this.handleClick = this.handleClick.bind(this);
		this.getName = this.getName.bind(this);
	}
	handleClick() {
		this.setState({clicked: !this.state.clicked});
	}
	getName() {
		this.setState({name: this.props.author});
	}
	render() {
		const text = this.state.clicked ? 'clicked' : 'haven\'t clicked';
		const name = this.state.name;
		return (
			<div onClick={this.handleClick}>
			You {text} this. Click to toggle.
			<div onClick={this.getName}>Wassup {name}</div>
			</div>
		);
	}
}

ReactDOM.render(
	<NodeBox url="/api/skills" pollInterval={2000} />,
	document.getElementById('nodes')
);