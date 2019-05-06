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
$.ajax({url: "http://chainwatch.info/api/statistics?network=ethereum", success: function(stats){
  console.log(stats);
  window.statistics[window.network] = stats;

  //$.ajax({url: "http://chainwatch.info/api/reorg_events?network=etheruem", success: function(reorg){
    //console.log(reorg);
    //window.reorgs[window.network] = reorg;

     // draw the dashboard
     $(document).ready(function () {
       init();
     });
 //}});
}});


// DL Ropsten stats in the background
$.ajax({url: "http://chainwatch.info/api/statistics?network=ropsten", success: function(stats){
  window.statistics["ropsten"] = stats;
}});
/*
$.ajax({url: "http://chainwatch.info/api/reorg_events?network=ropsten", success: function(reorg){
  window.reorgs["ropsten"] = reorg;
}});*/

$('#chart-select').change(generateChart);

 $('input[name="datetimes"]').daterangepicker({
    "timePicker": true,
    "startDate": "04/22/2019",
    "endDate": moment().format('MM/DD/YYYY'),
    "minDate": "04/22/2019",
    "maxDate": moment().format('MM/DD/YYYY')
}, function(start, end, label) {
  fullRange = false;
  console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
  datetimeStart = start;
  datetimeEnd = end;
  generateChart();
});

// denotes whether to display the entire range of dates
var fullRange = true;
var datetimeStart = moment();
var datetimeEnd = moment();



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
  var difficulty = Math.round(latestStats.difficulty/(10**window.exponent)) + " " + unit();

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

  /* -------------------- Network Trends Data Processing -------------------- */

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
      parsedData.push({timestamp: moment(s.timestamp), hashrate: hash, blockTime: s.blockTime, difficulty: s.difficulty});
    }
  } 
  window.parsedData = parsedData;

  generateChart();
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
  
  // find all points within the custom range
  var labels = [];
  var dataset = [];
  // place data into the label/dataset
  for(var i=0; i<window.parsedData.length; i++){
    var entry = window.parsedData[i];
    var timestamp = entry.timestamp;
    //console.log()
    // add to labels
    if(fullRange || (timestamp.isAfter(datetimeStart) && timestamp.isBefore(datetimeEnd))){
      labels.push(timestamp);
      if(dataType == 1){
        dataset.push(entry.hashrate);
      } else if (dataType == 2){
        dataset.push(entry.blockTime);
      } else if (dataType == 3){
        dataset.push(entry.difficulty);
      }
    }
  }

  var numPoints = 200;

  // smooth as needed
  if(dataset.length > numPoints*2){
    var obj = smooth(labels, dataset, numPoints);
    labels = obj.timestamps;
    dataset = obj.dataset;
  }

  // generate the options for this data type
  var options = generateOptions(dataType, labels, dataset);
  var trendsData = options[0];
  var trendsOptions = options[1];

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
/*  var aocMeta = TrendsChart.getDatasetMeta(0);
  aocMeta.data[0]._model.radius = 0;
  aocMeta.data[trendsData.datasets[0].data.length - 1]._model.radius = 0;
*/

  // Render the chart.
  window.TrendsChart.render();
}


// smooths the dataset into approximately numPoints points
function smooth(timestamps, dataset, numPoints){
  var windowSize = Math.round(dataset.length/numPoints);
  console.log("Smoothing with window size: " + windowSize);

  var toMinimize = (dataset[0] > 10**window.exponent);
  var newDataset = [];
  var newTimestamps = [];
  var i = 0;
  while(i<dataset.length){
    var dataSum = 0;
    var timeSum = 0;
    var numUsed = windowSize;
    for(var j=0; j<windowSize; j++){
      if(i+j >= timestamps.length){ // used up all remaining points
        numUsed = j;
        break;
      }
      dataSum += toMinimize ? dataset[i+j]/(10**window.exponent) : dataset[i+j];
      timeSum += timestamps[i+j].valueOf();
    }  
    var avgTimestamp = moment(Math.round(timeSum/numUsed));
    var avgData = dataSum/numUsed;
    if(toMinimize){
      avgData = avgData.toFixed(2) * 10**window.exponent;
    }
    newDataset.push(avgData);
    newTimestamps.push(avgTimestamp);
    i+=windowSize;
  }

  return {timestamps:newTimestamps, dataset:newDataset};
}

