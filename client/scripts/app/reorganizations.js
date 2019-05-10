'use strict';

window.reorg_events = {};

$(document).ready(function () {
  if(sessionStorage.network == undefined) sessionStorage.network = "ethereum";

  changeNetworkName();

  // draw table again on change
  $('#min-block-select').on('input', function() {
    generateTable();
  });

  /* ----- DOWNLOAD DATA ----- */
  // initialize with ethereum

  $.ajax({url: "http://chainwatch.info/api/reorg_events?network=" + sessionStorage.network, success: function(obj){
    window.reorg_events[sessionStorage.network] = obj;
    // draw the dashboard
    $(document).ready(function () {
      // remove loading wheel
      $(".main-content-container").addClass("loaded");
      loadData();
    });
  }});

  // Download Ropsten stats in the background
  $.ajax({url: "http://chainwatch.info/api/reorg_events?network=" + other(), success: function(obj){
    window.reorg_events[other()] = obj;
  }});
});

// populates data tables and graph
function loadData(){
  generateTable();

  var dataset = window.reorg_events[sessionStorage.network];
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
  generateChart(dateLabels, numForked);
}

/* generate the table */
function generateTable(){
  var dataset = window.reorg_events[sessionStorage.network];
  var minimum = parseInt($('#min-block-select').val());

  var rows = "";
  var included = 0;
  for(var i=dataset.length-1; i>=0; i--){
    var row = '<tr>';
    var entry = dataset[i];

    if(entry.numBlocks < minimum) continue;

    row += wrapRow(entry.start == entry.end ? entry.end : entry.start +"-" +entry.end);

    var date = moment(entry.detected).format("MMM DD, hh:mm A");

    row += wrapRow(date);
    row += wrapRow(entry.numBlocks);
    row += wrapRow("<a onclick='generateModal(" + i + ")' href='#'>See Data</a>");
    row += "</tr>";
    rows += row;
    included++;
    if(included >= 100) break;
  }

  $('#reorg-table tr').remove();
  $('#reorg-table tbody').after(rows);
}

/* generate the modal view */
function generateModal(index){
  console.log("Generating modal");
  var entry = window.reorg_events[sessionStorage.network][index];
  console.log(entry);

  var blocks = entry.blocks;
  var blockHeights = "";
  var oldHashes = "";
  var newHashes = "";
  var oldMiners = "";
  var newMiners = "";

  for(var b=entry.start; b<=entry.end; b++){
    blockHeights += wrapRow(b);
    oldHashes += wrapRow(blocks[b].old.hash);
    oldMiners += wrapRow(blocks[b].old.miner);
    newHashes += wrapRow(getMinerNameOrFull(blocks[b].new.hash));
    newMiners += wrapRow(getMinerNameOrFull(blocks[b].new.miner));
  }

  $('#block-heights td').remove();
  $('#block-heights th').after(blockHeights);

  $('#old-hashes td').remove();
  $('#old-hashes th').after(oldHashes);
  $('#new-hashes td').remove();
  $('#new-hashes th').after(newHashes);

  $('#old-miners td').remove();
  $('#old-miners th').after(oldMiners);
  $('#new-miners td').remove();
  $('#new-miners th').after(newMiners);

  $('#modal-container').modal('show');
}

// GRAPH OF FORKED BLOCKS OVER TIME
function wrapRow(data){
  return '<td>' + data +'</td>';
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
        ticks:{ 
          autoSkip: true,
          padding: 10
        },
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
            return moment(datestring).format('MMM D');
          },
          label: function(tooltipItem, data) {
            var d = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return d + " Blocks";
          },
          labelColor: function(tooltipItem, chart) {
            var index = tooltipItem.datasetIndex;
            return {
              borderColor: chart.data.datasets[index].borderColor,
              backgroundColor: chart.data.datasets[index].backgroundColor
            };
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


function tallyVictims(){
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
  console.log(newTally);
}