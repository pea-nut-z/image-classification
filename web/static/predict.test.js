beforeEach(() => {
  document.body.innerHTML = '<div id="welcome-gif-container">' + "</div>";
  require("./predict");
});

it("layout", () => {
  const $ = require("../node_modules/jquery/dist/jquery");
  expect($("#welcome-gif-container").length).toEqual(1);
});
