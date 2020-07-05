loadedPages.details = {
  itemid: "",
  initialize: function() {
    loadedPages.details.itemid = window.location.hash.substring(1).split("?")[1];
    var dd = {
        itemid: loadedPages.details.itemid
    }
    api.call("getItemById", function(res) {

      var data = res;
      console.log(data)
      $("#title").html(data.SerialName);
      $("#itemImage").attr("src", "http://85.214.165.56:81/catalog/images/" + data.ImageName);
    }, dd, {}, {});
  }
}
