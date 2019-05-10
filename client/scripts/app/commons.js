const exponents = {"ethereum": 10**12, "ropsten": 10**6};

function changeNetwork(){
  sessionStorage.network = other();
  changeNetworkName();
  loadData();
  return false;
}

// attempts to find listed name of this address. If impossible, truncate addr and return
function getMinerName(addr){
  var miner = KNOWN_MINERS[sessionStorage.network][addr.toLowerCase()];

  if(miner == undefined){
    name = addr.slice(0,8) + "..."; 
  } else {
    name = miner.name;
  }
  return name;
}

function wrapRow(data){
  return "<td>" + data + "</td>"
};


// attempts to find listed name of this address. If exists, return address truncate + name
function getMinerNameOrFull(addr){
  var miner = KNOWN_MINERS[sessionStorage.network][addr.toLowerCase()];

  if(miner == undefined){
    name = addr;
  } else {
    name = addr.slice(0,8) + "... (" + miner.name +")";
  }
  return name;
}

function other(){
  if(sessionStorage.network == "ethereum") return "ropsten";
  return "ethereum";
}

function changeNetworkName(){
   // replace instances of "___" with the actual network
   var elements = $(".network-name");
   var networkCap = sessionStorage.network.charAt(0).toUpperCase() + sessionStorage.network.slice(1)
   for(var i=0; i<elements.length; i++){
     var e = elements[i];
     var newText = e.innerHTML.replace("Ethereum", "___");
     newText = newText.replace("Ropsten", "___");
     newText = newText.replace("___", networkCap);
     e.innerHTML = newText;
   }

   $(".user-avatar").attr("src", "images/avatars/" + sessionStorage.network + ".png");
 }


function unit(){
  if(exponents[sessionStorage.network] == 10**12) return "TH";
  if(exponents[sessionStorage.network] == 10**6) return "MH";
  return "UNDEFINED";
}


var KNOWN_MINERS={

  "ethereum": {
    "0xea674fdde714fd979de3edf0f56aa9716b898ec8": {
      name: "Ethermine",
      url: "https://ethermine.org/",
    },
    "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c": {
      name: "SparkPool",
      url: "https://www.sparkpool.com",
    },
    "0x829bd824b016326a401d083b33d092293333a830": {
      name: "F2Pool",
      url: "https://www.f2pool.com/"
    },
    "0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5": {
      name: "Nanopool",
      url: "https://nanopool.org/"
    },
    "0xb2930b35844a230f00e51431acae96fe543a0347": {
      name: "Mining Pool Hub",
      url: "https://miningpoolhub.com/"
    },
    "0x2a5994b501e6a560e727b6c2de5d856396aadd38": {
      name: "PandaMiner",
      url: "https://www.pandaminer.com/"
    },
    "0x2a65aca4d5fc5b5c859090a6c34d164135398226": {
      name: "Dwarfpool",
      url: "https://dwarfpool.com/eth"
    },
    "0x005e288d713a5fb3d7c9cf1b43810a98688c7223": {
      name: "xnpool",
      url: "https://www.xnpool.cn/"
    },
    "0x35f61dfb08ada13eba64bf156b80df3d5b3a738d": {
      name: "firepool",
      url: "https://firepool.com/"
    }
  },


  "ropsten":{
    "0xcd626bc764e1d553e0d75a42f5c4156b91a63f23":{
      name: "Ethereum Foundation"
    },
    "0x7afc38069B6cA4FE67851E45854Ca936Dbdeff88":{
      name: "Michael Man",
      url: "https://github.com/michael99man/Chainwatch"
    }
  }


}
