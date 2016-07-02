"use strict";

function randint(min, max){
  return Math.floor((max+1-min)*Math.random())+ min;
}

var Comparators = {
    LT : function(lotsodata){
      var ssum = 0;
      for(var i=0;i<lotsodata.length;i++){
        ssum+=lotsodata[i];
      }
      if(ssum<1){
        return true;
      }else{
        return false;
      }
    },
    GT : function(lotsodata){
      var ssum = 0;
      for(var i=0;i<lotsodata.length;i++){
        ssum+=lotsodata[i];
      }
      if(ssum>1){
        return true;
      }else{
        return false;
      }
    }
};

class Tuple {
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}

class Neuron {
  constructor(process, inputs){   //enum to be put into func func
    this.process = process;
    this.output = false;
    this.inputs = [];
    if(typeof(inputs) != "undefined"){
      //because arrays are objects, copy the data
      for(var i in inputs){
        this.inputs.push(inputs[i]);
      }
    }
  }
  
  registerInput(input,value){
    this.inputs[input] = value;
  }
  
  update(neuronstructure){//every tick read all input multipliers (Which correspond to neurons)
    var invalues = [];
    for(var i=0;i<this.inputs.length;i++){
      invalues[i] = neuronstructure[i].output * this.inputs[i];
    }
    this.output = this.process(invalues);
  }
}

class Brain{
  constructor(inputLength, outputLength, neurons){
    this.neurons = [];
    this.inLen = inputLength;//the amount of inputs
    this.outLen = outputLength;//amount of outputs
    if(typeof(neurons) === "undefined"){
      for(var i=0;i<inputLength+outputLength;i++){
        this.addNeuron(Comparators.GT);
      }
    }else{
      for(var i in neurons){
        this.neurons.push(new Neuron(neurons[i].process, neurons[i].inputs));
      }
    }
  }
  
  addNeuron(process){
    this.neurons.push(new Neuron(process));
    for(var i=0; i<this.neurons.length; i++){
      this.neurons[this.neurons.length-1].inputs.push(0);
      if(i<this.neurons.length-1){
        this.neurons[i].inputs.push(Math.random()*3 - 1.5);
      }
    }
  }
  
  removeNeuron(index){
    if(index > this.inLen && index < this.neurons.length-this.outLen){
      this.neurons.splice(index, 1);
      for(var i=0;i<this.neurons.length;i++){
        this.neurons[i].inputs.splice(index, 1);
      }
    }
  }
  
  update(){
    var oldN = JSON.parse(JSON.stringify(this.neurons));
    for(var i=0;i<this.neurons.length;i++){
      this.neurons[i].update(oldN);
    }
  }
  
  mutate(){
    var choice = randint(0,5);//two choices
    var newThis = new Brain(this.inLen, this.outLen, this.neurons);
    switch(choice){
      case(0):
        newThis.addNeuron(Comparators[["LT","GT"][randint(0,1)]]);
        break;
      case(1):
        newThis.removeNeuron(randint(this.inLen,this.neurons.length - this.outLen));
        break;
      case(2):
        newThis.neurons[randint(this.inLen,this.neurons.length - 1)].process = Comparators[["LT","GT"][randint(0,1)]];
        break;
      case(3):
      case(4)://twice as likely
        newThis.neurons[randint(this.inLen,this.neurons.length - 1)].registerInput(randint(0,this.neurons.length - 1), Math.random()*3 - 1.5);
        break;
    }
    return newThis;
  }
}

function run(brain){
  //initialize
  var position = [0.5, 0.5, 0];//x(0 to 1), y(0 to 1), angle(0 to 2*PI)
  var foodPos = [Math.random(),Math.random()];
  var curTime = 0;
  var maxTime = 500;
  var done = false;
  
  //ticks
  for(;curTime < maxTime && Math.sqrt(Math.pow(position[0] - foodPos[0], 2) + Math.pow(position[1] - foodPos[1], 2)) > 0.05; curTime++){
    //create input by finding if food is in front of the animal
    var distance = Math.abs(Math.tan(position[2])*foodPos[0] - Math.tan(position[2])*position[0] + position[1] - foodPos[1])/Math.sqrt(Math.pow(Math.tan(position[2]),2) + 1);//distance from line to point
    brain.neurons[0].output = distance<0.05;
    brain.update();
    //move position
    if(brain.neurons[brain.neurons.length - 3].output){//turn left
      position[2] += 0.05;
    }
    if(brain.neurons[brain.neurons.length - 2].output){//turn right
      position[2] -= 0.05;
    }
    if(brain.neurons[brain.neurons.length - 1].output){//forward
      position[0] += Math.cos(position[2])*0.05;
      position[1] += Math.sin(position[2])*0.05;
    }
  }
  return curTime;
}

function animate(brain, ctx, speed){
  //initialize
  var position = [0.5, 0.5, 0];//x(0 to 1), y(0 to 1), angle(0 to 2*PI)
  var foodPos = [Math.random(),Math.random()];
  var curTime = 0;
  var maxTime = 500;
  var done = false;
  
  //ticks
  var runner = setInterval(function(){
    //create input by finding if food is in front of the animal
    var distance = Math.abs(Math.tan(position[2])*foodPos[0] - Math.tan(position[2])*position[0] + position[1] - foodPos[1])/Math.sqrt(Math.pow(Math.tan(position[2]),2) + 1);//distance from line to point
    brain.neurons[0].output = distance<0.05;
    brain.update();
    //move position
    if(brain.neurons[brain.neurons.length - 3].output){//turn left
      position[2] += 0.05;
    }
    if(brain.neurons[brain.neurons.length - 2].output){//turn right
      position[2] -= 0.05;
    }
    if(brain.neurons[brain.neurons.length - 1].output){//forward
      position[0] += Math.cos(position[2])*0.05;
      position[1] += Math.sin(position[2])*0.05;
    }
    ctx.clearRect(0,0,400,400);
    
    ctx.strokeRect(0,0,400,400);
    ctx.beginPath();
    ctx.moveTo(position[0]*400 + Math.cos(position[2])*20, position[1]*400 + Math.sin(position[2])*20);
    ctx.lineTo(position[0]*400 + Math.cos(position[2] + Math.PI*2/3)*14,position[1]*400 + Math.sin(position[2] + Math.PI*2/3)*14);
    ctx.lineTo(position[0]*400 + Math.cos(position[2] + Math.PI*4/3)*14,position[1]*400 + Math.sin(position[2] + Math.PI*4/3)*14);
    
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillRect(foodPos[0]*400 - 1, foodPos[1]*400 - 1, 2, 2);
    
    curTime++;
    if(curTime > maxTime || Math.sqrt(Math.pow(position[0] - foodPos[0], 2) + Math.pow(position[1] - foodPos[1], 2)) < 0.05){
      clearInterval(runner);
    }
  },speed);
}