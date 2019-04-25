/*
 |--------------------------------------------------------------------------
 | Shards Dashboards: Blog Overview Template
 |--------------------------------------------------------------------------
 */

'use strict';

window.network = "ethereum";
const stats_collection_rate = 20;

(function ($) {
  $(document).ready(function () {
    $.ajax({url: "http://chainwatch.info/api/statistics", success: function(stats){
        console.log(stats);
        window.statistics = stats;

        $.ajax({url: "http://chainwatch.info/api/reorg_events", success: function(reorg){
          console.log(reorg);
          window.reorgs = reorg;

          $.ajax({url: "http://chainwatch.info/api/density_events", success: function(density){
            console.log(density);
            window.density = density;
            init();
           }});
        }});
    }});
  });
})(jQuery);

function init(){
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

  // Get latest stats reading

  for(var i=window.statistics.length-1; i>=0; i--){
     var s = window.statistics[i];
     if(s.network == network){
         window.latestStats = s;
         break;
     }
  }

  // FORKED BLOCKS


  // HASHRATE
  var ograte = latestStats.hashrate;
  console.log("Hashrate: " + ograte);
  // convert to GH/s
  var hashrate = Math.round(ograte / (10**9));
  var hashText = hashrate + " GH/s";
  if(hashrate <= 1){
    hashrate = Math.round(ograte / (10**6));
    hashText = hashrate + " MH/s";
  }


  // BLOCKTIME
  var blockTime = latestStats.blockTime;
  console.log("Block Time: " + blockTime);

  // Miner density 
  var miners = latestStats.miners;
  var key;
  var largestShare = 0;
  for(var m in miners){
      if(miners.hasOwnProperty(m)){
        if(miners[m] > largestShare){
          largestShare = miners[m];
          key = m;
        }
      }
  }
  
  largestShare= (largestShare/stats_collection_rate).toFixed(2);
  console.log("Largest hashrate share: " + largestShare);

  // DIFFICULTY
  var difficulty = parseInt(latestStats.difficulty).toExponential(3);

  $('.count.forked').text("14");
  $('.count.hashrate').text(hashText);
  $('.count.blocktime').text(blockTime + " s");
  $('.count.minershare').text(Math.round(largestShare*100) + "%");
  $('.count.difficulty').text(difficulty);


  // difficulty
  var difficulty = latestStats.difficulty;

  // Datasets
  var boSmallStatsDatasets = [
    {
      backgroundColor: 'rgba(0, 184, 216, 0.1)',
      borderColor: 'rgb(0, 184, 216)',
      data: [1, 9, 1, 3, 5, 4, 7],
    },
    {
      backgroundColor: 'rgba(23,198,113,0.1)',
      borderColor: 'rgb(23,198,113)',
      data: [1, 2, 3, 3, 3, 4, 4]
    },
    {
      backgroundColor: 'rgba(255,180,0,0.1)',
      borderColor: 'rgb(255,180,0)',
      data: [2, 3, 3, 3, 4, 3, 3]
    },
    {
      backgroundColor: 'rgba(255,65,105,0.1)',
      borderColor: 'rgb(255,65,105)',
      data: [1, 7, 1, 3, 1, 4, 8]
    },
    {
      backgroundColor: 'rgb(0,123,255,0.1)',
      borderColor: 'rgb(0,123,255)',
      data: [3, 2, 3, 2, 4, 5, 4]
    }
  ];

  // Options
    function boSmallStatsOptions(max) {
      return {
        maintainAspectRatio: true,
        responsive: true,
        // Uncomment the following line in order to disable the animations.
        // animation: false,
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
            tension: 0.3
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

  var bouCtx = document.getElementsByClassName('network-trends-graph')[0];

  // generate hashrate data for the chart
  var hashData = [];

  var hashratePoints = [];
  var dateLabels = [];

  for(var i=0; i<window.statistics.length; i++){
     var s = window.statistics[i];
     if(s.network == network){
         var t = Date.parse(s.timestamp);
         dateLabels.push(s.timestamp);
         if(s.hasOwnProperty("hashRate")) { 
           hashData.push(s.hashRate);
           hashratePoints.push({x: t, y:s.hashRate});
         } else if(s.hasOwnProperty("hashrate")){
           hashData.push(s.hashrate);
           hashratePoints.push({x: t, y:s.hashrate});
         }
     }
  }

  // Data
  var bouData = {
    // Generate the days labels on the X axis.
    labels: dateLabels,
    datasets: [{
      label: 'Hashrate',
      fill: 'start',
      data: hashratePoints,
      backgroundColor: 'rgba(0,123,255,0.1)', // change for other options
      borderColor: 'rgba(0,123,255,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3
    }]
  };

  // Options
  var bouOptions = {
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
            // Jump every 7 values on the X axis labels to avoid clutter.
            return index % 1000000 !== 0 ? '' : tick;
          }
        }
      }],
      yAxes: [{
        ticks: {
          suggestedMax: 45,
          callback: function (tick, index, ticks) {
            if (tick === 0) {
              return tick;
            }
            // Format the amounts using Ks for thousands.
            return tick >= 10**9 ? (tick/10**9).toFixed(0) + ' GH/s' : tick;
          }
        }
      }]
    },
    // Uncomment the next lines in order to disable the animations.
    // animation: {
    //   duration: 0
    // },
    hover: {
      mode: 'nearest',
      intersect: false
    },
    tooltips: {
      custom: false,
      mode: 'nearest',
      intersect: false
    }
  };

  // clear on the case we switched networks!
  if(window.BlogOverviewUsers != undefined){
    window.BlogOverviewUsers.destroy();
  }

  // Generate the Analytics Overview chart.
  window.BlogOverviewUsers = new Chart(bouCtx, {
    type: 'LineWithLine',
    data: bouData,
    options: bouOptions
  });

  // Hide initially the first and last analytics overview chart points.
  // They can still be triggered on hover.
  var aocMeta = BlogOverviewUsers.getDatasetMeta(0);
  aocMeta.data[0]._model.radius = 0;
  aocMeta.data[bouData.datasets[0].data.length - 1]._model.radius = 0;

  // Render the chart.
  window.BlogOverviewUsers.render();


  /* -------------------- Pie Chart -------------------- */
  //
  // Users by device pie chart
  //

  var arr = [];

  for(var m in miners){
      if(miners.hasOwnProperty(m)){
        arr.push({miner:m, blocksMined: miners[m]});
      }
  }

  arr.sort(function(a, b) {
    return ((a.blocksMined > b.blocksMined) ? -1 : ((a.blocksMined == b.blocksMined) ? 0 : 1));
  });

  var blocksMined = [];
  var minerHashes = [];
  for(var i=0; i<arr.length; i++){
      blocksMined.push(arr[i].blocksMined);
      minerHashes.push(arr[i].miner);
  }
  var colors = [];
  // generate color wheel (higher concentration = closer to red!)
  for(var i=0; i<arr.length; i++){
    // color is based on concentration
    var c = makeColor(arr[i].blocksMined/(stats_collection_rate/2));
    colors.push(c);
  }
  // Data
  var ubdData = {
    datasets: [{
      hoverBorderColor: '#ffffff',
      data: blocksMined,
      backgroundColor: colors
    }],
    labels: minerHashes
  };

  // Options
  var ubdOptions = {
    legend: {
      display: false,
      position: 'bottom',
      labels: {
        padding: 25,
        boxWidth: 20
      }
    },
    cutoutPercentage: 0,
    // Uncomment the following line in order to disable the animations.
    // animation: false,
    tooltips: {
      custom: false,
      mode: 'index',
      position: 'nearest'
    }
  };

  var ubdCtx = document.getElementsByClassName('blog-users-by-device')[0];
 
  // clear on the case we switched networks!
  if(window.ubdChart != undefined){
    window.ubdChart.destroy();
  }

  // Generate the users by device chart.
  window.ubdChart = new Chart(ubdCtx, {
    type: 'pie',
    data: ubdData,
    options: ubdOptions
  });
}

function makeColor(value) {
        value = 1-value;
        // value must be between [0, 510]
        value = Math.min(Math.max(0,value), 1) * 510;
        var redValue;
        var greenValue;
        if (value < 255) {
            redValue = 255;
            greenValue = Math.sqrt(value) * 16;
            greenValue = Math.round(greenValue);
        } else {
            greenValue = 255;
            value = value - 255;
            redValue = 256 - (value * value / 255)
            redValue = Math.round(redValue);
        }

        return "#" + intToHex(redValue) + intToHex(greenValue) + "00";
    }

    function intToHex(i) {
        var hex = parseInt(i).toString(16);
        return (hex.length < 2) ? "0" + hex : hex;
    } 

    function changeNetwork(){
      if(window.network == "ropsten"){
        window.network = "ethereum";
      } else {
         window.network="ropsten";
      }
      init();
      return false;
    }
