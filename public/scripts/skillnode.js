//Node bubble conversations - topics posted, can join while seeing other topics/bubbles

//To do: fix keys when submitting new user, fix unmounting chat, make separate message states for each skill
//make messages load when chat room becomes visible (won't display messages until submit button is hit)
//(keys problem due to the slogan area being the same)
//Add picture upload
//Separate chatroom functionality from skill list?
var socket = io.connect('http://localhost:3000/');
var NodeBox = React.createClass({
	handleNodeSubmit: function(node) {
		var nodes = this.state.data;
		node.id = Date.now();
		var newNodes = nodes.concat([node]);
		this.setState({data: newNodes});
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: node,
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
	render: function() {
		return (
			<div className="nodeBox">
				<PollTest url={this.props.url} topicsurl={this.props.topicsurl}/>
				<NodeForm onNodeSubmit={this.handleNodeSubmit} />
			</div>
		);
	}
});

var NodeCore = React.createClass({
	render: function() {
		var self = this;
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
						return(<li key={skill.id}><Button skill={skill.skill} topicsurl={self.props.topicsurl}/>{skill.skill}</li>);
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
		this.refs.Formfield.reset();
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
			<button onClick={this.createInput} type="button">
					Click to add input
			</button>
			</div>
		);
	}
});

var PollTest = React.createClass({
	getInitialState: function() {
		return {data: [], url: this.props.url, topicsurl: this.props.topicsurl};
	},
	componentWillMount: function() {
		this.poll();
	},
	startPolling: function() {
		var self = this;
		setTimeout(function() {
			self.poll();
		}, 4000);
	},
	poll: function() {
		var self = this;
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
				// this.startPolling();
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		var self = this;
		return(
			<div className="pollTest">
				{this.state.data.map(function(node, i) {
					return(
						<div key={node.text}>
						<div className="nodeList" key={node.author}>
							<Avatar imgurl = {node.imgurl} />
							<NodeCore 
								author={node.author} 
								key={node.id} 
								id={node.id} 
								text={node.text} 
								skills={node.skills} 
								topicsurl={self.state.topicsurl}
							/>
						</div>
						</div>
					);
				})}
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
		return {count: 0, skill: this.props.skill, skillBox: 0, messages: [], text: ''};
	},
	componentDidMount: function() {
		var messages = [];
		var self = this;
		socket.emit('subscribe', this.props.skill);
		socket.on('init', this.initialize);
		// socket.on('send', this.messageReceive);
		socket.on('message', function (data) {
	        if(data.message) {
	            messages.push(data.message);
	            self.setState({messages: messages});
	        } else {
	            console.log("There is a problem:", data);
	        }
	    });
	},
	messageReceive: function(message) {
		console.log('hi');
	},
	initialize: function(data) {
		console.log(data);
		console.log(socket);
		// socket.join(data.room);
	},
	handleClick: function() {
		socket.emit('subscribe', this.props.skill);
		this.setState({count: this.state.count+= 1});
		if (this.state.count % 2 == 0) {
			this.setState({skillBox: false});
		}else if (this.state.count % 2 == 1) {
			this.setState({skillBox: true});
		}
	},
	handleSend: function() {
		var self = this;
	   	socket.emit('send', {room: this.state.skill, message: this.state.text});
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value})
	},
	render: function() {
		var self = this;
		var div;
		if (self.state.skillBox == true) {
			div = 
			<div>
				<SkillChat 
					skill={this.state.skill} 
					topicsurl={this.props.topicsurl}
				/>
				<div id="allMessages">
					{this.state.messages.map(function(message, i) {
						return (<div key={i}>{message}</div>)
					})}
				</div>
				<input 
					id="field" 
					onChange={this.handleTextChange} 
					value={this.state.text}
				/>
				<input 
					id="send" 
					type="button" 
					value="send" 
					onClick={this.handleSend}
				/>
			</div>
		}else {
			div = <div></div>
		}
		return (
			<div>
			{div}
			<button onClick={this.handleClick}>Click Me!</button>
			</div>
		);
	}
});

var SkillChat = React.createClass({
	getInitialState: function() {
		return {comments: [{"id": "initialid", "comments": [{"id":"commentid","comment":"initialComment"}]}]};
	},
	componentWillMount: function() {
		this.loadCommentsFromServer();
	},
	startPolling: function() {
		var self = this;
		setTimeout(function() {
			self.loadCommentsFromServer();
		}, 4000);
	},
	loadCommentsFromServer: function() {
		var self = this;
		var topic = {"topic": this.props.skill};
		$.ajax({
			url: this.props.topicsurl,
			dataType: 'json',
			cache: false,
			data: topic,
			success: function(comments) {
				this.setState({comments: comments});
				this.startPolling();
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.topicsurl, status, err.toString());
			}.bind(this)
		});
	},
	handleCommentSubmit: function(comment) {
		$.ajax({
			url: this.props.topicsurl,
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data) {
				this.setState({comments: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		return(
			<div className="SkillChat">
				<SkillBoard comments={this.state.comments} skill={this.props.skill}/>
				<SkillForm onCommentSubmit={this.handleCommentSubmit} comments={this.state.comments} skill={this.props.skill} topicsurl={this.props.topicsurl}/>
			</div>
		);
	}
});

var SkillBoard = React.createClass({
	render: function() {
		var self = this;
		return(
			<div className="skillBoard">
				<div className={self.props.skill}>
					<ul>
					{self.props.comments.map(function(comment, i) {
						return <div key={comment.id}>{comment.comments.map(function(singleComment, i) {
							return <li key={singleComment.id + i}>{singleComment.comment}</li>
						})}</div>
					})}
					</ul>
				</div>
			</div>
		);
	}
});

var SkillForm = React.createClass({
	getInitialState: function() {
		return {text: ''};
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var text = this.state.text.trim();
		var skill = this.props.skill;
		if (!text) {
			return;
		}
		var length = this.props.comments[0].comments.length.toString();
		this.props.onCommentSubmit({id: text + length , comment: text, topic: skill});
		this.refs.Skillfield.reset();
		this.setState({text: ''});
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	render: function() {
		var self = this;
		return(
			<div>
			<form className="skillForm" onSubmit={this.handleSubmit} ref="Skillfield">
			<input type="text" placeholder="Say something..." value={this.state.text} onChange={this.handleTextChange}/>
			<input type="submit"/>
			</form>
			</div>
		);
	}
});




ReactDOM.render(
	<NodeBox url="/api/skills" topicsurl="/api/topics"/>,
	document.getElementById('nodes')
);