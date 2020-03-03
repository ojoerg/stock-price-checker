/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var tiny = require('tiny-json-http');

var url = "https://repeated-alpaca.glitch.me/v1/stock/stockticker/quote"
var newstring = url.replace(/stockticker/, 'asdasdasdasd'); 
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;



async function databaseConnect() {
  var dbConnection = await MongoClient.connect(process.env.DATABASE, { useUnifiedTopology: true });
  var db = dbConnection.db("stock-price-checker");
  return db;
}

async function createIp(ip, database) {
  var result = await database.collection("ip-likes").insertOne({ ip: ip, stocks: []});
  return result;
}

async function findOneIp(ip, database) { // data = stock or ip
  var result = await database.collection("ip-likes").findOne({ ip: ip });
  return result;
}

async function findLikes(stock, database) { // data = stock or ip
  var result = await database.collection("ip-likes").find({ stocks: stock}).count();
  return result;
}

async function updateLikes(ipObject, stock, database) { // data = stock or ip
  ipObject.stocks = [...ipObject.stocks, stock]
  var result = await database.collection("ip-likes").updateOne({ _id: ObjectId(ipObject._id) }, { $set: { stocks: ipObject.stocks } });
  return result;
}

async function setOrUpdateIp(ip, stock, database) { // data = stock or ip
  var findIp = await findOneIp(ip, database);
  
  if (findIp === null){
    var ipCreate = await createIp(ip, database);
          findIp = await findOneIp(ip, database);
    var updateIp = await updateLikes(findIp, stock, database);
  } else if (findIp !== null && findIp.stocks.includes(stock) === false){
    var updateIp = await updateLikes(findIp, stock, database);
  }
}

async function getStocks(stock, like, ip) {
  var database = await databaseConnect();
  var results = []; 
  

  var likes =  await findLikes(stock[0], database)

  for (var i = 0; i < stock.length; i++){
   var newUrl = url.replace(/stockticker/, stock[i]);
   var response = await tiny.get({url: newUrl})
   
   if (like === true){
     var ipSetOrUpdate = await setOrUpdateIp(ip, stock[i], database)
     if (i === 0){
       likes =  await findLikes(stock[0], database)
     }
   }
       
   if (stock.length === 1) {
     var results = {stock: response.body.symbol, price: response.body.latestPrice, likes: likes}
   } else {
     if (i === 0) {
       var likesNext = await findLikes(stock[i + 1], database)
     } else {
       var likesNext = await findLikes(stock[i - 1], database)
     }
     
     likes = await findLikes(stock[i], database)

     results.push({stock: response.body.symbol, price: response.body.latestPrice, rel_likes: likes - likesNext})
   }
  }
    
  var result = {"stockData": results}
  return result;
}

async function get(res, stock, like, ip){
  try {
    stock = stock.map(data => data.toLowerCase())
    var stockObject = await getStocks(stock, like, ip)
    if (stockObject === "Invalid Body"){
      res.status(400);
      res.send("invalid data");
    } else {
      res.json(stockObject);
    }
  } catch(error){
    console.log(error)
    res.status(503)
    res.send("remote server not available")
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      var ip = req.ips[0];
      var stock = [],
          like = false;
      
      Object.keys(query).forEach(key => {
        if (key === "stock"){
          Array.isArray(query[key]) === true ? stock = query[key] : stock = [query[key] ]
          
        } else if (key === "like") {
          query[key] === "true" ? like = true : like = false;
        } else {
          res.status(400);
          res.send("invalid data");
        }
      });
      if (stock ===  []) {
        res.status(400);
        res.send("invalid data");
      } else if (stock !== []) {
        stock = [...new Set(stock)];
        get(res, stock, like, ip);
      } else {
        get(res, stock, like, ip);
      }  
    });
    
};
