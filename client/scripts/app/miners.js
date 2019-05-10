'use strict';
window.statistics = {};
window.density_events = {};

// denotes whether to display the entire range of dates
var fullRange = true;
var datetimeStart = moment();
var datetimeEnd = moment();

$(document).ready(function () {
  if(sessionStorage.network == undefined) sessionStorage.network = "ethereum";

  changeNetworkName();

  /* ----- DOWNLOAD DATA ----- */
  // initialize with whatever network we're on

  $.ajax({url: "http://chainwatch.info/api/statistics?network=" + sessionStorage.network, success: function(obj){
    window.statistics[sessionStorage.network] = obj;

    // Download other networks miner density events in the background
    $.ajax({url: "http://chainwatch.info/api/density_events?network=" + sessionStorage.network, success: function(obj){
      window.density_events[sessionStorage.network] = obj;
      // draw the dashboard
      $(document).ready(function () {
      // remove loading wheel
      $(".main-content-container").addClass("loaded");
      loadData();
    });
    }}); 
  }});

  // Download other networks in the background
  $.ajax({url: "http://chainwatch.info/api/statistics?network=" + other(), success: function(obj){
    window.statistics[other()] = obj;
  }});

  // Download other networks miner density events in the background
  $.ajax({url: "http://chainwatch.info/api/density_events?network=" + other(), success: function(obj){
    window.density_events[other()] = obj;
  }});
  
});


function loadData(){
  generateChart();
  generateKnownMiners();
  generateMinerDensityTable();
}

function generateChart(){

  // IGNORE RANGE FOR NOW
  // date -> miner -> count
  var dataset = {};
  // miner -> count
  var total = {};
  // date -> count
  var totalByDate = {};

  // generate dataset
  for(var i=0; i<window.statistics[sessionStorage.network].length; i++){
    var entry = window.statistics[sessionStorage.network][i];
    var key = moment(entry.timestamp).format("MM/DD/YYYY");
    if(dataset[key] == undefined) dataset[key] = {};
    if(totalByDate[key] == undefined) totalByDate[key] = 0;

    for(var m in entry.miners){
      var c = entry.miners[m];
      if(dataset[key][m] == undefined) dataset[key][m] = c;
      else dataset[key][m] += c;

      if (total[m] == undefined) total[m] = c;
      else total[m]+=c;
      totalByDate[key] +=c;
    }
  }

  // fix collection error
  for(var m in dataset["04/23/2019"]) dataset["04/23/2019"][m] /=2.25;
    totalByDate["04/23/2019"] /= 2.25;

  // sum up dataset, find top 10 miners
  var list = [];
  for(var m in total){
    list.push({miner: m, numBlocks: total[m]});
  }
  list.sort((a, b) => (a.numBlocks > b.numBlocks) ? -1 : (a.numBlocks === b.numBlocks) ? ((a.numBlocks > b.numBlocks) ? 1 : -1) : 1 )
  list = list.slice(0,5);

  // dates as moment objects
  var dateLabels = [];

  // top 5 miner->array (ordered by date)
  var datasets = {};

  // generate datasets for each miner
  for(var date in dataset){
    dateLabels.push(moment(date));

    // for each of the top 5 miners
    for(var i in list){
      var miner = list[i].miner;
      if(datasets[miner]==undefined) datasets[miner] = [];

      console.log("ON", date, totalByDate[date], "blocks mined");
      var c = dataset[date][miner] / totalByDate[date] * 100;
      if(dataset[date][miner] == undefined) c = 0;
      datasets[miner].push(c);
    }
  }

  var trendsData = {
    // Generate the labels on the X axis.
    labels: dateLabels,
    // DATASET FOR EACH OF TOP 5 MINERS
    datasets: [{
      label: getMinerName(list[0].miner),
      fill: 'start',
      responsive:true,
      data: datasets[list[0].miner],
      backgroundColor: 'rgba(0,123,255,0.1)', // change for other options
      borderColor: 'rgba(0,123,255,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 1
    },{
      label: getMinerName(list[1].miner),
      fill: 'start',
      responsive:true,
      data: datasets[list[1].miner],
      backgroundColor: 'rgba(255,65,105,0.1)', // change for other options
      borderColor: 'rgba(255,65,105,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 1
    },{
      label: getMinerName(list[2].miner),
      fill: 'start',
      responsive:true,
      data: datasets[list[2].miner],
      backgroundColor: 'rgba(255,180,0,0.1)', // change for other options
      borderColor: 'rgba(255,180,0,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 1
    },{
      label: getMinerName(list[3].miner),
      fill: 'start',
      responsive:true,
      data: datasets[list[3].miner],
      backgroundColor: 'rgba(23,198,113,0.1)', // change for other options
      borderColor: 'rgba(23,198,113,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 1
    },{
      label: getMinerName(list[4].miner),
      fill: 'start',
      responsive:true,
      data: datasets[list[4].miner],
      backgroundColor: 'rgba(0, 184, 216,0.1)', // change for other options
      borderColor: 'rgba(0, 184, 216,1)',
      pointBackgroundColor: '#ffffff',
      pointHoverBackgroundColor: 'rgb(0,123,255)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 1
    }]
  };

  var trendsCTX = document.getElementsByClassName('miner-density-graph')[0];

  // clear in the case we switched networks!
  if(window.TrendsChart != undefined){
    window.TrendsChart.destroy();
  }  

  Chart.defaults.LineWithLine = Chart.defaults.line;
  Chart.controllers.LineWithLine = Chart.controllers.line.extend({
    draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);

      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
        var activePoint = this.chart.tooltip._active[0],
        ctx = this.chart.ctx,
        x = activePoint.tooltipPosition().x,
        topY = this.chart.scales['y-axis-0'].top,
        bottomY = this.chart.scales['y-axis-0'].bottom;

         // draw line
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(x, topY);
         ctx.lineTo(x, bottomY);
         ctx.lineWidth = 1;
         ctx.strokeStyle = 'rgba(137,132,132,0.1)';
         ctx.stroke();
         ctx.restore();
       }
     }
   });

  // Generate the Analytics Overview chart.
  window.TrendsChart = new Chart(trendsCTX, {
    type: 'LineWithLine',
    data: trendsData,
    options: trendsOptions
  });

  // Render the chart.
  window.TrendsChart.render();
}


function generateKnownMiners(){
  var miners = KNOWN_MINERS[sessionStorage.network];
  var rows = "";

  for(var addr in miners){
    rows += "<tr>";
    var name = miners[addr].name;
    var url = miners[addr].url;
    rows += ("<td style='font-size:10px'>"+addr+"</td>");
    rows += wrapRow(name);
    rows += "</tr>";

    console.log(addr + " : " + name);
  }
  $('#miners-table tbody').html(rows);
}  

function generateMinerDensityTable(){

  var rows = "";
  var events = window.density_events[sessionStorage.network];
  console.log(events);
  for(var i=events.length-1;i>=0; i--){
    var e = events[i];
    var addr = getMinerNameOrFull(e.majorityMiner);
    rows += "<tr>";
    rows += ("<td style='font-size:10px'>"+addr+"</td>");
    rows += wrapRow(moment(e.detected).format("MM/DD/YYYY"));
    rows += wrapRow(e.start + "-" + e.end + " (" + e.numBlocks + " blocks)");
    rows += wrapRow((e.miners[e.majorityMiner] / e.numBlocks * 100).toFixed(2) + "%");
    rows += "</tr>";
  }

  $("#density-event-table").html(rows);
  console.log(rows);
}

/* -------------------- MINER TRENDS CHART -------------------- */
var trendsOptions = {
  maintainAspectRatio:false,
  responsive: true,
  legend: {
    position: 'top'
  },
  elements: {
    line: {   
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
        max: 100,
        callback: function (tick, index, ticks) {
          if (tick === 0) {
            return 0;
          }
          return tick;
        }
      }
    }],
  },
  animation: {
    duration: 500
  },
  hover: {
    mode: 'index',
    intersect: false
  },
  tooltips: {
    custom: false,
    mode: 'index',
    intersect: false,
    callbacks: {
      title: function(tooltipItem, data) {
          // process dates
          var datestring = data.labels[tooltipItem[0].index];
          return moment(datestring).format('MMMM D');
        },
        label: function(tooltipItem, data) {
          return " " + (tooltipItem.yLabel).toFixed(1) + "%";
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


  /* -------------------- Pie Chart -------------------- */
  //
  // Users by device pie chart
  //
/*
  var arr = [];

  for(var m in miners24Hours){
    if(miners24Hours.hasOwnProperty(m)){
      var minerName = m.slice(0,10) + "...";

      arr.push({miner:minerName, blocksMined: miners24Hours[m]});
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
    var c = makeColor(arr[i].blocksMined/(stats_collection_rate*numBlocks24hr/2));
    colors.push(c);
  }
  // Data
  var piechartData = {
    datasets: [{
      hoverBorderColor: '#ffffff',
      data: blocksMined,
      backgroundColor: colors
    }],
    labels: minerHashes
  };

  // Options
  var piechartOptions = {
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

  // Generate the PIE CHART
  var ubdCtx = document.getElementsByClassName('blog-users-by-device')[0];

  // clear on the case we switched networks!
  if(window.ubdChart != undefined){
    window.ubdChart.destroy();
  }

  window.ubdChart = new Chart(ubdCtx, {
    type: 'pie',
    data: piechartData,
    options: piechartOptions
  });*/




/*
 function intToHex(i) {
   var hex = parseInt(i).toString(16);
   return (hex.length < 2) ? "0" + hex : hex;
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
  return "#" + intToHex(redValue) + intToHex(greenValue) + "00";*/
