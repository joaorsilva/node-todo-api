//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err,client) => {

    if(err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    var db = client.db('TodoApp');

    //Delete many
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then( (result) => {
    //     console.log(result);
    // } );

    //Delete One
    // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then( (result) => {
    //     console.log(result);
    // } );

    //Find one and delete
    db.collection('Todos').findOneAndDelete({completed:false}).then( (result) => {
        console.log(result);
    } );
    //client.close();
});