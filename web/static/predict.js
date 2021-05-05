// enter selected img again (resets result img)
// click predict again when theres a img (retun nothing happens)
//load model -> show welcome ->
function toggleLoading() {
  $("#res-display").empty();
  $("#welcome-gif-container").empty();
  if ($("#progress-msg").is(":empty")) {
    if (firstMounted) {
      $("#progress-msg").html("Loading model...");
      firstMounted = false;
    } else {
      $("#progress-msg").html("Loading...");
    }
  } else {
    $("#progress-msg").empty();
  }
  $("#progress-dots").toggleClass("lds-ellipsis");
}

function respond(res) {
  $("#res-display").empty();
  $("#welcome-gif-container").empty();
  let msg;
  if (res === "upload-complete") msg = "Click predict!";
  if (res === "predict-complete") msg = "See predictions!";
  if (res === "predict-error") msg = "No similar items were found.";
  // click predict when there's a broken img
  if (res === "broken-url") msg = "Invalid image URL.";
  // newImg = false && brokenImg = true (click predict before enter /empty url / broken img)
  if (res === "no-upload-image") msg = "Enter an image URL.";
  // newImg = false && brokenImg = false (click predict twice)
  if (res === "broken-file") msg = "Invalid image format.";
  if (res === "double-clicked-predict") msg = "Enter a new URL.";
  $("#res-display").html(msg);
}

$(function () {
  $("#file-selector").change(function (event) {
    toggleLoading();
    $("#predicted-images-container").empty();
    $("#selected-image-container").empty();
    $("#prediction-probability").empty();
    const path = URL.createObjectURL(event.target.files[0]);
    $("#selected-image-container").append(
      `<img id="selected-image" src="${path}" crossorigin="anonymous" alt="">`
    );
    toggleLoading();
    $("#selected-image").on("load", function () {
      respond("upload-complete");
      brokenImg = false;
      newImg = true;
    });
    $("#selected-image").on("error", function () {
      respond("broken-file");
    });
  });
});

let firstMounted = true;
let brokenImg = true;
let newImg = false;
let model;

// FIRST MOUNTED
$(document).ready(async function () {
  toggleLoading();
  model = await tf.loadGraphModel("model/model.json");
  toggleLoading();
  $("#welcome-gif-container").append(
    '<img id="welcome-gif" src="welcome.gif" crossorigin="anonymous" alt="" >'
  );
});

//ENTER BTN
$("#enter-btn").click(function () {
  toggleLoading();

  $("#enter-btn").html("👌");
  setTimeout(() => {
    $("#enter-btn").html("Enter");
  }, 1000);

  $("#predicted-images-container").empty();
  $("#selected-image-container").empty();
  $("#prediction-probability").empty();

  let path = $("#url-input").val();
  $("#selected-image-container").append(
    `<img id="selected-image" src="${path}" crossorigin="anonymous" alt="">`
  );
  toggleLoading();
  $("#selected-image").on("load", function () {
    respond("upload-complete");
    brokenImg = false;
    newImg = true;
  });

  $("#selected-image").on("error", function () {
    respond("broken-url");
  });
});

// PREDICT FUNC
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
              $("#predicted-images-container").append(
                `<img id="predicted-image" src="${val}" class='ml-3' crossorigin='anonymous' alt='' >`
              );
            }
          });
      },
    });
    newImg = false;
    toggleLoading();
    respond("predict-complete");
  } catch {
    toggleLoading();
    respond("predict-error");
  }
}

// PREDICT BTN
$("#predict-btn").click(function () {
  if (!brokenImg && newImg) {
    $("#predict-btn").html("👌");
    toggleLoading();
    setTimeout(() => {
      $("#predict-btn").html("Predict");
    }, 500);

    setTimeout(() => {
      analyzeImg();
    }, 50);
  } else if (!newImg && !brokenImg) {
    respond("double-clicked-predict");
  } else {
    respond("no-upload-image");
  }
});
