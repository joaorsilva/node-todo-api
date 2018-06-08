const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const testTodos = [
    {_id: new ObjectID(), text: 'First test todo'},
    {_id: new ObjectID(), text: 'Second test todo', completed:true,completedAt: new Date()}
];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const testUsers = [
    {
        _id: userOneId,
        email: 'joao@exmple.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId,access: 'auth'},'abc123').toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'ceni@exmple.com',
        password: 'userTwoPass',
        
    }
];

const populateTodos = (done) => {
    Todo.remove({}).then( () => {
        return Todo.insertMany(testTodos);
    }).then( () => done());
};

const populateUsers = (done) => {
    User.remove({}).then( () => {
        var userOne = new User(testUsers[0]).save();
        var userTwo = new User(testUsers[1]).save();

        return Promise.all([userOne,userTwo]);
    }).then( () => done());
}

module.exports = {
    testTodos,
    populateTodos,
    testUsers,
    populateUsers
};