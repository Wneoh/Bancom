const mongodb = require('mongoDb');
const getDb = require('../util/database').getDb;

module.exports = class Product {
    constructor(title,imageurl,description,price,brand,catagory,specs,id){
        this.title = title;
        this.imageUrl = imageurl;
        this.description = description;
        this.brand = brand;
        this.price = price;
        this.catagory = catagory;
        this.specs=specs;
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
                catagory:this.catagory,
                specs:this.specs
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