const express = require('express');

const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('hello');
})

app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });