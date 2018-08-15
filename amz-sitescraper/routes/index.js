const express = require('express');
const _ = require('lodash');
const { check, validationResult } = require('express-validator/check');
const getPageData = require('../src/util/get-page-data');
const Product = require('../src/models/product');

const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index');
});

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
        return res.status(500);
    }
});

router.post('/product', [check('id').isLength({ min: 10, max: 10 }), check('id').isAlphanumeric()], async function (req, res) {
    // validate input 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // scrape data
    let scrapedData;
    try {
        scrapedData = await getPageData(req.body.id);
        await Product.create(scrapedData); // persist
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
    return res.redirect('/product');
});

router.get('/product/:id', [check('id').isLength({ min: 10, max: 10 }), check('id').isAlphanumeric()], async function (req, res) {
    const asin = req.params.id;

    // validate 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400);
    }

    try {
        // retrieve data
        const items = await Product.find({ asin: asin }).exec();

        res.render('product', {
            items: items,
            title: asin
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
});


module.exports = router;
