var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var find = require('findit');
var app = express();

var SKILLS_FILE = path.join(__dirname, 'skills.json');
var TOPICS_FILE = path.join(__dirname, '/topics');

var finder = find(TOPICS_FILE);
var jsonFiles = [];

finder.on('directory', function(dir) {
  console.log('Directory: ' + dir + '/')
});
finder.on('file', function(file) {
  var parseFile = file.replace(TOPICS_FILE + '/', '');
  console.log('File: ' + file);
  jsonFiles.push(parseFile);

});

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

app.get('/api/topics', function(req, res) {
  var urlEnd = req.url.indexOf('&_');
  var topic = req.url.slice(18, urlEnd).replace('+', ' ');
  var topicJSON = topic + '.json';
  jsonFiles.forEach(function (file) {
    var fileExtension = file.replace(/^.*\./, '');
    if (file == topicJSON && fileExtension == 'json') {
      var filePath = TOPICS_FILE+'/'+topicJSON;
      fs.readFile(filePath, function(err, data) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        res.json(JSON.parse(data));
      })
    }
  })
});

app.post('/api/topics', function(req, res) {
  var reqData = req.body;
  var topicJSON = reqData.topic + '.json';
  jsonFiles.forEach(function (file) {
    var fileExtension = file.replace(/^.*\./, '');
    if (file == topicJSON && fileExtension == 'json') {
      var filePath = TOPICS_FILE+'/'+topicJSON;
      fs.readFile(filePath, function(err, data) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        var comment = JSON.parse(data);
        var newComment = {
          id: reqData.id,
          comment: reqData.comment
        };
        console.log(comment[0].comments);
        comment[0].comments.push(newComment);
        fs.writeFile(filePath, JSON.stringify(comment, null, 4), function(err) {
          if (err) {
            console.error(err);
            process.exit(1);
          }
          res.json(comment);
        });
      });
    };
  });
});

app.post('/api/skills', function(req, res) {
  fs.readFile(SKILLS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(data);
    var skills = JSON.parse(data);
    var newSkill = {
      id: Date.now(),
      author: req.body.author,
      text: req.body.text,
      skills: req.body.skills,
    };
    skills.push(newSkill);
    fs.writeFile(SKILLS_FILE, JSON.stringify(skills, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(skills);
    });
    newSkill.skills.forEach(function(skillObj) {
      var jsonPath = path.join(__dirname, '/topics/' + skillObj.skill + '.json');
      fs.exists(jsonPath, function(exists) {
        if (exists) {
          console.log("Json File already exists.");
        }else {
          var data = [
            {
              "id": 0,
              "topic": skillObj.skill,
              "comments": []
            }
          ];
          fs.writeFile(jsonPath, JSON.stringify(data, null, 4), {flag: 'wx'}, function(err) {
            if (err) throw err;
            console.log("It's saved!");
            var newJSON = skillObj.skill + '.json'; 
            jsonFiles.push(newJSON);
          });
        }
      })
    })
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
