// two error msgs and enter selected img again resets result img
// click predict again when theres a img

let model;
$(document).ready(async function () {
  $(".progress-bar").show();
  $("#loading-msg").hide();
  console.log("Loading model...");
  model = await tf.loadGraphModel("model/model.json");
  console.log("Model loaded.");
  $(".progress-bar").hide();
});

let brokenImg;
let newImg;

function sendUrlError() {
  brokenImg = true;
  alert("Invalid URL.");
}

function sendImgError() {
  alert("Enter a new image url for prediction.");
}

$("#enter-button").click(function () {
  brokenImg = false;
  newImg = true;
  $("#selected-image-container").empty();

  let dataURL = $("#img-url").val();
  $("#selected-image-container").append(
    "<img id='selected-image' src='" +
      dataURL +
      "' class='ml-3' crossorigin='anonymous' alt='' onerror='sendUrlError()'>"
  );
  $("#result-image-container").empty();
});

async function analyzeImg() {
  let image = $("#selected-image").get(0);
  // Pre-process the image
  let tensor = tf.browser
    .fromPixels(image, 3)
    .resizeNearestNeighbor([224, 224]) // change the image size here
    .expandDims()
    .toFloat()
    .reverse(-1);

  let predictions = await model.predict(tensor).data();

  let match = Array.from(predictions)
    .map(function (p, i) {
      // this is Array.map
      return {
        probability: p,
        className: TARGET_CLASSES[i], // we are selecting the value from the obj
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 1);

  let category = match[0].className;
  let probability = match[0].probability.toFixed(6);

  $("#prediction-probability").html(`${category} Probability: ${probability}`);

  $.ajax({
    url: `/images/${category}`,
    success: function (data) {
      $(data)
        .find("a")
        .attr("href", function (i, val) {
          if (val.match(/\.(jpe?g)$/)) {
            $("#result-image-container").append(
              "<img src='" + val + "' class='ml-3' crossorigin='anonymous' alt='' >"
            );
          }
        });
    },
  });

  $("#loading-msg").hide();
}

$("#predict-button").click(function () {
  if (!brokenImg && newImg === true) {
    // startPredict(analyzeImg);
    newImg = false;
    $("#loading-msg").show();
    setTimeout(() => {
      analyzeImg();
    }, 50);
  } else {
    sendImgError();
  }
});
