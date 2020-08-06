
function modelBlock(x) {

  this.index = x
  this.status = false;

  this.action = function() {
    var localRoot = this;
    this.status = true;
    setTimeout(function() {
      localRoot.status = false;
    }, 350)
  }

}


var interActionController = {
  main: []
}

for (var x = 0; x < 64; x++) {

  interActionController.main.push(new modelBlock(x))

}

