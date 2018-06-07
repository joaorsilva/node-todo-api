const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');

const testTodos = [
    {_id: new ObjectID(), text: 'First test todo'},
    {_id: new ObjectID(), text: 'Second test todo'}
];

beforeEach( (done) => {
    Todo.remove({}).then( () => {
        return Todo.insertMany(testTodos);
    }).then( () => done());
});

describe ('Todos Routes:', () => 
{
    describe('POST', () => {
        it('should create a new todo', (done) => {
            var text = 'Test todo text';

            request(app)
                .post('/todos')
                .send({text})
                .expect(200)
                .expect( (res) => {
                    expect(res.body.text).toBe(text);
                })
                .end( (err,res) => {
                    if(err) {
                        return done(err);
                    }

                    Todo.find({text}).then( (todos) => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    }).catch( (e) => done(e) );
                });
        });

        it('shoukd not create todo with invalid data', (done) => {
            request(app)
                .post('/todos')
                .send({})
                .expect(400)
                .end( (err, res) => {
                    if(err) {
                        return done(err);
                    }

                    Todo.find().then( (todos) => {
                        expect(todos.length).toBe(testTodos.length);
                        testTodoId = todos[0]._id.toString();
                        done();
                    }).catch( (e) => done(e) );
                });
        });
    });

    describe('GET', (done) => {
        it('should get all todos', (done) => {
            request(app)
                .get('/todos')
                .expect(200)
                .expect((res) => {
                    expect(res.body.todos.length).toBe(testTodos.length);
                })
                .end(done);
        });

        it('should get one todo', (done) => {
            request(app)
                .get(`/todos/${testTodos[0]._id.toHexString()}`)
                .expect(200)
                .expect( (res) => {
                    expect(res.body.todo._id).toBe(testTodos[0]._id.toHexString());
                })
                .end(done);
        });

        it('should return 404 for todo id not found', (done) => {
            var id = new ObjectID();
            request(app)
                .get(`/todos/${id}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 for not valid object ids', (done) => {
            request(app)
                .get('/todos/123')
                .expect(404)
                .end(done);
        });
    });

    describe('DELETE', (done) => {
        it('should delete a todo', (done) => {
            request(app)
                .delete(`/todos/${testTodos[0]._id.toHexString()}`)
                .expect(200)
                .expect( (res) => {
                    expect(res.body.todo._id).toBe(testTodos[0]._id.toHexString());
                })
                .end( (err, res) => {
                    if(err) {
                        return done(err);
                    }
                    Todo.findById(testTodos[0]._id).then((todo) => {
                        expect(todo).toBe(null);
                        done();
                    }).catch( (e) => {
                        done(e);
                    });
                });                
        });

        it('should return 404 for todo id not found', (done) => {
            var id = new ObjectID();
            request(app)
                .delete(`/todos/${id}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 for not valid object ids', (done) => {
            request(app)
                .delete('/todos/123')
                .expect(404)
                .end(done);
        });
    });

});
