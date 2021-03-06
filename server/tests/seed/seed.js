const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const testUsers = [
    {
        _id: userOneId,
        email: 'joao@exmple.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId,access: 'auth'},process.env.JWT_SECRET).toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'ceni@exmple.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId,access: 'auth'},process.env.JWT_SECRET).toString()
        }]
        
    }
];

const testTodos = [
    {
        _id: new ObjectID(), 
        text: 'First test todo', 
        _creator: userOneId
    },
    {
        _id: new ObjectID(), 
        text: 'Second test todo', 
        completed:true,
        completedAt: new Date(),
        _creator: userTwoId
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