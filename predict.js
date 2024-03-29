var myClarifaiApiKey = 'f053c971305549908489be7fc05a6b27';
var myWolframAppId = 'KTGHGJ-2Y5RK5JAPX';

var app = new Clarifai.App({apiKey: myClarifaiApiKey});

/*
  Purpose: Pass information to other helper functions after a user clicks 'Predict'
  Args:
    value - Actual filename or URL
    source - 'url' or 'file'
    */
function predict_click(value, source) {
  var preview = $(".food-photo");
  var file    = document.querySelector("input[type=file]").files[0];
  var loader  = "https://s3.amazonaws.com/static.mlh.io/icons/loading.svg";
  var reader  = new FileReader();

  // load local file picture
  reader.addEventListener("load", function () {
    preview.attr('style', 'background-image: url("' + reader.result + '");');
    doPredict({ base64: reader.result.split("base64,")[1] });
  }, false);

  if (file) {
    reader.readAsDataURL(file);
    $('#concepts').html('<img src="' + loader + '" class="loading" />');
  } else { alert("No file selcted!"); }
}

/*
  Purpose: Does a v2 prediction based on user input
  Args:
    value - Either {url : urlValue} or { base64 : base64Value }
*/
function doPredict(value) {
  app.models.predict(Clarifai.FOOD_MODEL, value).then(function(response) {
      if(response.rawData.outputs[0].data.hasOwnProperty("concepts")) {
        var tag = response.rawData.outputs[0].data.concepts[0].name;
        // var url = 'http://api.wolframalpha.com/v2/query?input='+tag+'%20nutrition%20facts&appid='+myWolframAppId;
        var url = 'http://api.wolframalpha.com/v2/query?input=' + tag + '%20nutrition%20facts&appid=' + myWolframAppId + '&output=json';
        console.log(url)

        // var oReq = new XMLHttpRequest();
        // oReq.open("GET", url);
        // oReq.send();

        // console.log(oReq)

        // var getJson = (url, cb) => {

        // }

        getNutritionalInfo(url, function (result) {
          var preParseCalorie = result.pods[4].subpods[0].img.alt
          $('#concepts').html('<h3>'+ tag + '</h3>' + "<img src='"+result+"'> ");
          
          console.log(preParseCalorie);

          
          var parsedCalorie = preParseCalorie.substring(
            preParseCalorie.lastIndexOf("total calories |") + 16, 
            preParseCalorie.indexOf("Cal |", preParseCalorie.lastIndexOf("total calories |"))
          ).trim();
          console.log(parsedCalorie)
        });
      
      }
    }, function(err) { console.log(err); }
  );
}
