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
  return "#" + intToHex(redValue) + intToHex(greenValue) + "00";
}