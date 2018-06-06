//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err,client) => {

    if(err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    var db = client.db('TodoApp');

    db.collection('Todos').findOneAndUpdate({
        _id: ObjectID('5b185f2085750318879c55f0')
    }, {
        $set: {
            completed: true
        }
    },{
        returnOriginal: false
    }).then( (result) => {
        console.log(result);
    });

    client.close();
});