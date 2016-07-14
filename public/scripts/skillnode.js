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
	handleNodeSubmit: function(node) {
		var nodes = this.state.data;
		node.id = Date.now();
		var newNodes = nodes.concat([node]);
		console.log(newNodes);
		// var $node = $.param(node);
		// console.log($node);
		this.setState({data: newNodes});
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: node,
			success: function(data) {
				console.log(data);
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
				<NodeForm onNodeSubmit={this.handleNodeSubmit} />
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
			</div>
		);
	}
});

var NodeForm = React.createClass({
	getInitialState: function() {
		return {author: '', text: '', inputs: ['input-0'], skills: Immutable.List()};
	},
	createInput: function() {
		var newInput = `input-${this.state.inputs.length}`;
		this.setState({inputs: this.state.inputs.concat([newInput])});
	},
	handleSkillChange: function(e) {
		var newSkill = e.target.value;
		var parseSkill = {id: Number(e.target.id), skill: newSkill};
		var skillMap = this.state.skills.set(e.target.id, parseSkill);
		this.setState({skills: skillMap});
	},
	handleAuthorChange: function(e) {
		this.setState({author: e.target.value});
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		var skills = this.state.skills.toJSON();
		if (!text || !author || !skills) {
			return;
		}
		this.props.onNodeSubmit({author: author, text: text, skills: skills});
		console.log(this.refs.Formfield);
		this.refs.Formfield.reset();
		var formRef = this.refs.Formfield;
		this.setState({author: '', text: '', inputs: ['input-0'], skills: this.state.skills.clear()});
	},
	render: function() {
		var self = this;
		return(
			<div>
			<form className="nodeForm" onSubmit={this.handleSubmit} ref="Formfield">
			<input type="text"  placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange}/>
			<input type="text" placeholder="Say something..." value={this.state.text} onChange={this.handleTextChange}/>
			<div id="nodeForm">
				<div>
					<div id="dynamicInput">
						{this.state.inputs.map(function(input, i){
							return <input type="text" placeholder="Your Skill" key={i} id={i} onChange={self.handleSkillChange}/>
						})}
					</div>
				</div>
			</div>
			<input type="submit" value="Post" />
			</form>
			<button onClick={this.createInput}>
					Click to add input
			</button>
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

var Button = React.createClass({
	getInitialState: function() {
		return {count: 0};
	},
	handleClick: function() {
		console.log(this.state.count);
		this.setState({count: this.state.count += 1});
	},
	render: function() {
		return (
			<div>
			<div>Counter: {this.state.count} </div>
			<button onClick={this.handleClick}> </button>
			</div>
		);
	}
});

ReactDOM.render(
	<Button />,
	document.getElementById('button')
);


ReactDOM.render(
	<NodeBox url="/api/skills" pollInterval={2000} />,
	document.getElementById('nodes')
);