var express = require('express');
var router = express.Router();
var mongo = require('../mongo');
var highcharts = require('highcharts');

/* Get reports page. */
router.post('/test',function (req,res,next) {
    mongo.top20institutions.findById(
        req.body.my_date.replace(/-/g,'') ,function (err,result) {
            var top20ins = [];
            var top20ins_M = [];
            var drilldownSeries = [];
            result['Ins'].forEach(function (t) {
                var ins_persent = (t['trans_count']/100/transCount).toFixed(2);
                var ins_M = (t['trans_money']/1000000).toFixed(2);
                top20ins.push({name:t["_id"],y:parseFloat(ins_persent)});
                top20ins_M.push({name:t["_id"],y:parseFloat(ins_M)});});
            res.render('reports',{results:JSON.stringify(top20ins),drilldownResults:JSON.stringify(drilldownSeries),
                results_M:JSON.stringify(top20ins_M)});
        }
    )

});

router.get('/top20institutions',function (req,res) {
    // console.log('T@!');
    // var testdata = [{name:"2716",y:23.2},{name:"4312",y:16.9},{name:"8722",y:11.1},{name:"1452",y:9.9},{name:"else",y:38.9}];
    // res.render('reports',{results:JSON.stringify(testdata)});
    mongo.top20institutions.find(
        {},['_id','Ins'],{
            limit:7,
            sort:{_id:-1}
        },function (err,result) {
            var top20ins = [];

            var drilldownSeries= [];

            var top20ins_M = [];
            console.log(result);

            result[0]['Ins'].forEach(function (t) {
                var ins_persent = (t['trans_count']/100/transCount).toFixed(2);
                var ins_M = (t['trans_money']/1000000).toFixed(2);
                top20ins.push({name:t["_id"],y:parseFloat(ins_persent),drilldown:t["_id"]});
                top20ins_M.push({name:t["_id"],y:parseFloat(ins_M)});
                // How to get drilldown Series?
                /*
                三层循环应该不是最优解决方案，但考虑到数据只显示7天，勉强可以接受。
                */
                var counts = [];
                /* wo zhen de shi sha, wo TMD !!!! */
                for(var i = 6 ; i >= 0; i--)
                {
                    result[i]['Ins'].forEach(function (item)
                    {
                        if(item["_id"] === t["_id"])
                        {
                            counts.push({name:result[i]["_id"],y:item["trans_count"]});
                        }
                    })
                }
                // 下钻机构交易笔数历史趋势
                drilldownSeries.push({name:'交易笔数(笔)',id:t["_id"],data:counts,type:'line',
                    tooltip:{pointFormat:'<span style="' +
                    ':{point.color}">{point.name}</span>: <b>{point.y}<br>'}})
            });
            console.log(top20ins_M);
            // console.log(drilldownSeries);
            res.render('reports',{results:JSON.stringify(top20ins),drilldownResults:JSON.stringify(drilldownSeries),
            results_M:JSON.stringify(top20ins_M)});
        }
    )
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
router.get('/ccq',function (req,res) {
    mongo.ccq_institutions.findOne(
        {_id:global.yestodaytime},function (err,result) {
            var drilldownSeries = [];
            var NUM_L = [{name:'default',y:0}, {name:'AM',y:0}, {name:'HCE',y:0},
                {name:'SP_MST',y:0}, {name:'SP_IC',y:0}, {name:'华为',y:0},
                {name:'小米',y:0}, {name:'中兴',y:0}, {name:'联想',y:0}, {name:'咕咚',y:0}, {name:'Y',y:0}, {name:'Z',y:0}];

            result['Ins'].forEach(function (t) {
                switch (t['_id']['Product_F'])
                {
                    case '1':
                        NUM_L[1]['y']+=t['trans_count'];
                        break;
                    case '2':
                        NUM_L[2]['y']+=t['trans_count'];
                        break;
                    case '3':
                        NUM_L[3]['y']+=t['trans_count'];
                        break;
                    case '4':
                        NUM_L[4]['y']+=t['trans_count'];
                        break;
                    case '5':
                        NUM_L[5]['y']+=t['trans_count'];
                        break;
                    case '6':
                        NUM_L[6]['y']+=t['trans_count'];
                        break;
                    case '7':
                        NUM_L[7]['y']+=t['trans_count'];
                        break;
                    case '8':
                        NUM_L[8]['y']+=t['trans_count'];
                        break;
                    case '9':
                        NUM_L[9]['y']+=t['trans_count'];
                        break;
                    case 'Y':
                        NUM_L[10]['y']+=t['trans_count'];
                        break;
                    case 'Z':
                        NUM_L[11]['y']+=t['trans_count'];
                        break;
                }
            });

            var loop = 12;
            for (var i = 1 ; i < loop; i++)
            {
                if (NUM_L[i]['y'] == 0)
                {
                    NUM_L.splice(i,1);
                    i = i - 1;
                    loop = loop -1;
                }
            }

            res.render('ccq',{results:JSON.stringify(NUM_L)})
            });
        }
    );

module.exports=router;