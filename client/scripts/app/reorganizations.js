/*
|--------------------------------------------------------------------------
| Shards Dashboards: Blog Overview Template
|--------------------------------------------------------------------------
*/

'use strict';

window.network = "ethereum";
window.exponent = 12;

window.reorg_events = {};

$(document).ready(function () {
  changeNetworkName();

  /* ----- DOWNLOAD DATA ----- */
  // initialize with ethereum

  $.ajax({url: "http://chainwatch.info/api/reorg_events?network=ethereum", success: function(obj){
    window.reorg_events["ethereum"] = obj;
    // draw the dashboard
    $(document).ready(function () {
      // remove loading wheel
      $(".main-content-container").addClass("loaded");
      loadData();
    });
  }});

  // Download Ropsten stats in the background
  $.ajax({url: "http://chainwatch.info/api/reorg_events?network=ropsten", success: function(obj){
    window.reorg_events["ropsten"] = obj;
  }});
});

// populates data tables
function loadData(){

  var dataset = window.reorg_events[window.network];
  console.log(dataset);
  var rows = "";
  for(var i=dataset.length-1; i>=dataset.length-100; i--){
    var row = '<tr>';
    var entry = dataset[i];
    row += wrapRow(entry.start +"-" +entry.end);
    row += wrapRow(entry.detected);
    row += wrapRow(entry.numBlocks);
    row += wrapRow("Block Data");
    row += "</tr>";
    rows += row;
  }
  $('#reorg-table tr').remove();
  $('#reorg-table tbody').after(rows);


  var tallySet = {};

  // prep data for graph
  for(var i=dataset.length-1; i>=0; i--){
    var entry = dataset[i];
    var dateObj = moment(entry.detected);
    var dateString = dateObj.format('MM/DD/YYYY');
    if(entry.numBlocks > 3) console.log(entry);

    if(tallySet.hasOwnProperty(dateString)){
      tallySet[dateString] += entry.numBlocks;
    } else {
      tallySet[dateString] = entry.numBlocks;
    }
  }

  var dateLabels = [];
  var numForked = [];

  for(var d in tallySet){
    if(tallySet.hasOwnProperty(d) && tallySet[d] > 10){
      dateLabels.push(d);
      numForked.push(tallySet[d]);
    }
  }

  console.log(dateLabels);
  console.log(numForked);

  generateChart(dateLabels, numForked);
}

// GRAPH OF FORKED BLOCKS OVER TIME

function wrapRow(data){
  return '<td>' + data +'</td>';
}

function changeNetwork(){
  if(window.network == "ropsten"){
    window.network = "ethereum";
    window.exponent = 12;
  } else {
    window.network="ropsten";
    window.exponent = 6;
  }
  changeNetworkName();
  loadData();
  return false;
}

function changeNetworkName(){
   // replace instances of "___" with the actual network
   var elements = $(".network-name");
   var networkCap = window.network.charAt(0).toUpperCase() + window.network.slice(1)
   for(var i=0; i<elements.length; i++){
     var e = elements[i];
     var newText = e.innerHTML.replace("Ethereum", "___");
     newText = newText.replace("Ropsten", "___");
     newText = newText.replace("___", networkCap);
     e.innerHTML = newText;
   }
 }

 function unit(){
   if(window.exponent == 12) return "TH";
   return "MH";
 }



// generates the # forked blocks per day
function generateChart(labels, dataset){
  // Dataset options
  var trendsData = {
    // Generate the labels on the X axis.
    labels: labels,
    datasets: [{
      label: '# of Forked Blocks Per Day',
      fill: 'start',
      responsive:true,
      data: dataset,
      backgroundColor: 'rgba(255,180,0,0.1)', // change for other options
      borderColor: 'rgb(255,180,0)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(255,180,0)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3
    }]
  };

// Trend Chart Options
var trendsOptions = {
  maintainAspectRatio:false,
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
        type: "time",
        time: {
          unit: "day",
          unitStepSize: 1,
          displayFormats: {
            'millisecond': 'h:mm a',
            'second': 'h:mm a',
            'minute': 'h:mm a',
            'hour': 'h:mm a',
            'day': 'MMM DD',
            'week': 'MMM DD',
            'month': 'MMM DD',
            'quarter': 'MMM DD',
            'year': 'MMM DD',
          }
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 300,
          callback: function (tick, index, ticks) {
            if (tick === 0) {
              return tick;
            }
              // Format the amounts using units/s
              return (tick % 50 == 0 ? tick : '');
            }
          }
        }],
      },
      animation: {
        duration: 1000
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
            return moment(datestring).format('MMM D, hh:mm A');
          },
          label: function(tooltipItem, data) {
            var d = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return d + " Blocks";
          }
        }
      }
    };


  var trendsCTX = document.getElementsByClassName('forked-blocks-graph')[0];

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

  // Render the chart.
  window.TrendsChart.render();
}


 /* WHO IS GETTING REORG'd?!

  // analyze reorgs by Miner

  var oldTally = {};
  var newTally = {};

  for(var i=0; i<window.reorgs.length; i++){
    var obj = window.reorgs[i];


    if(obj["network"] == "ethereum" && obj.numBlocks >= 2){
      for(var blockNo in obj.blocks){
        var block = obj.blocks[blockNo];

        var og = oldTally[block.old.miner];
        if(og==undefined) og = 0;
        oldTally[block.old.miner] = og+1;

        og = newTally[block.new.miner];
        if(og==undefined) og = 0;
        newTally[block.new.miner] = og+1;
      }
    }
  }

  console.log(oldTally);
  console.log(newTally);*/