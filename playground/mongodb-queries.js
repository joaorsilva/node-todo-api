const {ObjectID} = require('mongodb');
const {mongose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id = '5b1979bcc275b74e7b08bc31';

if(!ObjectID.isValid(id)) {
    console.log('ID not valid');
}

// Todo.find({_id: id}).then( (todos) => {
//     console.log('Todos (find)', todos);
// });

// Todo.findOne({_id: id}).then( (todo) => {
//     console.log('Todo (findOne)', todo);
// });

// Todo.findById(id).then( (todo) => {
//     if(!todo)
//     {
//         return console.log('Id not found');
//     }
//     console.log('Todo (findById)', todo);
// }).catch( (e) => console.log(e));