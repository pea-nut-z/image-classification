// enter selected img again (resets result img)
// click predict again when theres a img (retun nothing happens)

function toggleLoading(item) {
  $("#note").empty();
  if ($("#progress-msg").is(":empty")) {
    item === "model"
      ? $("#progress-msg").html("Loading model...")
      : $("#progress-msg").html("Loading...");
  } else {
    $("#progress-msg").empty();
  }
  $("#progress-dots").toggleClass("lds-ellipsis");
}

function sendNote(note) {
  $("#note").empty();
  let msg;
  if (note === "upload-complete") msg = "Upload complete...\nClick predict!";
  if (note === "predict-complete") msg = "Stop reading.....\nSee predictions!";
  if (note === "predict-error") msg = "No similar items were found.";
  // click predict when there's a broken img
  if (note === "broken-url") msg = "Invalid image URL.";
  // newImg = false && brokenImg = true (click predict before enter /empty url / broken img)
  if (note === "no-upload-image") msg = "Enter an image URL.";
  // newImg = false && brokenImg = false (click predict twice)
  if (note === "double-clicked-predict") msg = "Enter a new URL.";
  $("#note").html(msg);
}

function uploadImage(source) {
  $("#result-image-container").empty();
  $("#selected-image-container").empty();
  $("#prediction-probability").empty();

  let path;

  if (source === "url") {
    path = $("#img-input").val();
  }
  if (source === "local") {
    let reader = new FileReader();
    reader.onload = function () {
      path = reader.result;
    };
    let file = $("#upload-button").prop("files")[0];
    reader.readAsDataURL(file);
  }

  $("#selected-image-container").append(
    "<img id='selected-image' src='" + path + "' class='ml-3' crossorigin='anonymous' alt=''>"
  );

  toggleLoading();
  $("#selected-image").on("load", function () {
    sendNote("upload-complete");
    brokenImg = false;
    newImg = true;
  });

  $("#selected-image").on("error", function () {
    sendNote("broken-url");
  });
}
$("#upload-button").click(function () {});

let model;
$(document).ready(async function () {
  toggleLoading("model");
  model = await tf.loadGraphModel("model/model.json");
  toggleLoading();
  $("#welcome-gif-container").append(
    '<img id="welcome-gif" src="welcome.gif" crossorigin="anonymous" alt="" >'
  );
  sendNotification("enterInput");
});

let firstVisit = true;
let brokenImg = true;
let newImg = false;
$("#enter-button").click(function () {
  if (firstVisit) {
    firstVisit = false;
    $("#welcome-gif-container").empty();
  }
  toggleLoading();
  $("#enter-button").html("👌");
  setTimeout(() => {
    $("#enter-button").html("Enter");
  }, 1000);
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
                `<img id="predicted-image" src="${val}" class='ml-3' crossorigin='anonymous' alt='' >`
              );
            }
          });
      },
    });
    newImg = false;
    toggleLoading();
    sendNote("predict-complete");
  } catch {
    toggleLoading();
    sendNote("predict-error");
  }
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
  } else if (!newImg && !brokenImg) {
    sendNote("double-clicked-predict");
  } else {
    sendNote("no-upload-image");
  }
});
