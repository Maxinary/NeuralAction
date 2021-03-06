var canvas = document.getElementById("drawing");
canvas.width = 401;
canvas.height = 401;

var trials = 12;

//from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

//http://stackoverflow.com/questions/8175093/simple-function-to-sort-an-array-of-objects
function sort(array, key){
  array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


colony = [new Brain(1,3)];//input:[food], outputs:[turn left, turn right, move forward]
for(var i=0;i<4;i++){//the colony size will double 4 times and be of size 16
  var current = colony.length;
  for(var j=0;j<current;j++){
    colony.push(colony[j].mutate());
  }
}

//prospective perfect brain
var a=new Brain(1,3);
a.neurons[0].inputs = [0,0,0,0];
a.neurons[1].inputs = [1.1,0,0,0];
a.neurons[1].process = Comparators["LT"];
a.neurons[2].inputs = [0,0,0,0];
a.neurons[3].inputs = [1.1,0,0,0];

//colony[0] = a;

for(var i=0;i<12;i++){
  console.log(i);
  shuffle(colony);
  //remove least fit half
  for(var j=0; j<colony.length; j++){
    colony[j].fitness = 0;
    for(var k=0;k<trials;k++){
      colony[j].fitness += run(colony[j]);
    }
    colony[j].fitness /= Math.log(colony[j].neurons.length);
  }
  sort(colony, "fitness");
  console.log(colony.map(function(value){return value.fitness;}));
  var l = colony.length;
  for(var j=0; j<Math.floor(l/2); j++){
    colony.splice(colony.length - 1, 1);
  }
  var current = colony.length;
  for(var j=0; j<current; j++){
    colony.push(colony[j].mutate());
  }
}

var ctx = canvas.getContext("2d");


animate(colony[0], ctx, 25);