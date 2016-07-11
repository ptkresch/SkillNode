var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var SKILLS_FILE = path.join(__dirname, 'skills.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Cache-Control', 'no-cache');
	next();
});

app.get('/api/skills', function(req, res) {
  fs.readFile(SKILLS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/skills', function(req, res) {
  fs.readFile(SKILLS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var skills = JSON.parse(data);
    var newSkill = {
      id: Date.now(),
      author: req.body.author,
      text: req.body.text,
    };
    skills.push(newSkill);
    fs.writeFile(SKILLS_FILE, JSON.stringify(skills, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(skills);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
