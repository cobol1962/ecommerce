loadedPages.search = {
  master: "",
  initialize: function() {
    $("#productDetailS").on('show.bs.modal', function(){
      setTimeout(function() {
        $(".modal-content").scrollTop(0);
      }, 2);
    });
    loadedPages.search.master = $("#master")[0].outerHTML;
    if ($("#search").val() != "") {
      loadedPages.search.doSearch();
    }

  },
  doSearch: function() {
    api.call("search", function(res) {

      if (res.found == "fail") {
        showModal({
          type: "error",
          title: "No Search Results.",
          confirmButtonText: "CONTINUE",
          showCloseButton: true
        })
        return;
      }
      if (res.length == 0) {
       showModal({
         type: "error",
         title: "No Search Results.",
         confirmButtonText: "CONTINUE",
         showCloseButton: true
       })
       return;
     } else {
       loadedPages.search.drawSearch(res);
     }

    }, {search: $("#search").val() })
  },
  drawSearch: function(res) {
    console.log(res);
    $('#searchbackdrop').hide();
    $('#search_div').hide()
    $("#items_div").html("");
    $.each(res, function() {

      if ($("#" + this.ItemID).length == 0) {
          var dv =   $(loadedPages.search.master);
          dv.attr("id", this.ItemID);
          dv.attr("searchitem", this.SerialNo);
          dv.attr("group", this.MainGroup);
          dv.css({
            display: "block"
          })
          if (this.ImageName != "") {
            dv.find("img").attr("src", "http://85.214.165.56:81/catalog/images/" + this.ImageName)
          } else {
            dv.find("img").attr("src", "http://85.214.165.56:81/coster/www/images/crown.png");
            dv.find("img").css({
              maxHeight: 80
            })
          }
          dv.find("[itemid]").attr("itemid", this.ItemID);
          dv.find("[itemname]").attr("itemname", this.ItemName);
          dv.find("[productname]").html(this.SerialName);
          try {
            dv.find("[compnamesdiv]").html(this.CompName.replace(/,/g,"<br />"));
          }  catch(err) {
            dv.find("[compnamesdiv]").html(this.ItemName.replace(/,/g,"<br />"));
          }
          dv.find("[location]").html(this.Warehouse);
          var html = "";
          var pr = parseFloat(this.SalesPrice);
          var ds = parseFloat(this.Discount);
          var prc = pr - ((pr / 100) * ds);
          if ((prc - parseInt(prc)) > 0) {
            prc = parseInt(prc) + 1;
          }
          this.Discount = this.Discount + "%";
          if (this.Discount == "0" || this.Discount == "0%" || this.Discount == "0%%") {
              html += "<span money style='font-size:12px;margin-left:0px;'>" + parseFloat(pr).toLocaleString("nl-NL", {
                  style: 'currency',
                  currency: "EUR"
              }) + "</span></div>";
            //  html += "<br /><span style='margin-left:0px;font-weight:bold;font-size:12px;'>" + row["ItemID"] + "</span>";

          } else {
              html += "<div  money style='margin-left:0px;margin-top:0px;font-size:12px;'><span style='color:red;'>" + this.Discount + " </span><span style='text-decoration:line-through;'>" + parseFloat(pr).toLocaleString("nl-NL", {
                  style: 'currency',
                  currency: "EUR"
              }) + "</span>";

              html += "<br /><span style=''>" + parseFloat(prc).toLocaleString("nl-NL", {
                  style: 'currency',
                  currency: "EUR"
              }) + "</span><br />" + "</div>";
          }
          $(html).appendTo(dv.find("[moneycontainer]"));
          dv.find("[serial]").html(this.ItemID);
          dv.appendTo($("#items_div"));
        }
    })
    if (res.length > 1) {
      $(".recycling").unbind("click");
      $(".recycling").bind("click", function(e) {
          loadedPages.search.showProductInfo(this);
      })
    } else {
      $('<button type="button" id="ati" data-dismiss="modal" style="" onclick="loadedPages.search.confirmAddToInvoice(this);" class="btn-bigblack"><span style="width:100%;text-align:left;margin-top:5px;">ADD TO BAG</span></button>').appendTo($("#items_div"));
    }
  },
  confirmAddToInvoice: function(obj) {
    showModal({
      title: "ADD ITEM " + $("#items_div").find("[searchitem]").attr("searchitem") + " TO BAG?",
      allowBackdrop: false,
      showCancelButton: true,
      cancelButtonText: "CANCEL",
      confirmButtonText: "CONFIRM",
      confirmCallback: function() {
        loadedPages.search.checkAddToInvoice(obj);
        $(obj).remove();
      }
    });
  },
  checkAddToInvoice(obj) {
      var iid = $("#productDetail").attr("item");
      var info = $("[itemid='" + iid + "']").find("[money]").html();
      if (obj === undefined) {
        var sno = $('#item_serials_body').find(".selected").find("td").eq(2).html()
      } else {
        var sno = $("#items_div").find("[searchitem]").attr("searchitem");
      }
      if ($('#item_serials_body').find(".selected").length == 0 && obj === undefined) {
          alert("Select serial")
          return;
      } else {
          var dd = {
              serialno: sno
          }
          api.call("getItemBySerial", function(res) {
              var data = res;
              console.log(res);
              if (data.ImageName == "") {
                data.ImageName = "crown.png";
              }
              if (data["Discount"].indexOf("%") == -1) {
                data["Discount"] = data["Discount"] + "%";
              }
              var obj = {
                  imageURL: "<img style='width:100px;height:auto;' src='http://85.214.165.56:81/catalog/images/" + data.ImageName + "' />",
                  img: "<img style='width:250px;height:auto;' src='http://85.214.165.56:81/catalog/images/" + data.ImageName + "' />",
                  SerialNo: data.SerialNo,
                  CompName: res.CompName.replace(/,/g, "<br />"),
                  productName:  data.SerialName,
                  SalesPrice: data["SalesPrice"],
                  Discount: data["Discount"],
                  MainGroup: data.MainGroup,
                  info: info
              }
              try {

              window.parent.postMessage("addToInvoice#" + JSON.stringify(obj), "*");
            } catch(err) {
              alert(err);
            }
          }, dd, {}, {});
          $(".back").unbind("click");
          if ($("#items_div").find("[group]").attr("group") != "Diamonds") {
            $("<div  class='back'><p>GO TO CATALOG</p></div>").appendTo($("#items_div"));
            $(".back").bind("click", function() {
              loadPage("invoice");
            })
          } else {
            $(".btn-bigblack").remove();
            $("<div  class='back'><p>GO TO DIAMONDLIST</p></div>").appendTo($("#items_div"));
            $(".back").bind("click", function() {
              loadPage("diamonds");
            })
          }
      }
  },
  showProductInfo: function(o) {
    var obj = $(o);
      var dd = {
          itemid: $(obj).attr("itemid")
      }
      $("#productDetailS").attr("item", $(obj).attr("itemid"));
      var inm = $(obj).find("[itemname]").attr("itemname");
      var pd = $(obj).find("[compnamesdiv]").clone();
      var mn = $(obj).find("[money]").clone();
      api.call("getItemByIdSearch", function(res) {
          var itemid = $(obj).attr("itemid");
          var data = res;
          $("#title").html(data.productName + "<br /> " + data.CompName);
          var img = $("<img src='http://85.214.165.56:81/catalog/images/" + data.ImageName + "' style='height:auto;'/>");
          img.removeAttr("style");
          $("#modalImage").find("img").remove();
          img.css({
              height: "auto",
              maxHeight: 90
          })
          $("#modalImage").html("");
          img.appendTo($("#modalImage"));
          var obj = {
              itemid: data.ItemID
          }
          $("#pDetails").html("");
          pd.css({
            display: "block",

          })
          $("<strong style='font-size:15px;'>" + inm + "</strong>").appendTo($("#pDetails"));
          pd.appendTo($("#pDetails"));

          mn.appendTo($("#pDetails"));
          $('#item_serials_body').find("tr").unbind('click');
          $("#item_serials_body").find("tr").remove();
          api.call("getSerialsSearch", function(res) {
            console.log(res);
              $.each(res, function() {
                var ths = this;
                var cname = (data.CompName === undefined || data.CompName == null) ? "" : data.CompName;
                  if ($("#invoiceBody").find("[serialno='" + this.SerialNo + "']").length == 0) {
                      $("<tr><td style='display:none;'>" + data.ItemID + "</td><td style='display:none;'>" + cname.replace(/,/g,"<br />") + "</td><td>" + this.SerialNo + "</td><td style='text-align:left;'>" + this.SerialName + "<br />"  + this.Warehouse + "</td><td>" + this.OnhandQnt + "</td></tr>").appendTo($("#item_serials_body"));
                  }
              })
              $('.colordesc').tooltip("hide");
              $('.compname').tooltip("hide");

              $("#productDetailS").modal("show");
              $("#ati").prop("disabled", true)
              $('#item_serials_body').find("tr").bind('click', function() {
                  if ($(this).hasClass("selected")) {
                      $(this).removeClass("selected");
                      $("#ati").prop("disabled", true)
                  } else {
                      $('#item_serials_body').find("tr").removeClass("selected");
                      $(this).addClass("selected");
                      $("#ati").prop("disabled", false)
                  }
              })
          }, obj, {}, {});
      }, dd, {}, {});

  }

}
