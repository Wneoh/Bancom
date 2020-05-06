const mongodb= require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) =>{
    MongoClient.connect("mongodb+srv://wneoh:wneoh@bananacom0-glvvj.mongodb.net/test?retryWrites=true&w=majority")
    .then(client =>{
        console.log('Connected');
        _db = client.db();
        callback(client)
    }).catch(err =>{
        console.log(err);
        throw err;
    });
}

let _db;
const getDb =() =>{
    if(_db){
        return _db;
    }
    throw "No database found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;