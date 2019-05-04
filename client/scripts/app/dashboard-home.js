/*
|--------------------------------------------------------------------------
| Shards Dashboards: Blog Overview Template
|--------------------------------------------------------------------------
*/

'use strict';

window.network = "ethereum";
window.exponent = 12;

window.statistics = {};
window.reorgs = {};



const stats_collection_rate = 20;

// initialize with ethereum
$.ajax({url: "http://chainwatch.info/api/statistics?=ethereum", success: function(stats){
  console.log(stats);
  window.statistics[window.network] = stats;

  $.ajax({url: "http://chainwatch.info/api/reorg_events?network=etheruem", success: function(reorg){
    console.log(reorg);
    window.reorgs[window.network] = reorg;

     // draw the dashboard
     $(document).ready(function () {
       init();
     });
 }});
}});


// DL Ropsten stats in the background
$.ajax({url: "http://chainwatch.info/api/statistics?network=ropsten", success: function(stats){
  window.statistics["ropsten"] = stats;
}});
$.ajax({url: "http://chainwatch.info/api/reorg_events?network=ropsten", success: function(reorg){
  window.reorgs["ropsten"] = reorg;
}});

$('#chart-select').change(generateChart);


function init(){
  console.log("Initializing");
  const STATS = window.statistics[window.network];

  // SET:
  // window.statistics
  // window.reorgs
  // window.density 


  // replace instances of "NETWORK-NAME" with the actual network
  var elements = $(".network-name");
  var networkCap = window.network.charAt(0).toUpperCase() + window.network.slice(1)
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    var newText = e.innerHTML.replace("Ethereum", "NETWORK-NAME");
    newText = newText.replace("Ropsten", "NETWORK-NAME");
    newText = newText.replace("NETWORK-NAME", networkCap);
    e.innerHTML = newText;
  }

  //
  /* -------------------- Small Stats -------------------- */
  /* 1 stat reading: 5 minutes, 24 hours: ~288 stats readings */
  var numBlocks24hr = 288;

  var hashrate_avg = 0;
  var blocktime_avg = 0;
  var miners24Hours = {};

  var latestStats;

  var count = 0;


  // generate mini hourly graphs throughout 24 hours
  var hashratePoints = [];
  var blocktimePoints = [];
  var difficultyPoints = [];

  // calc averages throughout 24 hours 
  for(var i=STATS.length-1; i>=0; i--){
    var s = STATS[i];
    if(s.network == network){
      if(latestStats == undefined) latestStats = s;
      hashrate_avg += s.hashrate;
      blocktime_avg += s.blockTime;
      count++;

      // add to hourly chart 
      if(count % (numBlocks24hr/24) == 0){
        hashratePoints.push(s.hashrate);
        blocktimePoints.push(s.blockTime);
        difficultyPoints.push(s.difficulty);
      }

      for(var m in s.miners){
        var curr = miners24Hours[m];
        if(curr == undefined) curr = 0;
        miners24Hours[m] = curr+s.miners[m];
      }

      // done averaging
      if(count == numBlocks24hr) break;
    }
  }

  hashrate_avg = Math.round(hashrate_avg/numBlocks24hr);
  blocktime_avg = Math.round(blocktime_avg/numBlocks24hr * 10)/10;

  // FORKED BLOCKS
  // TODO

  // HASHRATE
  var ograte = hashrate_avg;
  console.log("Hashrate: " + ograte);
  // convert to TH/s
  var hashrate = Math.round(ograte / (10**window.exponent));
  var hashText = hashrate + " " + unit() + "/s";

  // BLOCKTIME
  var blockTime = blocktime_avg;
  console.log("Block Time: " + blockTime);

  // Miner density 
  var key;
  var largestShare = 0;
  for(var m in miners24Hours){
    if(miners24Hours.hasOwnProperty(m)){
      if(miners24Hours[m] > largestShare){
        largestShare = miners24Hours[m];
        key = m;
      }
    }
  }  
  largestShare= (largestShare/stats_collection_rate/numBlocks24hr).toFixed(2);
  console.log("Largest hashrate share: " + largestShare);

  // DIFFICULTY
  var difficulty = parseInt(latestStats.difficulty).toExponential(3);

  // change values of small stats
  // TODO
  $('.count.forked').text("?");
  $('.count.hashrate').text(hashText);
  $('.count.blocktime').text(blockTime + " s");
  $('.count.minershare').text(Math.round(largestShare*100) + "%");
  $('.count.difficulty').text(difficulty);

  // difficulty
  var difficulty = latestStats.difficulty;

  // Datasets
  var boSmallStatsDatasets = [
  {
    backgroundColor: 'rgb(0,123,255,0.1)',
    borderColor: 'rgb(0,123,255)',
    data: hashratePoints
  },
  {
    backgroundColor: 'rgba(255,180,0,0.1)',
    borderColor: 'rgb(255,180,0)',
    data: blocktimePoints
  },
  {
    backgroundColor: 'rgba(255,65,105,0.1)',
    borderColor: 'rgb(255,65,105)',
    data: difficultyPoints
  },
  {
    backgroundColor: 'rgba(0, 184, 216, 0.1)',
    borderColor: 'rgb(0, 184, 216)',
    data: [],
  },
  {
    backgroundColor: 'rgba(23,198,113,0.1)',
    borderColor: 'rgb(23,198,113)',
    data: []
  },
  ];

  // Options
  function boSmallStatsOptions(max) {
    return {
      maintainAspectRatio: true,
      responsive: true,
        legend: {
          display: false
        },
        tooltips: {
          enabled: false,
          custom: false
        },
        elements: {
          point: {
            radius: 0
          },
          line: {
            tension: .4
          }
        },
        scales: {
          xAxes: [{
            gridLines: false,
            scaleLabel: false,
            ticks: {
              display: false
            }
          }],
          yAxes: [{
            gridLines: false,
            scaleLabel: false,
            ticks: {
              display: false,
              // Avoid getting the graph line cut of at the top of the canvas.
              // Chart.js bug link: https://github.com/chartjs/Chart.js/issues/4790
              suggestedMax: max
            }
          }],
        },
      };
    }

  // Generate the small charts
  boSmallStatsDatasets.map(function (el, index) {
    var chartOptions = boSmallStatsOptions(Math.max.apply(Math, el.data) + 1);
    var ctx = document.getElementsByClassName('blog-overview-stats-small-' + (index + 1));
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5", "Label 6", "Label 7"],
        datasets: [{
          label: 'Today',
          fill: 'start',
          data: el.data,
          backgroundColor: el.backgroundColor,
          borderColor: el.borderColor,
          borderWidth: 1.5,
        }]
      },
      options: chartOptions
    });
  });

  /* -------------------- Network Trends Graph -------------------- */

  // generate hashrate data for the chart
  var parsedData = [];
  for(var i=0; i<STATS.length; i++){
    var s = STATS[i];
    if(s.network == network){
      if(s.hasOwnProperty("hashRate")) { 
        var hash = s.hashRate;
      } else if(s.hasOwnProperty("hashrate")){
        var hash = s.hashrate;
      }
      parsedData.push({timestamp: Date.parse(s.timestamp), hashrate: hash, blockTime: s.blockTime, difficulty: s.difficulty});
    }
  } 

  // smooth the actual points
  var hashratePoints = [];
  var blocktimePoints = [];
  var difficultyPoints = [];

  var dateLabels = [];

  // collect for every 2 hours
  var windowSize = 24;

  var i = windowSize-1;
  
  // collect average of _ measurements
  while(i<parsedData.length){
    var hashSum = 0;
    var blocktimeSum = 0;
    var difficultySum = 0;
    var timeSum = 0;
    for(var j=windowSize-1; j>=0; j--){
      hashSum += parsedData[i-j].hashrate;
      blocktimeSum += parsedData[i-j].blockTime;
      difficultySum += Math.round(parsedData[i-j].difficulty / (10**window.exponent));
      timeSum += parsedData[i-j].timestamp;
    }

    hashratePoints.push(Math.round(hashSum/windowSize));
    blocktimePoints.push(blocktimeSum/windowSize);
    difficultyPoints.push(Math.round(difficultySum/windowSize * 10**window.exponent));

    dateLabels.push(convertDate(timeSum/windowSize));
    i+=windowSize;
  }


  // assign to window
  window.dateLabels = dateLabels;
  window.hashratePoints = hashratePoints;
  window.blocktimePoints = blocktimePoints;
  window.difficultyPoints = difficultyPoints;


  generateChart(1);
}

function changeNetwork(){
  if(window.network == "ropsten"){
    window.network = "ethereum";
    window.exponent = 12;
  } else {
    window.network="ropsten";
    window.exponent = 6;
  }
  init();
  return false;
}

function convertDate(timestamp){
  var d = new Date(timestamp);
  return d.toLocaleString();
}

function formDateTicks(datestring){
  var d = moment(datestring);
  return d.format('MMM D');
}

function formDateTitle(datestring){
  var d = moment(datestring);
  return d.format('MMM D, hh:mm A');
}

function unit(){
  if(window.exponent == 12) return "TH";
  return "MH";
}

/* 1: hashrate, 2: blocktime, 3:difficulty */ 
function generateChart(){
  var dataType = $("#chart-select").val();

  var trendsCTX = document.getElementsByClassName('network-trends-graph')[0];
  // Data
  var trendsData = {
    // Generate the days labels on the X axis.
    labels: window.dateLabels,
    datasets: "NOT-SET"
  };

  var mostRecent = "";

  // Options
  var trendsOptions = {
    responsive: true,
    legend: {
      position: 'top'
    },
    elements: {
      line: {
        // A higher value makes the line look skewed at this ratio.
        tension: 0.3
      },
      point: {
        radius: 0
      }
    },
    scales: {
      xAxes: [{
        gridLines: false,
        ticks: {
          callback: function (tick, index) {
            var date = tick.slice(0,tick.indexOf(","));
            if(date != mostRecent){
              mostRecent = date;
              return formDateTicks(date);
            } else {
              return '';
            }
          },
          autoSkip: false
        }
      }],
      yAxes: "NOT-SET",
    },
    animation: {
      duration: 100000
    },
    hover: {
      mode: 'nearest',
      intersect: false
    },
    tooltips: {
      custom: false,
      mode: 'nearest',
      intersect: false,
      callbacks: {
        title: function(tooltipItem, data) {
            // process dates
            var datestring = data.labels[tooltipItem[0].index];
            return formDateTitle(datestring);
        },
        label: function(tooltipItem, data) {
            return "NOT-SET";
        }
      }
    }
  };

  if(dataType == 1){

    trendsData.datasets = [{
      label: 'Network Hashrate',
      fill: 'start',
      responsive:true,
      data: window.hashratePoints,
      backgroundColor: 'rgba(0,123,255,0.1)', // change for other options
      borderColor: 'rgba(0,123,255,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3
    }];

    trendsOptions.scales.yAxes = [{
        ticks: {
          min: 0,
          max: Math.round(Math.max.apply(null, window.hashratePoints) * 1.5),
          callback: function (tick, index, ticks) {
            if (tick === 0) {
              return tick;
            }
            // Format the amounts using units/s
            return tick >= 10**window.exponent ? Math.round(tick/10**window.exponent) + ' ' + unit() + '/s' : '';
          }
        }
      }];

    trendsOptions.tooltips.callbacks.label = function(tooltipItem, data) {
        var d = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        return (d/(10**window.exponent)).toFixed(2) +  ' ' + unit() +'/s';
    }

    // keep default color and data
  } else if (dataType == 2){
    // block time graph
    trendsData.datasets = [{
      label: 'Average Time Per Block',
      fill: 'start',
      responsive:true,
      data: window.blocktimePoints,
      backgroundColor: 'rgba(255,180,0,0.1)', // change for other options
      borderColor: 'rgb(255,180,0)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3
    }];

    // scale y axis
    trendsOptions.scales.yAxes = [{
        ticks: {
          min: 0,
          max: 25,
          callback: function (tick, index, ticks) {
            if (tick === 0) {
              return tick;
            }
            // Format the amounts using TH/s
            return tick + ' s';
          }
        }
      }];

      trendsOptions.tooltips.callbacks.label = function(tooltipItem, data) {
            var d = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return (d).toFixed(2) +  ' seconds';
      }
  } else if (dataType == 3){
    // difficulty graph

    trendsData.datasets = [{
      label: 'Network Difficulty',
      fill: 'start',
      data: window.difficultyPoints,
      responsive:true,
      backgroundColor: 'rgba(255,65,105,0.1)',
      borderColor: 'rgb(255,65,105)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3
    }];

    // scale y axis
    trendsOptions.scales.yAxes = [{
        ticks: {
          min: 0,
          max: Math.round(Math.max.apply(null, window.difficultyPoints) * 1.5),
          callback: function (tick, index, ticks) {
            if (tick === 0) {
              return tick;
            }
            // Format the amounts using TH/s
            return tick >= 10**window.exponent? Math.round(tick/10**window.exponent) + ' ' +  unit() + '/s' : '';
          }
        }
      }];

    trendsOptions.tooltips.callbacks.label = function(tooltipItem, data) {
        var d = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        return (d/(10**window.exponent)).toFixed(2) +  ' ' + unit();
    }
  }


  // clear on the case we switched networks!
  if(window.TrendsChart != undefined){
    window.TrendsChart.destroy();
  }

  // Generate the Analytics Overview chart.
  window.TrendsChart = new Chart(trendsCTX, {
    type: 'LineWithLine',
    data: trendsData,
    options: trendsOptions
  });

  // Hide initially the first and last analytics overview chart points.
  // They can still be triggered on hover.
  var aocMeta = TrendsChart.getDatasetMeta(0);
  aocMeta.data[0]._model.radius = 0;
  aocMeta.data[trendsData.datasets[0].data.length - 1]._model.radius = 0;

  // Render the chart.
  window.TrendsChart.render();
}


