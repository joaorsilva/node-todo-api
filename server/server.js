require('./config/config.js');

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require ('./models/todo');
var {User} = require ('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req,res) => {

    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then( (doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send();
    }).catch( (e) => {
        res.status(400).send();
    });
});

app.get('/todos', (req,res) => {
    Todo.find({}).then( (todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send();
    }).catch( (e) => {
        res.status(400).send();
    });
});

app.get('/todos/:id', (req, res) => {

    var id=req.params.id;
    //console.log('Received id:', id);
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    } else {
        Todo.findById(id).then( (todo) => {
            if(!todo) {
                return res.status(404).send();
            }
            res.send({todo});
        }, (err) => {
            res.status(404).send();
        }).catch( (e) => {
            res.status(400).send();
        });            
    }
});

app.patch('/todos/:id', (req, res) => {
    var id=req.params.id;
    var body = _.pick(req.body,['text','completed']);
    //console.log('Received id:', id);
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    } else {
        if(_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date();
        } else {
            body.completed = false;
            body.completedAt = null;
        }
        Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then( (todo) => {
            if(!todo) {
                return res.status(404).send();
            }
            res.send({todo});
        }).catch(  (e) => {
            console.log(e);
            res.status(400).send();
        });
    }
});

app.delete('/todos/:id', (req, res) => {
    var id=req.params.id;

    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    } else {
        Todo.findByIdAndRemove(id).then( (todo) => {
            if(!todo) {
                return res.status(404).send();
            }
            res.send({todo});
        }, (err) => {
            res.status(404).send();
        }).catch( (e) => {
            res.status(400).send();
        });            
    }
});

app.post('/users', (req, res) => {
    var user = new User(
        _.pick(req.body,['email','password'])
    );

    user.save().then( () => {
        return user.generateAuthToken();
    }).then( (token) => {
        res.header('x-auth',token).send(user);
    }).catch( (e) => {
        console.log('ERROR:',e);
        res.status(400).send(e);
    });
});

app.listen(3000, () => {
    console.log(`Started at port ${port}`);
});

module.exports = {app}