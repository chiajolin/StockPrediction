/**
 * written by: HAIYING LIU
 */
$(document).ready(function() {
	var url = window.location.href + "";
	var urlItems = url.split('?');
	var stockId = 1;
	var stockName = "AMZN";
	if (urlItems.length > 1) {
		var params = urlItems[1].split('&');
		if (params.length > 1) {
			stockId = params[0].split('=')[1];
			stockName = params[1].split('=')[1];
		}
	}
	

	// $.get('StockHistoricalChart', {
	// stockId : id
	// }, function(responseText) {
	// $('#wojiushishikan').text(responseText);
	// });

	// Show historical data
	$.getJSON('StockHistoricalChart?stockId=' + stockId, function(data) {

		// split the data set into ohlc and volume
		var ohlc = [], volume = [], dataLength = data.length,
		// set the allowed units for data grouping
		groupingUnits = [ [ 'week', // unit name
		[ 1 ] // allowed multiples
		], [ 'month', [ 1, 2, 3, 4, 6 ] ] ],

		i = 0;

		for (i; i < dataLength; i += 1) {
			ohlc.push([ data[i][0], // the date
			data[i][1], // open
			data[i][2], // high
			data[i][3], // low
			data[i][4] // close
			]);

			volume.push([ data[i][0], // the date
			data[i][5] // the volume
			]);
		}

		// create the chart
		Highcharts.stockChart('historical_chart_container', {

			rangeSelector : {
				selected : 1
			},

			title : {
				text : stockName + ' Historical'
			},

			yAxis : [ {
				labels : {
					align : 'right',
					x : -3
				},
				title : {
					text : 'OHLC'
				},
				height : '60%',
				lineWidth : 2
			}, {
				labels : {
					align : 'right',
					x : -3
				},
				title : {
					text : 'Volume'
				},
				top : '65%',
				height : '35%',
				offset : 0,
				lineWidth : 2
			} ],

			tooltip : {
				split : true
			},

			series : [ {
				type : 'line',
				name : stockName,
				data : ohlc,
				dataGrouping : {
					units : groupingUnits
				}
			}, {
				type : 'column',
				name : 'Volume',
				data : volume,
				yAxis : 1,
				dataGrouping : {
					units : groupingUnits
				}
			} ]
		});
	});
	
	// show pie chart of sentiment data
	var csv_path = "diagrams/" + stockName + ".csv";
	$.get(csv_path, function(csv_data) {
        var items = csv_data.split(',');
        
        Highcharts.chart('sentiment_chart_container', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Sentiment Analysis of Tweets'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Sentiment Analysis',
                colorByPoint: true,
                data: [{
                    name: 'Very Positive',
                    y: parseFloat(items[0])
                }, {
                    name: 'Positive',
                    y: parseFloat(items[1])
                }, {
                    name: 'Neutral',
                    y: parseFloat(items[2])
                }, {
                    name: 'Negative',
                    y: parseFloat(items[3])
                }, {
                    name: 'Very Negative',
                    y: parseFloat(items[4])
                }]
            }]
        });
    });
	//Realtime js
	$.getJSON('StockRealtimeChart?stockId=' + stockId, function (data) {

	    // create the chart
	    Highcharts.stockChart('realtime_chart_container', {


	        title: {
	            text: stockName + ' Realtime'
	        },

	        subtitle: {
	            text: 'Using ordinal X axis'
	        },

	        xAxis: {
	            gapGridLineWidth: 0
	        },

	        rangeSelector: {
	            buttons: [{
	                type: 'hour',
	                count: 1,
	                text: '1h'
	            }, {
	                type: 'day',
	                count: 1,
	                text: '1D'
	            }, {
	                type: 'all',
	                count: 1,
	                text: 'All'
	            }],
	            selected: 1,
	            inputEnabled: false
	        },

	        series: [{
	            name: stockName,
	            type: 'area',
	            data: data,
	            gapSize: 5,
	            tooltip: {
	                valueDecimals: 2
	            },
	            fillColor: {
	                linearGradient: {
	                    x1: 0,
	                    y1: 0,
	                    x2: 0,
	                    y2: 1
	                },
	                stops: [
	                    [0, Highcharts.getOptions().colors[0]],
	                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
	                ]
	            },
	            threshold: null
	        }]
	    });
	});
	
	//indicator 
	var seriesOptions = [],
    seriesCounter = 0,
    names = ['rsi', 'macd', 'dma'];

/**
 * Create the chart when all data is loaded
 * @returns {undefined}
 */
function createChart() {

    Highcharts.stockChart('indicator_chart_container', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value;
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'number',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}


$.each(names, function (i, name) {
	var json_path = "stockstatistics/" + stockName + "_" + name + ".json";
	
    $.getJSON(json_path,    function (data) {

        seriesOptions[i] = {
            name: name,
            data: data
        };

        // As we're loading the data asynchronously, we don't know what order it will arrive. So
        // we keep a counter and create the chart when all the data is loaded.
        seriesCounter += 1;
        
        if (seriesCounter === names.length) {
            createChart();
        }
    }).error(function(jqXHR, textStatus, errorThrown) {
        console.log("error " + textStatus);
        console.log("incoming Text " + jqXHR.responseText);
    });
});

var naive_bayes_path = "predictalg/" + stockName + "_baysian.txt";
$.get(naive_bayes_path, function(data) {
	var params = data.split(",");
	var change = Number(params[1]);
	var textColorPre = "<p style=\"color:#000000\">";
	var textColorPost = "</p>";
	if (change > 0.00000001) {
		textColorPre = "<p style=\"color:#00FF00\">";
	}
	else if (change < -0.00000001) {
		textColorPre = "<p style=\"color:#FF0000\">";
	}
	
	$("#naive_bayes_predict_value").html(params[0]);
	$("#naive_bayes_predict_change").html(textColorPre + change * 100 + "%" + textColorPost);
});
var svm_path = "predictalg/" + stockName + "_svm.txt";
$.get(svm_path, function(data) {
	var params = data.split(",");
	var change = Number(params[1]);
	var textColorPre = "<p style=\"color:#000000\">";
	var textColorPost = "</p>";
	if (change > 0.00000001) {
		textColorPre = "<p style=\"color:#00FF00\">";
	}
	else if (change < -0.00000001) {
		textColorPre = "<p style=\"color:#FF0000\">";
	}
	
	$("#svm_predict_value").html(params[0]);
	$("#svm_predict_change").html(textColorPre + change * 100 + "%" + textColorPost);
});
var ann_path = "predictalg/" + stockName + "_ann.txt";
$.get(ann_path, function(data) {
	var params = data.split(",");
	var change = Number(params[1]);
	var textColorPre = "<p style=\"color:#000000\">";
	var textColorPost = "</p>";
	if (change > 0.00000001) {
		textColorPre = "<p style=\"color:#00FF00\">";
	}
	else if (change < -0.00000001) {
		textColorPre = "<p style=\"color:#FF0000\">";
	}
	
	$("#ann_predict_value").html(params[0]);
	$("#ann_predict_change").html(textColorPre + change * 100 + "%" + textColorPost);
});
}); // document.ready