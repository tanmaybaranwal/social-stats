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

  res.render('index', {insights: { facebook: facebookInsights, linkedin: linkedinInsights }, error: null});
})

function to_datetime(time) {
  var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," "))
  return date;
}

function getCompanyStatistics(companyStatistics) {
  s1 = companyStatistics.elements[0]
  s2 = companyStatistics.elements[1]
  if (s1.timeRange.start < s2.timeRange.start) {
    [s1, s2] = [s2, s1]; 
  }
  current_value = s1.totalPageStatistics.views.allPageViews.pageViews
  previous_value = s2.totalPageStatistics.views.allPageViews.pageViews

  return {
    "current_value": current_value,
    "previous_value": previous_value,
    "increase": previous_value < current_value,
    "difference": (100 * Math.abs( (current_value - previous_value) / ( (current_value+previous_value)/2 ) )).toFixed(2)
  }
}

function getFollowerStatistics(followerStatistics) {
  f1 = followerStatistics.elements[0]
  f2 = followerStatistics.elements[1]

  if (f1.timeRange.start < f2.timeRange.start) {
    [f1, f2] = [f2, f1]; 
  }
  current_value = f1.followerGains.organicFollowerGain + f1.followerGains.paidFollowerGain
  previous_value = f2.followerGains.organicFollowerGain + f2.followerGains.paidFollowerGain

  return {
    "current_value": current_value,
    "previous_value": previous_value,
    "increase": previous_value < current_value,
    "difference": (100 * Math.abs( (current_value - previous_value) / ( (current_value+previous_value)/2 ) )).toFixed(2)
  }
}

function getSocialAction(socialActionResults) {
  var socialAction = [] // since we don't know the post id by time, relying on order
  for (var key in socialActionResults.results){
    socialAction.push(socialActionResults.results[key])
  } 
  s1 = socialAction[0]
  s2 = socialAction[1]
  
  current_value = s1.likesSummary.totalLikes
  previous_value = s2.likesSummary.totalLikes

  return {
    "current_value": current_value,
    "previous_value": previous_value,
    "increase": previous_value < current_value,
    "difference": (100 * Math.abs( (current_value - previous_value) / ( (current_value+previous_value)/2 ) )).toFixed(2)
  }
}

function formatLinkedinInsight(ln_response) {
  var ln_ins = {
    "companyStatistics": getCompanyStatistics(ln_response.companyStatistics),
    "followerStatistics": getFollowerStatistics(ln_response.followerStatistics),
    "socialAction": getSocialAction(ln_response.socialAction)
  }
  return ln_ins
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
    if (to_datetime(v1.end_time) < to_datetime(v2.end_time)) {
      [v1, v2] = [v2, v1]
    }
    current_value = v1.value
    previous_value = v2.value
    fb_ins[each.name] = {
      "current_value": current_value,
      "previous_value": previous_value,
      "increase": previous_value < current_value,
      "difference": (100 * Math.abs( (current_value - previous_value) / ( (current_value+previous_value)/2 ) )).toFixed(2)
    }
  })
  return fb_ins;
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
        updateResult = formatFacebookInsight(response.data)
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
        updateResult = formatLinkedinInsight(response.data)
        console.log(updateResult)
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
