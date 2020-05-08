const mongodb = require('mongoDb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User{
    constructor(username, email, password){
        this.name = username,
        this.email = email,
        this.password = password;
    }

    save(){
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    static findUser(email,password){
        email = user.email;
        password = user.pw;
        const db = getDb();
        return db
        .collection('users')
        .findOne({
            "email": email,
            "password":password
        })
    }
    static checkEmail(checkemail){
        const db = getDb();
            return db.collection('users').findOne({email: checkemail}).then(result=>{
                return result !== null;
            })
    }
    static findById(userId){
        const db = getDb();
        return db
        .collection('users')
        .findOne({
            _id: new ObjectId(userId)
        })
    }
}


module.exports = User;