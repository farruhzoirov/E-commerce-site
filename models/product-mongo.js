const mongodb= require('mongodb');
const getDb = require('../util/db-mongo').getDb;

class Product {
  constructor(title ,imageUrl, price, description,_id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
    this._id = _id ? new mongodb.ObjectId(_id) : null ;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOption;
    if (this._id) {
      dbOption = db.collection('products').updateOne({_id: this._id}, {$set: this});
    } else {
      dbOption = db.collection('products').insertOne(this);
    }
    return dbOption
        .then((result) => {
          console.log(result)
        })
        .catch((err) => {
          console.log(err)
        })
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products').find().toArray().then((products) => {
      return products;
    }).catch((err) => {
          console.log(err)
        });
  }

  static findById(prodId) {
    return getDb().collection('products').find({_id: new mongodb.ObjectId(prodId)}).next().then(product => {
      console.log(product);
      return product;
    }).catch((err) => {
      console.log(err)
    })
  }

  static deleteById(prodId) {
    const db = getDb()
    return db.collection('products')
        .deleteOne({_id: new mongodb.ObjectId(prodId)})
        .then(() => {
          console.log('Deleted one!')
        }).catch((err) => {
          console.log(err)
        })
  }
}


module.exports = Product;