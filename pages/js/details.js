loadedPages.details = {
  itemid: "",
  data: {},
  quantity: 1,
  diamond: 0,
  initialize: function() {
    $("#currency").unbind("change");
    $("#currency").bind("change", function() {
      loadedPages.details.drawMoney();
    });
    $("#share").html("");
    loadedPages.details.itemid = window.location.hash.substring(1).split("?")[1];

    var dd = {
        itemid: loadedPages.details.itemid

    }
    api.call("checkIsDiamond", function(res) {
      loadedPages.details.diamond = res.n;
      loadedPages.details.draw(res.n);
    }, dd, {},{});

  },
  draw: function(diamond) {
    loadedPages.details.itemid = window.location.hash.substring(1).split("?")[1];
    if (shoppingCartContent[loadedPages.details.itemid] !== undefined) {
      loadedPages.details.quantity = shoppingCartContent[loadedPages.details.itemid].quantity;
    }
    if (diamond > 0) {
        var dd = {
            itemid: loadedPages.details.itemid,
            diamonds: 1
        }
    } else {
      var dd = {
          itemid: loadedPages.details.itemid

      }
    }
    api.call("getItemById", function(res) {
    
      var data = res;
      loadedPages.details.data = res;
      if (loadedPages.details.diamond == "0") {
        $("#title").html(data.SerialName);
      } else {
          $("#title").html("Diamond");
      }
      var url = "http://85.214.165.56:81/ecommerce/share.php?itemid=" + loadedPages.details.itemid;
      $('<button class="button" data-sharer="facebook" id="facebook_share" style="display:none;" data-url="' + url + '">Share on Facebook</button>').appendTo($("#share"));
      $('<button class="button" id="twitter_share" style="display:none;" data-sharer="twitter" data-width="800" data-height="600" data-title="' + data.SerialName + '" data-url="' + url + '">Share</button>').appendTo($("#share"));
      $('<button class="button" data-sharer="viber" style="display:none;" id="viber_share" data-title="' + data.SerialName + '" data-url="' + url + '">Share on Viber</button>').appendTo($("#share"));
      $('<button class="button" id="whatsapp_share"  style="display:none;"  data-sharer="whatsapp" data-title="' + data.SerialName + '" data-url="' + url + '">Share on Whatsapp</button>').appendTo($("#share"));
      window.Sharer.init();
      $("<a facebook onclick=fireShare('facebook','" + loadedPages.details.itemid + "') style='cursor:pointer;'><img style='width:46px;margin-left: 10px;' src='images/facebook-share-icon.png' /></a>").appendTo($("#share"));
      $("<a twitter onclick=fireShare('twitter','" + loadedPages.details.itemid + "') style='cursor:pointer;'><img style='width:46px;margin-left: 10px;' src='images/twitter-share-icon.png' /></a>").appendTo($("#share"));
      $("<a twitter onclick=fireShare('viber','" + loadedPages.details.itemid + "') style='cursor:pointer;'><img style='width:46px;margin-left: 10px;' src='images/viber-share-icon.png' /></a>").appendTo($("#share"));
      $("<a twitter onclick=fireShare('whatsapp','" + loadedPages.details.itemid + "') style='cursor:pointer;'><img style='width:56px;margin-left: 10px;' src='images/whatsapp-share-icon.jpg' /></a>").appendTo($("#share"));

      if (data.ImageName == "") {
        data.ImageName = "crown.png";
      }
      $("#itemImage").attr("src", "http://85.214.165.56:81/catalog/images/" + data.ImageName);
      var str = "";

      api.call("getItemDescription", function(res) {
        console.log(res)
        if (data.CompName != null) {
          if (res["qnt"] != "0") {
            str += "<b>Total Stones:</b> " + res["qnt"] + " <br /><b>Total Weight:</b> " + res["weight"] + "crt" + "<br />";
          } else {
            str += "<b>Total Weight:</b> " + res["weight"] + "crt" + "<br />";
          }
            str += res.description;
            $("#description").html(str);

        }
          loadedPages.details.drawMoney();
      }, dd, {}, {})
    }, dd, {}, {});
  },
  drawMoney: function() {
    $('#navbackdrop').hide();
    $('#tt').hide();
    var q = parseInt(loadedPages.details.quantity);
    var data = loadedPages.details.data;
    var html = "";
    html += "<div style='font-size:18px;'><label><b>Quantity: </b></label><input id='qnt' onchange='loadedPages.details.recalculate();' value='" + loadedPages.details.quantity + "' style='width:70px;' type='numeric' /></div>";
    var cc = $("#currency").val();
    var pr =  (parseFloat(data["SalesPrice"])) * parseFloat($("#currency").find("option:selected").attr("rate"));
    var ds = parseFloat(data["Discount"].replace("%", ""));
    var prc = parseInt(pr - ((pr / 100) * ds));
    var originalPrice = parseFloat(data["SalesPrice"]);
    var originalRealPrice = parseInt(originalPrice - ((originalPrice / 100) * ds));
    if (data["Discount"] == "0" || data["Discount"] == "0%") {
        html += "<div money><span price original='" + originalPrice + "' realvalue='" + (q * parseFloat(Math.ceil(pr))) + "' style='font-size:18px;margin-left:0px;'>" + (q * parseFloat(Math.ceil(pr))).toLocaleString("nl-NL", {
            style: 'currency',
            currency: cc
        }) + "</span></div>";
    } else {
        html += "<div  money style='margin-left:0px;margin-top:0px;font-size:18px;'><span style='color:red;'>" + data["Discount"] + " </span><span price original='" + originalPrice + "' realvalue='" + (q * Math.ceil(parseFloat(pr))) + "' style='text-decoration:line-through;'>" + (q * Math.ceil(parseFloat(pr))).toLocaleString("nl-NL", {
            style: 'currency',
            currency: cc
        }) + "</span>";
        html += "<br /><span realprice original='" + originalRealPrice + "' realvalue='" + (q * Math.ceil(parseFloat(prc))) + "' style=''>" + (q * Math.ceil(parseFloat(prc))).toLocaleString("nl-NL", {
            style: 'currency',
            currency: cc
        }) + "</span><br />" + "</div>";
    }
    html += '<br /><button onclick="loadedPages.details.checkAddToInvoice();" id="atc" class="btn-black">BUY NOW</button>';
    $("#foot").html(html);
  },
  checkAddToInvoice: function() {

     var data = loadedPages.details.data;

     if (data.ImageName == "") {
       data.ImageName = "crown.png";
     }
      var obj = {
          imageURL: "<img style='width:100px;height:auto;' src='http://85.214.165.56:81/catalog/images/" + data.ImageName + "' />",
          img: "<img style='width:250px;height:auto;' src='http://85.214.165.56:81/catalog/images/" + data.ImageName + "' />",
            SerialNo: data.SerialNo,
            ItemID: data.ItemID,
            CompName: $("#composition").html(),
            productName: (loadedPages.details.diamond == "0") ? data.SerialName : "Diamond",
            quantity: loadedPages.details.quantity,
            SalesPrice: parseFloat(data["SalesPrice"]),
            Discount: data["Discount"],
            MainGroup: data.MainGroup,
            total: parseFloat($("[price]").attr("realvalue")),
            toPay:  (isNaN(parseFloat($("[realprice]").attr("realvalue")))) ? parseFloat($("[price]").attr("realvalue")) : parseFloat($("[realprice]").attr("realvalue")),
            info: ""
      }
      loadedPages.details.addToInvoice(obj)
  },
  recalculate: function() {
    loadedPages.details.quantity = $("#qnt").val();
    loadedPages.details.drawMoney();
  },
  addToInvoice: function(row) {
    var change = (!(shoppingCartContent[row["ItemID"]] === undefined));
    try {
      delete shoppingCartContent[row["ItemID"]];
    } catch(err) {

    }
    if (row["Discount"] == "0") {
      row["Discount"] = "0%";
    }
    if (row["Discount"] == "0%") {
      var realPrice = row["SalesPrice"];
      row["discountLocked"] = false;
    } else {
      var pr = parseFloat(row["SalesPrice"]);
      var ds = parseFloat(row["Discount"]);
      var realPrice = pr - ((pr / 100) * ds);
      row["discountLocked"] = true;
    }
    row["additionalDiscount"] = "";
    row["startRealPrice"] = realPrice;
    row["realPrice"] = realPrice;
    row["productName"] += "<br />" + row["CompName"];
    shoppingCartContent[row["ItemID"]] = row;
    $("#lblCartCount").html(" " + Object.keys(shoppingCartContent).length);
    $("#toggleShoppigCart").removeClass("empty");
    showModal({
        type: "ok",
        title: (change) ? "Quantity changed succesfully" : "Item added to your shopping bag",
        cancelButtonText: "CONTINUE",
        confirmButtonText: "CHECKOUT",
        confirmCallback: function()  {
         loadPage("shoppingCart");
        }
    });
  }
}
