// const sequelize = require('../util/database');
// const Sequelize = require("sequelize");
//
//
// const Products = sequelize.define('products', {
//   id: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   title: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   price: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type:Sequelize.STRING,
//     allowNull:null
//   }
// });
//
//
// module.exports = Products;


//
//
// module.exports = class Products {
//   constructor(title, price, description, imageUrl) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//   }
//
//
//   save() {
//     return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES(? ,? ,? ,?)', [this.title, this.price, this.description, this.imageUrl]);
//   }
//
//
//   static fetchAll() {
//     return db.execute('SELECT * FROM products ');
//   }
//
//   static findById(id) {
//      return db.execute('SELECT * FROM products where products.id = ?', [id]);
//   }
// }






