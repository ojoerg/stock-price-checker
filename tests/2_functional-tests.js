/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = 'https://stock-price-checker-gitloeti.glitch.me';

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.timeout(8000);
  
    suite('GET /api/stock-prices => stockData object', function() {
     
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({
           stock: 'goog'
         })
        .end(function(err, res){
          assert.isObject(res.body);
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.propertyVal(res.body.stockData, "stock", 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({
           stock: 'goog'
         })
        .end(function(error, response) {
          chai.request(server)
          .get('/api/stock-prices')
          .query({
             stock: 'goog',
             like: "true"
           })
          .end(function(err, res){
            assert.isObject(res.body);
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.property(res.body.stockData, 'stock');
            assert.propertyVal(res.body.stockData, "stock", 'GOOG');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.propertyVal(res.body.stockData, 'likes', response.body.stockData.likes + 1);
            done();
          });
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({
           stock: 'goog'
         })
        .end(function(error, response) {
          chai.request(server)
          .get('/api/stock-prices')
          .query({
             stock: 'goog',
             like: "true"
           })
          .end(function(err, res){
            assert.isObject(res.body);
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.property(res.body.stockData, 'stock');
            assert.propertyVal(res.body.stockData, "stock", 'GOOG');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.propertyVal(res.body.stockData, 'likes', response.body.stockData.likes);
            done();
          });
        });
      });
     
      test('2 stocks', function(done) {
       chai.request(server)
        .get("/api/stock-prices")
        .query({
           stock: 'goog'
         })
        .end(function(error, response) {
          chai.request(server)
          .get("/api/stock-prices")
          .query({
             stock: 'msft'
           })
          .end(function(error2, response2) {
            chai.request(server)
            .get('/api/stock-prices')
            .query('stock=goog&stock=msft')
            .end(function(err, res){
              assert.isObject(res.body);
              assert.equal(res.status, 200);
              assert.property(res.body, 'stockData');
              assert.isArray(res.body.stockData);
              assert.property(res.body.stockData[0], 'stock');
              assert.propertyVal(res.body.stockData[0], "stock", 'GOOG');
              assert.property(res.body.stockData[0], 'price');
              assert.property(res.body.stockData[0], 'rel_likes');
              assert.propertyVal(res.body.stockData[0], 'rel_likes', response.body.stockData.likes - response2.body.stockData.likes);
              assert.property(res.body.stockData[1], 'stock');
              assert.propertyVal(res.body.stockData[1], "stock", 'MSFT');
              assert.property(res.body.stockData[1], 'price');
              assert.property(res.body.stockData[1], 'rel_likes');
              assert.propertyVal(res.body.stockData[1], 'rel_likes', response2.body.stockData.likes - response.body.stockData.likes);              
              done();
            });
          })
        })
      });
       
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({
           stock: 'goog'
         })
        .end(function(error, response) {
          chai.request(server)
          .get("/api/stock-prices")
          .query({
             stock: 'msft'
           })
          .end(function(error2, response2) {
            chai.request(server)
            .get('/api/stock-prices')
            .query('stock=goog&stock=msft&like=true')
            .end(function(err, res){
              assert.isObject(res.body);
              assert.equal(res.status, 200);
              assert.property(res.body, 'stockData');
              assert.isArray(res.body.stockData);
              assert.property(res.body.stockData[0], 'stock');
              assert.propertyVal(res.body.stockData[0], "stock", 'GOOG');
              assert.property(res.body.stockData[0], 'price');
              assert.property(res.body.stockData[0], 'rel_likes');
              assert.propertyVal(res.body.stockData[0], 'rel_likes', response.body.stockData.likes - response2.body.stockData.likes);
              assert.property(res.body.stockData[1], 'stock');
              assert.propertyVal(res.body.stockData[1], "stock", 'MSFT');
              assert.property(res.body.stockData[1], 'price');
              assert.property(res.body.stockData[1], 'rel_likes');
              assert.propertyVal(res.body.stockData[1], 'rel_likes', response2.body.stockData.likes - response.body.stockData.likes + 1);              
              done();
            });
          })
        })
      });
      
    });

});
