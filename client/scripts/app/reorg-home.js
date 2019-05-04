
  

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