var mongoose = require("mongoose");  //引用mongoose
// var dateformat = require("dateformat");

Date.prototype.Format = function(fmt)
{ //author: yyf
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

mongoose.Promise=global.Promise;

mongoose.set('debug','true');
var ywbdb = mongoose.connect('mongodb://01202875:keepCa1m@172.16.225.200:27017/ywbtrans');

// var ywbdb = mongoose.createConnection('172.16.225.200','ywbtrans');
ywbdb.connection.on('error',console.error.bind(console,'connection error:'));
ywbdb.connection.once('open',function () {
    console.log('opened!');
});

var transSchema;
var transModelSum;

/* 当天时间,字符串类型，格式为：20170811 */
var date = new Date();
// var daytime = new Date().Format("yyyyMMdd");
date.setDate(date.getDate()-1);
global.yestodaytime = date.Format("yyyyMMdd");

/* 必须设置_id的类型，因为Mongodb中的id字段被设置为string了，默认应该是object */
transSchema=new mongoose.Schema(
    {_id:String}
);

InsSchema = new mongoose.Schema(
    {_id: String,
    Ins:[]}
);

var top20institutions = exports.top20institutions = ywbdb.model('top20institutions',InsSchema);
var ccq_institutions = exports.ccq_institutions = ywbdb.model('ccq_institutions',InsSchema);

transModelSum = ywbdb.model('trans_sum',transSchema,'trans_sum');
var Token = ywbdb.model('ywbtrans_'+yestodaytime,transSchema);
exports.ywbdb = ywbdb;

transModelSum.findById(yestodaytime,function (error,result) {
    if(error){
        console.log(error);
    }else{
        global.transCount = result.toJSON()['trans_counts'];
        global.transMoney = result.toJSON()['trans_money'];
        global.Credit_62_Money = result.toJSON()['Credit_62_Money'];
        global.Credit_62_Sum = result.toJSON()['Credit_62_Sum'];
        global.Debit_62_Money = result.toJSON()['Debit_62_Money'];
        global.Debit_62_Sum = result.toJSON()['Debit_62_Sum'];
        global.ccq_Sum = result.toJSON()['ccq_Sum'];
        global.income = result.toJSON()['income'];
        global.year_income = result.toJSON()['Whole_year'][1]['Whole_year_income'];
        global.pull_money = result.toJSON()['Pull_Money'];
        global.pull_sum = result.toJSON()['Pull_Sum'];
        global.year_ccq_sum = result.toJSON()['Whole_year'][7]['Whole_year_ccq'];
}
    // ywbdb.disconnect()
});


/* 报表数据提前生成 */
Token
    .aggregate(
        [
            {$match:{"CLEARING_SEND_CODE":{$regex:/....6[5,6,7,8]/}}},
            {$project:{
                csc_567:{$substr:["$CLEARING_SEND_CODE",0,4]},
                "FLD4_TRANS_MONEY":1
            }},
            {$group:{_id:"$csc_567",trans_count:{$sum:1},trans_money:{$sum:"$FLD4_TRANS_MONEY"}}},
            {$sort:{trans_count:-1}},
            {$limit:20}
        ]
    )
    .exec(function (err,tokenDocument) {
        // var _id = new Date().toLocaleDateString();
        var item = [];
        if(tokenDocument){
            tokenDocument.forEach(function (element) {
                item.push(element)
            })
        };
        new top20institutions({_id:yestodaytime,Ins:item}).save(function (error) {
            if(error)
            {
                console.log(error)
            }
        });
    });

/*  产品标识：
    0 - 缺省,
    1 - AM,
    2 - HCE,
    3 - SP-MST,
    4 - SP-IC,
    5 - 华为,
    6 - 小米,
    7 - 中兴,
    8 - 联想,
    9 - 咕咚,
    Y - 主扫,
    Z - 被扫.
*/
Token
    .aggregate(
        [
        {$match:{'PRODUCT_FLAG':{$in:["1","2","3","4","5","6","7","8","9","Y","Z"]}}},
        {$project:
            {'DEP_BANK_CODE':{$substr:["$DEP_BANK_CODE",0,4]},
                _id:0,
                'FLD4_TRANS_MONEY':1,
                'PRODUCT_FLAG':1}
        },
        {$group:{_id:{BANK_CODE:"$DEP_BANK_CODE",Product_F:"$PRODUCT_FLAG"},
            trans_count:{$sum:1},trans_money:{$sum:"$FLD4_TRANS_MONEY"}}},
        {$sort:{trans_count:-1}}
        ]
    )
    .exec(function (err,Documents) {
        var item = [];
        if(err)
        {
            console.log(err)
        }
        if(Documents)
        {
            new ccq_institutions({_id:yestodaytime,Ins:Documents}).save(function (err) {
                if(err)
                {
                    console.log(err)
                }
            })
        }
    });

// ywbdb.model('ywbtrans_20170729',transSchema,'ywbtrans_20170729').aggregate(
//     [
//         {$match:{"CLEARING_SEND_CODE":{$regex:/....6[5,6,7,8]/}}},
//         {$project:{
//             csc_567:{$substr:["$CLEARING_SEND_CODE",0,4]},
//             "FLD4_TRANS_MONEY":1
//         }},
//         {$group:{_id:"$csc_567",trans_count:{$sum:1},trans_money:{$sum:"$FLD4_TRANS_MONEY"},}},
//         {$sort:{trans_count:-1}},
//         {$limit:20}
//     ],function (error,result) {
//         if(error){
//             console.log(error);
//         }else{
//             getinslist('top20institutions',result);
//         }
//     });

// insert data into mongodb
// var doc = {name:'Kurky'};
// transEntity=new transModel(doc);
// transEntity.save(function (error) {
//     if(error){
//         console.log(error);
//     }
//     else{
//         console.log('saved OK!');
//     }
//
//     // 关闭数据库连接
//     ywbdb.disconnect();
// });
//
// transModel.create(doc,function (error) {
//     if(error){
//         console.log(error);
//     }else {
//         console.log('saved OK!');
//     }
//     ywbdb.disconnect();
// })
// console.log(transEntity.name);
