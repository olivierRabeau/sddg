function computerPlays() {
    return new Promise((successCallback, failureCallback) => {
      console.log("C'est fait");
      if (Math.floor(Math.random()*3) > 0) {
        successCallback("Réussite");
      } else {
        failureCallback("Échec");
      }
    })
  }
  
  const promise = computerPlays();
  promise.then(console.log, console.log);
  