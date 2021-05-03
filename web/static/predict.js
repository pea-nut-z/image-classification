// enter selected img again (resets result img)
// click predict again when theres a img (retun nothing happens)

function toggleLoading() {
  $("#error-msg").empty();
  if ($("#load-msg").is(":empty")) {
    $("#load-msg").html("Loading...");
  } else {
    $("#load-msg").empty();
  }
  $("#progress-bar").toggleClass("lds-ellipsis");
}

function sendErrMsg(issue) {
  let msg;
  if (issue === "predictionErr") {
    // prediction went wrong
    msg = "No similar items were found.";
  }
  if (issue === "brokenImgUrl") {
    // clicks predict when there's a broken img
    // broken img
    msg = "Invalid image URL.";
  }
  if (issue === "noImages") {
    // click predict before enter

    // empty url or broken img
    msg = "Load an image for prediction.";
  }
  $("#error-msg").html(msg);
}

let model;
$(document).ready(async function () {
  toggleLoading();
  model = await tf.loadGraphModel("model/model.json");
  toggleLoading();
});

let brokenImg = true;
let newImg = undefined;

function sendImgError() {
  alert("Enter a new image url for prediction.");
}

function sendButtonError() {}

$("#enter-button").click(function () {
  toggleLoading();
  $("#enter-button").html("👌");
  setTimeout(() => {
    $("#enter-button").html("Enter");
  }, 500);

  $("#result-image-container").empty();
  $("#selected-image-container").empty();
  $("#prediction-probability").empty();

  let imgUrl = $("#img-input").val();
  $("#selected-image-container").append(
    "<img id='selected-image' src='" + imgUrl + "' class='ml-3' crossorigin='anonymous' alt=''>"
  );

  $("#selected-image").on("load", function () {
    brokenImg = false;
    newImg = true;
  });

  $("#selected-image").on("error", function () {
    sendErrMsg("brokenImgUrl");
  });
  toggleLoading();
});

async function analyzeImg() {
  try {
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
                "<img id='predicted-image' src='" +
                  val +
                  "' class='ml-3' crossorigin='anonymous' alt='' >"
              );
            }
          });
      },
    });

    newImg = false;
  } catch {
    sendErrMsg("predictionErr");
  }
  toggleLoading();
}

$("#predict-button").click(function () {
  if (!brokenImg && newImg) {
    $("#predict-button").html("👌");
    toggleLoading();

    setTimeout(() => {
      $("#predict-button").html("Predict");
    }, 500);

    setTimeout(() => {
      analyzeImg();
    }, 50);
  } else if (brokenImg) {
    sendErrMsg("noImages");
  } else {
    return;
  }
});
