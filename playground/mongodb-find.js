//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

//Object destructuring
// var user = {name: 'Joao', age:47};
// var {name} = user;
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err,client) => {

    if(err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    var db = client.db('TodoApp');

    // db.collection('Todos').find({_id: ObjectID('5b185f2085750318879c55f0')}).toArray().then( (docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2))
    // }, (err) => {
    //     console.log("Unable to fetch todos");
    // });

    db.collection('Todos').find().count().then( (count) => {
        console.log('Todos count:',count);
    }, (err) => {
        console.log("Unable to fetch todos");
    });  
    
    db.collection('Users').find({name: "Joao Ribeiro da Silva"}).toArray().then( (docs) => {
        console.log('Todos');
        console.log(JSON.stringify(docs, undefined, 2))
    }, (err) => {
        console.log("Unable to fetch todos");
    });
    

    client.close();
});