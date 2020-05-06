const mongodb = require('mongoDb');
const getDb = require('../util/database').getDb;

module.exports = class Product {
    constructor(title,imageurls,desp,price,brand,catagory,id){
        this.title = title;
        this.imageUrls = imageurls;
        this.desp = desp;
        this.brand = brand;
        this.price = price;
        this.catagory = catagory;
        this._id= id ? new mongodb.ObjectId(id): null;
    }

    save(){
        const db = getDb();
        let dbOp;
        if(this._id){
            dbOp =db.collection('products')
            .updateOne({_id:this._id},{$set:{
                title:this.title,
                desp:this.desp,
                brand:this.brand,
                price:this.price,
                catagory:this.catagory

            }});
        }else{
            dbOp =db.collection('products').insertOne(this);
        }
         return dbOp
         .then(result => {
            console.log(result);
        }).catch(err =>{
            console.log(err);
        });
    }

    static fetchAll(){
        const db = getDb()
        return db
        .collection('products').find().toArray()
        .then(products =>{
            //console.log(products);
            return products;
        })
        .catch(err =>{
            console.log(err);
        });
    }

    static findbyId(pId){
        const db = getDb()
        return db
        .collection('products')
        .find({
            _id: new mongodb.ObjectId(pId)
        }).next().then(product =>{
            console.log(product);
            return product;
        })
        .catch(err =>{
            console.log(err);
        });
    }

    static deleteById(pId){
        const db = getDb();
        return db
        .collection('products')
        .deleteOne({_id:new mongodb.ObjectId(pId)})
        .then(
            result=>{
                console.log("Deleted");
            }
        ).catch(err=>{
                console.log(err);
        });
    }
    
}