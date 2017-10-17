var express = require('express');
var router = express.Router();
var mongo = require('../mongo');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '四川银联数据平台', income: global.income , year_income: global.year_income,
  Credit_62_Sum: global.Credit_62_Sum, Credit_62_Money: global.Credit_62_Money,
  Debit_62_Sum: global.Debit_62_Sum, Debit_62_Money: global.Debit_62_Money,
  Pull_Sum: global.pull_sum, Pull_Money: global.pull_money,
  ccq_sum: global.ccq_Sum, year_ccq_sum: global.year_ccq_sum});
  // res.send('Wahoo! restricted area, click to <a href="/reports/test">logout</a>');
});

module.exports = router;
