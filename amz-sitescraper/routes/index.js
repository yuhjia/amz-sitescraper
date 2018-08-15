const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index');
});

const getPageData = require('../src/util/get-page-data');
const Product = require('../src/models/product');

router.get('/product', async function (req, res) {
    // list products
    try {
        // retrieve data
        const items = await Product.find({}).exec();
        const uniqueItems = _.uniqBy(items, 'asin');

        res.render('products', {
            items: uniqueItems,
            title: 'List of PRODUCTS'
        });
    } catch (err) {
        console.log(err);
    }
});

router.post('/product', async function (req, res) {
    let scrapedData;
    try {
        scrapedData = await getPageData(req.body.id);
        await Product.create(scrapedData); // persist
    } catch (err) {
        console.log(err);
    }
    return res.redirect('/product');
});

router.get('/product/:id', async function (req, res) {
    const asin = req.params.id;

    try {
        // retrieve data
        const items = await Product.find({ asin: asin }).exec();

        res.render('product', {
            items: items,
            title: asin
        });
    } catch (err) {
        console.log(err);
    }
});


module.exports = router;
