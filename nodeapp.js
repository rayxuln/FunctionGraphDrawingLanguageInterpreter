const hostname = '127.0.0.1';
const port = 3000;

let express = require("express");

let app = express();

app.use(express.static('./www'));

app.listen(port, ()=>{
  console.log(`Server running at http://${hostname}:${port}/`)
})