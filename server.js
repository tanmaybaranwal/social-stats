const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const axios = require('axios').default;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs')

app.get('/', async function (req, res) {
  const facebookInsights = await getFacebookInsight()
  const linkedinInsights = await getLinkedinInsights()
  console.log(facebookInsights)
  console.log(linkedinInsights)
  res.render('index', {insights: { facebook: 43 }, error: null});
})

function to_datetime(time){
  var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
  return date
}

  
function formatFacebookInsight(fb_response){
  var fb_ins = {}
  data = fb_response.data
  if (!data){
    return {
      insight: {},
      error: "Insight data not found"
    }
  }
  data.forEach(function(each) {
    v1 = each.values[0]
    v2 = each.values[1]
    current_value = 0
    previous_value = 0 
    if (to_datetime(v1.end_time) < to_datetime(v2.end_time)) {
      current_value = v2.value
      previous_value = v1.value
    } else {
      current_value = v1.value
      previous_value = v2.value
    }
    fb_ins[each.name]
  })
}

function getFacebookInsight() {
  return new Promise(async function (resolve, reject) {
    try {
      var url = "http://localhost:3002/api/v1/insights/facebook";
      var updateResult = [];
      await axios.post(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'                            
        },
      }).then(function (response) {
        updateResult = response["data"]
      })
      .catch(function (error) {
        console.log(error);
      });                
      resolve(updateResult);
    } catch (err) {
      console.log(err)
    } finally {}
  }).catch((err) => {
    console.log(err)
  });
}

function getLinkedinInsights() {
  return new Promise(async function (resolve, reject) {
    try {
      var url = "http://localhost:3002/api/v1/insights/linkedin";
      var updateResult = [];
      await axios.post(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'                            
        },
      }).then(function (response) {
        updateResult = response["data"];
      })
      .catch(function (error) {
        console.log(error);
      });                
      resolve(updateResult);
    } catch (err) {
      console.log(err)
    } finally {}
  }).catch((err) => {
    console.log(err)
  });
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
