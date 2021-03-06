const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');
const {User} = require('./../models/user');
const {
    testTodos, 
    populateTodos, 
    testUsers, 
    populateUsers
} = require('./seed/seed');

beforeEach( populateUsers );
beforeEach( populateTodos );

describe ('Todos Routes:', () => 
{
    describe('POST /todos', () => {
        it('should create a new todo', (done) => {
            var text = 'Test todo text';

            request(app)
                .post('/todos')
                .set('x-auth', testUsers[0].tokens[0].token)
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
                .set('x-auth', testUsers[0].tokens[0].token)
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

    describe('GET /todos', (done) => {
        it('should get all todos', (done) => {
            request(app)
                .get('/todos')
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todos.length).toBe(1);
                })
                .end(done);
        });

        it('should get one todo', (done) => {
            request(app)
                .get(`/todos/${testTodos[0]._id.toHexString()}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(200)
                .expect( (res) => {
                    expect(res.body.todo._id).toBe(testTodos[0]._id.toHexString());
                })
                .end(done);
        });

        it('should not return one todo created by other user', (done) => {
            request(app)
                .get(`/todos/${testTodos[1]._id.toHexString()}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(404)
                .end(done);
        });

        it('should return 404 for todo id not found', (done) => {
            var id = new ObjectID();
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(404)
                .end(done);
        });

        it('should return 404 for not valid object ids', (done) => {
            request(app)
                .get('/todos/123')
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(404)
                .end(done);
        });
    });

    describe('PATCH /todos', (done) => {
        it('should update the todo', (done) => {
            var id = testTodos[0]._id.toHexString();
            var newData = {
                text: 'Updated first todo',
                completed: true
            }

            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .send(newData)
                .expect(200)
                .expect( (res) => {
                    expect(res.body.todo.text).toBe(newData.text);
                    expect(res.body.todo.completed).toBe(true);
                    expect(typeof res.body.todo.completedAt).toBe('string');
                })
                .end(done);
        });

        it('should not update a todo from another user', (done) => {
            var id = testTodos[0]._id.toHexString();
            var newData = {
                text: 'Updated first todo',
                completed: true
            }

            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth', testUsers[1].tokens[0].token)
                .send(newData)
                .expect(404)
                .end(done);
        });

        it('should clear completedAt when todo is not completed', (done) => {
            var id = testTodos[1]._id.toHexString();
            var newData = {
                text: 'Updated second todo',
                completed: false
            }

            request(app)
                .patch(`/todos/${id}`)
                .send(newData)
                .set('x-auth', testUsers[1].tokens[0].token)
                .expect(200)
                .expect( (res) => {
                    expect(res.body.todo.text).toBe(newData.text);
                    expect(res.body.todo.completed).toBe(false);
                    expect(res.body.todo.completedAt).toBe(null);
                })
                .end(done);
        });
    });

    describe('DELETE /todos', (done) => {
        it('should delete a todo', (done) => {
            request(app)
                .delete(`/todos/${testTodos[0]._id.toHexString()}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(200)
                .expect( (res) => {
                    expect(res.body.todo._id).toBe(testTodos[0]._id.toHexString());
                })
                .end( (err, res) => {
                    if(err) {
                        return done(err);
                    }
                    Todo.findById(testTodos[0]._id).then((todo) => {
                        expect(todo).toBeFalsy();
                        done();
                    }).catch( (e) => {
                        done(e);
                    });
                });                
        });

        it('should not delete a todo from another user', (done) => {
            request(app)
                .delete(`/todos/${testTodos[1]._id.toHexString()}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(404)
                .end( (err, res) => {
                    if(err) {
                        return done(err);
                    }
                    Todo.findById(testTodos[0]._id).then((todo) => {
                        expect(todo).toBeTruthy();
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
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(404)
                .end(done);
        });

        it('should return 404 for not valid object ids', (done) => {
            request(app)
                .delete('/todos/123')
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(404)
                .end(done);
        });
    });
});


describe('Users Routes', () => {
    describe('GET /users/me', () => {
        it('should return user if authenticated', (done) => {
            request(app)
                .get('/users/me')
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(200)
                .expect( (res) => {
                    expect(res.body._id).toBe(testUsers[0]._id.toHexString())
                    expect(res.body.email).toBe(testUsers[0].email)
                })
                .end(done);
        });

        it('should return 401 if not authenticated', (done) => {
            request(app)
                .get('/users/me')
                .set('x-auth', null)
                .expect(401)
                .expect( (res) => {
                    expect(res.body).toEqual({});
                })
                .end(done)
        });
    });

    describe('POST /users/login', () => {
        it('should login user and return token', (done) => {
            request(app)
                .post('/users/login')
                .send({email: testUsers[1].email, password: testUsers[1].password})
                .expect(200)
                .expect( (res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                })
                .end((err, res) => {
                    if(err) {
                        return done(err);
                    }

                    User.findById(testUsers[1]._id).then((user => {
                        expect(user.toObject().tokens[1]).toMatchObject({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    })).catch((e) => done(e));
                });
        });

        it('should reject invalid login', (done) => {
            request(app)
            .post('/users/login')
            .send({email: 'asdf', password: testUsers[0].password})
            .expect(400)
            .expect( (res) => {
                expect(res.body).toEqual({});
            })
            .end(done)            
        });
    });

    describe('POST /users', () => {
        it('should create a user', (done) => {
            var email = 'example@example.com';
            var password = '123abc!';

            request(app)
                .post('/users')
                .send({email,password})
                .expect(200)
                .expect( (res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.email).toBe(email);
                })
                .end((err) => {
                    if(err) {
                        return done(err);
                    }

                    User.findOne({email}).then( (user) => {
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
                        done();
                    }).catch((e) => done(e));
                });
        });

        it('should validation errors if request is invalid', (done) => {
            var email = 'example';
            var password = '1';

            request(app)
                .post('/users')
                .send({email,password})
                .expect(400)
                .end(done);            
        });

        it('should not create a user if the email is in use', (done) => {
            request(app)
                .post('/users')
                .send({email: testUsers[0].email,password: '12345678'})
                .expect(400)
                .end(done);            
        });
    });

    describe('GET /users/me/token', () => {
        it('should remove auth token on logout', (done) => {
            request(app)
                .delete('/users/me/token')
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(200)
                .end( (err, res) => {
                    if(err) {
                        return done(err);
                    }
                    User.findById(testUsers[0]._id).then((user) =>{
                        expect(user.tokens.length).toBe(0);
                        done();
                    }).catch( (e) => done(e));
                });
        });

    });
    
});
