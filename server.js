const express = require('express')
const app = express()
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    res.render('index', {insights: { facebook: 43 }, error: null});
})
  
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
