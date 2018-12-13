/**
 * Created by Administrator on 2018/12/4.
 */
/**
 * Created by Administrator on 2018/12/4.
 */
/**
 * Created by Administrator on 2018/12/3.
 */
$(function () {
    methodsaNumber();
    departmentChart();
    inforChart();
    // rankingChart();
});
function methodsaNumber() {
    var myChart = echarts.init(document.getElementById('activityNumber'));
    var option = {
        tooltip: {
            trigger: 'item'
        },
        xAxis: {
            data: ["活动一","活动一","活动一","活动一","活动一","活动一","活动一"],
            axisLine:{
                lineStyle:{
                    color:"#e2e2e2"
                },
            },
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#666'
                }
            }
        },
        yAxis: {
            splitLine:{
                show:false
            },
            axisLine:{
                lineStyle:{
                    color:"#e2e2e2"
                },
            },
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#666'
                }
            }
        },
        series: [{
            type: 'bar',
            barWidth : 45,
            data: [5, 20, 36, 50, 10, 20,16],
            itemStyle:{
                normal:{
                    color:'#49a9ee'
                }
            }
        }]
    };
    myChart.setOption(option);
}

function departmentChart() {
    var myChart = echarts.init(document.getElementById('distribution_one'));
    var color = ['#FFD86E', '#98D87D', '#48A9EE', '#F3857B'];
    var option = {
            title: {
            text: '5000',
            subtext: '\r\r总人数',
            x: '23%',
            y: '100',
            itemGap: 10,
            textStyle : {
                color : '#666666',
                fontSize : 24,
                fontWeight : 'normal',
            },
            subtextStyle : {
                color : '#989898',
                fontSize : 12
            }
        },
        tooltip: {
            trigger: 'item',
            // formatter: "{a} <br/>{b}: {c} ({d}%)",
            formatter: "{b}",
            icon: "circle",
        },
        legend: {
            icon: "circle",
            itemWidth: 10,
            itemHeight: 10,
            orient: 'vertical',
            x: '63%',
            y:'center',
            textStyle: {
                fontSize: 12,
                color: '#656565'
            },
            data:["研发部\r\r12\r\r30%","产品部\r\r12\r\r30%","测试部\r\r12\r\r30%","行政部\r\r12\r\r30%"]
        },
        series: [
            {
                type:'pie',
                color:color,
                radius: ['55%', '70%'],
                center:['30%','50%'],
                avoidLabelOverlap: false,
                hoveranimation:false,
                formatter: "{b}",
                label: {
                    normal: {
                        show: false,
                    },
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data:[
                    {value:335, name:"研发部\r\r12\r\r30%"},
                    {value:310, name:"产品部\r\r12\r\r30%"},
                    {value:234, name:"测试部\r\r12\r\r30%"},
                    {value:135, name:"行政部\r\r12\r\r30%"},
                ]
            }
        ]
    };
    myChart.setOption(option);
}
function inforChart() {
    var myChart = echarts.init(document.getElementById('distribution_three'));
    var option = {
        tooltip : {
            trigger: 'item',
            // formatter: "({d}%)",
            icon: "circle",
        },
        series : [
            {
                color:['#FFD86E', '#98D87D', '#48A9EE'],
                type: 'pie',
                icon: 'rect',
                radius : '55%',
                center: ['50%', '50%'],
                labelLine:{
                    normal:{
                        length:30
                    }
                },
                data:[
                    {value:335, name:'公司制度',},
                    {value:124, name:'岗位技能'},
                    {value:234, name:'安全性'}
                ],
                itemStyle: {
                    normal : {
                        label : {
                            show : true,
                            icon: "circle",
                            formatter: '{b}\n\r\n{d}%',
                            textStyle : {
                                color : '#999',
                                fontSize :14,
                            },
                        },
                        labelLine : {
                            show : true,
                            lineStyle:{
                                color:"#e2e2e2"
                            },
                        }
                    },
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    myChart.setOption(option);
}

function rankingChart() {
    var dom = document.getElementById("distribution_tow");
    var myChart = echarts.init(dom);
    option = null;
    option = {
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            show: false,
            boundaryGap: [0, 0.01],
        },
        yAxis: {
            type: 'category',
            data: ['40%','40%','40%','40%','40%','40%'],
            axisLine: { show: false},
            axisTick: {show: false},
        },
        series: [
            {
                name: '2011年',
                type: 'bar',
                barWidth: 15,
                itemStyle: {
                    normal: {
                        barBorderRadius: 40,
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: 'rgba(73, 169, 238, 1)'
                        }, {
                            offset: 1,
                            color: 'rgba(73, 169, 238, 1)'
                        }]),
                        areaStyle: {type: 'default'},
                        label : {
                            show: false,
                            position: 'right',
                            textStyle: {
                                color: '#000000'
                            }
                        },
                    },
                },
                data: [63, 85, 154, 26, 48, 58],
            }
        ]
    };
    ;
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}
