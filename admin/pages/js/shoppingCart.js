loadedPages.shoppingCart = {
  firstDraw: true,
  firstDC: true,
  showDiscount: false,
  total: 0,
  fullprice: 0,
  vatexcluded: 0,
  vat: 0,
  administrative: 0,
  vatrefunt: 0,
  topay: 0,
  masterdiscount: 0,
  discountClicked: false,
  dApproved: {},
  locked: [],
  approvedRequested: false,
  initialize: function() {
    $("#dapproved").typeahead({
      items: "all",
      scrollHeight: 100,
      source: spersons,
      autoSelect: true,
      maxLength: 5,
      afterSelect: function(obj) {

        $("#showDiscount").prop("disabled", false);
        loadedPages.shoppingCart.dApproved = obj;
         $("#dpersonid").val(obj.id);
         $("#dpersonname").val(obj.name);

         $("#dap").html(obj.name)
         localStorage.dapproved = obj.id;
         localStorage.dapprovedname = obj.name;
         if (window.StatusBar){

           try {
               window.StatusBar.show();
               setTimeout(function(){
                   window.StatusBar.hide();
               },5);
             } catch(err) {

             }
         }
      }
    });
    $("#dapproved").bind("change", function() {
      $("#dap").html($("#dapproved").val())
    })
    $("#dapproved").bind("blur", function() {
      try {

       if (window.StatusBar) window.StatusBar.hide();
     } catch(err) {

     }
    })
  //  $('#dapproved').typeahead('val', myVal);
    if (localStorage.isEU === undefined) {
      localStorage.isEU = "0";
    }
     loadedPages.shoppingCart.drawCart();
     if ($("#toggleShoppigCart").hasClass("empty")) {
        $("#fullshoppingcart").hide();
        $("#emptyshoppingcart").show();
      } else {
        $("#fullshoppingcart").show();
        $("#emptyshoppingcart").hide();
      }
      $("#cartToPay").bind("click", function() {

        $("#cartToPay").css({
          backgroundColor: "CED0CF"
        })
      })
      $("#cartToPay").bind("change", function() {
        loadedPages.shoppingCart.recalculateDiscount();
      //  $("#cartToPay").val(parseFloat($("#cartToPay").val()).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
      })
      $("#cartToPay").bind("blur", function() {

        $(this).css({
          background: "transparent"
        })
      })
  },
  drawCart: function() {

    var hasDiscount = false;
    var totalDiscount = 0;
    $("#items").hide();
    $("#items").html("");
    $("#lblCartCount").html(" " + Object.keys(shoppingCartContent).length);
    if (Object.keys(shoppingCartContent).length == 0) {
      $("#toggleShoppigCart").addClass("empty");
      $("#fullshoppingcart").hide();
      $("#emptyshoppingcart").show();
    } else {
      $("#toggleShoppigCart").removeClass("empty");
    }
     loadedPages.shoppingCart.total = 0;
     var ii = 0;
     var ttl1 = 0;
    for (var key in shoppingCartContent) {
       var obj = shoppingCartContent[key];
       console.log(obj)
       if (loadedPages.shoppingCart.firstDraw) {
           obj.Discount = ((obj.Discount == "0%") ? "" : (obj.Discount));

       }
       if (obj.Discount != "") {
         var oo = parseInt(obj.Discount.replace("%", ""));
         if (oo <= 0) {
           obj.Discount = "";
           obj.realPrice = obj.startRealPrice;
         }
       }
       shoppingCartContent[key] = obj;
       if (obj.Discount != "" && !obj.discountLocked) {
         if (obj.Discount != "" && obj.Discount != "%") {
            hasDiscount = true;
             var sm = parseFloat(obj.SalesPrice);
             if (obj.Discount.indexOf("%") > -1) {
               var prc = parseFloat(obj.Discount.replace("%", ""));
               totalDiscount += prc;
               obj.realPrice = sm - ((sm / 100) * prc);
             } else {
               var prc = parseFloat(obj.Discount);
               totalDiscount += prc;
               obj.realPrice = sm - prc;
             }
           } else {
             obj.realPrice = obj.SalesPrice;
           }
           if ((obj.realPrice - parseInt(obj.realPrice)) > 0) {
             obj.realPrice = parseInt(obj.realPrice) + 1;
           } else {
             obj.realPrice = parseInt(obj.realPrice);
           }

       }
       if (obj.additionalDiscount != "" && obj.discountLocked) {
         if (obj.additionalDiscount != "") {

             var sm = parseFloat(obj.startRealPrice);
             if (obj.additionalDiscount.indexOf("%") > -1) {
               var prc = parseFloat(obj.additionalDiscount.replace("%", ""));
               totalDiscount += prc;
               obj.realPrice = parseInt(sm - ((sm / 100) * prc));
             } else {
               var prc = parseFloat(obj.additionalDiscount);
               totalDiscount += parseInt(prc);
               obj.realPrice = parseInt(sm - prc);
             }

           } else {

             obj.realPrice = obj.startRealPrice;
           }
           obj.realPrice = parseInt(obj.realPrice);
           if ((obj.realPrice - parseInt(obj.realPrice)) > 0) {
             obj.realPrice = parseInt(obj.realPrice) + 1;
           } else {
             obj.realPrice = parseInt(obj.realPrice);
           }
       }
       if ((obj.realPrice - parseInt(obj.realPrice)) > 0) {
         obj.realPrice = parseInt(obj.realPrice) + 1;
       } else {
         obj.realPrice = parseInt(obj.realPrice);
       }
       loadedPages.shoppingCart.total +=  parseFloat(obj.realPrice);
       loadedPages.shoppingCart.fullprice += parseFloat(obj.SalesPrice);
       obj.imageURL = obj.imageURL.replace("50px", "100px");
       var html = "<div root style='margin-top:30px;font-size:12px;'><div id='" + obj.ItemID + "' serial='" + obj.ItemID + "' style='border-top:1px solid #e2e2e2;min-height:150px;padding:10px;padding-bottom:20px;width:100%;position:relative;'>";
       html += "<div>" + ((obj.imageURL != "") ? obj.imageURL : "<img style='width:100px;' src='http://85.214.165.56:81/coster/www/images/crown.png' />");
       html += "<br /><span onclick='loadedPages.shoppingCart.removeItem(this);' style='cursor:pointer;margin-left:25px;color:#ADADAD;'>Remove</span></div>";
       html += "<div pdata style='position:absolute;top:10px;left:120px;color:#ADADAD;'>" + obj.ItemID + "<br />";
       if (obj.productName !== undefined && obj.productName != "undefined") {
         html += "<span productname style='color:black;max-width:300px;min-width:300px;'>" + obj.productName.replace("undefined", "") + "</span>";
        }
      // html += "<div style='position:absolute;right:0px;color:black;font-size:13px;'>";
      html += "<br /><div style='float:right;'><label style='color:black;font-size:15px;'>Quantity:&nbsp;</label><input onchange='loadedPages.shoppingCart.recalculate(this);' style='color:black;font-size:13px;text-align:right;width:70px;' quantity type='number' itemid='" + obj.ItemID + "' value='" + obj.quantity + "' /></div>";

     if (obj.Discount != "" && obj.Discount != "%") {

          html += "<div style='float:right;color:black;width:100%;padding-top:5px;'>";

          if (!obj.discountLocked) {
            html += "<table class='dsct'  spdiscount style='display:none;float:left;'><tr>";
            html += "<td onclick='loadedPages.shoppingCart.applyDiscount(this);'>Apply</td>";
            html += "<td><div serial='" + obj.ItemID + "' onclick='loadedPages.shoppingCart.switchPercent(this);' spdiscount style='display:none;' class='discounttype " + ((obj.discountType === undefined) ? "" : obj.discountType) + "'></div></td>";
            html += "<td><input spdiscount a  value='" + obj.Discount + "' type='text' class='form-control' style='width:50px;clear:both;text-align:right;float:right;width:65px;display:none;' placeholder='Discount' /></td>";
            html += "</tr></table><br />";
          }

          if (obj.discountLocked) {
            html += "<div style='float:right;text-align:right;'><span style='color:red;'>";
          } else {

            html += "<div style='margin-top:-22px;float:right;text-align:right;'><span style='color:red;'>";
          }
          html += "<b>" + obj.Discount + "</b>&nbsp;</span><span style='text-decoration:line-through;'>" + (parseFloat(obj.SalesPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span>";
          html += "<br /><span realvalue='" + parseInt(obj.realPrice) + "'>" + (parseInt(obj.realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div></div>";
        //  html += '</div>';
        } else {
          if (!obj.discountLocked) {

            html += "<br /><table class='dsct' spdiscount style='display:none;float:left;'><tr>";
            html += "<td onclick='loadedPages.shoppingCart.applyDiscount(this);'>Apply</td>";
            html += "<td><div serial='" + obj.ItemID + "' onclick='loadedPages.shoppingCart.switchPercent(this);' spdiscount style='display:none;' class='discounttype " + ((obj.discountType === undefined) ? "" : obj.discountType) + "'></div></td>";
            html += "<td><input spdiscount a  value='" + obj.Discount + "' type='text' class='form-control' style='display:none;width:50px;clear:both;text-align:right;float:right;width:65px;' placeholder='Discount' /></td>";
            html += "</tr></table><br />";

          }
        }

        if (obj.Discount == "" || obj.Discount == "%") {
          html += "<div style='float:right;color:black;'><span realvalue='" + parseInt(obj.realPrice) + "'>" + (parseInt(obj.realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
        }
        ttl1 += obj.toPay;
        html += "<br /><div style='float:right;color:black;font-size:13px;'><label style='color:black;font-size:15px;'>Total:&nbsp;</label>" + parseInt(obj.toPay).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</div>";

        html += "</div>";
        $(html).appendTo($("#items"));

        $("[pdata]").css({
          width: $(window).width() - 130,
          minWidth: $(window).width() - 130,
        })
     }
     $("#subtotal").parent().next("td").html(parseInt(ttl).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
      $("#subtotal").attr("realvalue", parseInt(loadedPages.shoppingCart.total));
     var ttl = 0;
     console.log(localStorage);
     var grandTotal = parseFloat(loadedPages.shoppingCart.total);
     if (resetLocalStorage.generalDiscount !== undefined) {
       $("#masterdiscount").val(localStorage.generalDiscount);
     }

     localStorage.discountAmount = 0;
     if (localStorage.generalDiscount !== undefined) {
       localStorage.discountAmount = localStorage.generalDiscount;
       $("#masterdiscount").val(localStorage.discountAmount);
       if ($("#masterdiscount").val().indexOf("%") == -1 && $("#masterdiscount").val() != "") {
         $("#mdt").addClass("euro");
       }
     } else {
       localStorage.discountAmount = 0;
     }
     if ($("#masterdiscount").val() != "") {
       hasDiscount = true;
       totalDiscount = 1;
        if ($("#mdt").hasClass("euro")) {
          $("#masterdiscount").val($("#masterdiscount").val().replace("%", ""));
        } else {
          $("#masterdiscount").val($("#masterdiscount").val().replace("%", "") + "%");
        }
             var sm = loadedPages.shoppingCart.total;
             if ($("#masterdiscount").val().indexOf("%") > -1) {
               var prc = parseInt($("#masterdiscount").val().replace("%", ""));
               totalDiscount += prc;
               localStorage.discountAmount = ((sm / 100) * prc);
              ttl = sm - ((sm / 100) * prc);
             } else {
               var prc = parseInt($("#masterdiscount").val());
               totalDiscount += prc;
               localStorage.discountAmount =  prc;
               ttl = parseInt(sm - prc);
             }

     } else {
       ttl = parseInt(loadedPages.shoppingCart.total);
     }
     if ((ttl - parseInt(ttl)) > 0) {
       ttl = parseInt(ttl) + 1;
     } else {
       ttl = parseInt(ttl);
     }
     loadedPages.shoppingCart.showDiscount = hasDiscount;
  /*   if (!loadedPages.shoppingCart.showDiscount) {
       $('[spdiscount]').hide();
       $('[spdiscount1]').hide();
     } else {
       $('[spdiscount]').show();
       $('[spdiscount1]').show();
     }*/

     var vex = parseFloat(ttl / 1.21);
     var vat = parseFloat(ttl - (ttl / 1.21));
     var achg = parseFloat((ttl / 100) * 1.35);
     var torefund = vat - achg;
     torefund = Math.floor(torefund);
     var withcharge = ttl + achg;
     var vatchargeexcl =  withcharge / 1.21;
     var vatcharge = withcharge - vatchargeexcl;
     var bb = parseInt(vat - achg);
     achg =  vat - torefund;

//     admin charge = VAT21% - VAT REFUND AMOUNT = 30.815,85 - 28.417,00 = 2398,85
     $("#vatexcluded").parent().next("td").html((parseFloat(vex).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#vat").parent().next("td").html((parseFloat(ttl - vex).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#admincharge").parent().next("td").html((parseFloat(achg).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#withcharge").parent().next("td").html((parseFloat(withcharge).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#vatchargeexcl").parent().next("td").html((parseFloat(vex).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#vatcharge").parent().next("td").html((parseFloat(vatcharge).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#torefund").parent().next("td").html(torefund.toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
     $("#total").parent().next("td").html((parseFloat(ttl).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));

     localStorage.vatexcluded = parseFloat(vex);
     localStorage.vat = parseFloat(ttl - vex);
     localStorage.admincharge = parseFloat(achg);
     localStorage.withcharge = parseFloat(withcharge);
     localStorage.vatchargeexcl = parseFloat(vatchargeexcl);
     localStorage.vatcharge = parseFloat(vatcharge);
     localStorage.torefund = torefund;
     localStorage.total = parseFloat(ttl);
     localStorage.grandTotal = parseFloat(grandTotal);
     localStorage.invoiceDiscount = $("#masterdiscount").val();
    // localStorage.directRefund = (($("#directRefund")[0].checked) ? "1" : "0");
    var bb = parseInt((parseFloat(localStorage.torefund) - parseFloat(localStorage.admincharge)));

     localStorage.payNoRefund = parseFloat(vex + vat);
     localStorage.payWithRefund = parseInt((localStorage.total -  vat) + achg);
     localStorage.isEU = $('#countries').find(':selected').data('eu');

     $(".norefund").val((Math.ceil(ttl1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $(".refund").val((Math.ceil(ttl1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
    if (localStorage.directRefund === undefined) {
      localStorage.directRefund = "0";
    }
     if (localStorage.directRefund == "0") {
       $(".norefund").show();
       $(".refund").hide();
     } else {
       $(".norefund").hide();
       $(".refund").show();
     }

     if (!loadedPages.shoppingCart.approvedRequested && parseFloat(totalDiscount) > 0) {
       if (!loadedPages.shoppingCart.firstDraw) {
         $("#discountApproved").modal("show");
         $("[spdiscount2]").show();
        }
       loadedPages.shoppingCart.approvedRequested = true;
      // loadedPages.shoppingCart.firstDC = true;
     } else {
        //loadedPages.shoppingCart.approvedRequested = true;
     }
     loadedPages.shoppingCart.firstDraw = false;
     if (loadedPages.shoppingCart.approvedRequested) {
       $("[spdiscount]").show();
       $("[spdiscount1]").show();
     }

     $("#items").show();
/*     if (!loadedPages.shoppingCart.showDiscount) {
       $('[spdiscount]').hide();
       $('[spdiscount1]').hide();
     } else {
       $('[spdiscount]').show();
       $('[spdiscount1]').show();
     }*/

     $("#content").find("input").unbind("keyup");
     $("#content").find("input").bind("keyup", function (event) {
          $(event.target).val($(event.target).val().toString().replace( /^\D+/g, ''));
      });
      $("#content").find("input").unbind("focusout");
      $("#content").find("input").bind("focusout", function (event) {
        if (window.StatusBar){
          try {
              window.StatusBar.show();
              setTimeout(function(){
                  window.StatusBar.hide();
              },5);
            } catch(err) {

            }
        }
       });
  },
  checkCode: function() {
    if (!$("#directRefund")[0].checked) {
      loadedPages.shoppingCart.calculateRefund();
      return;
    }
    showModal({
        title: "Please confirm choice. Enter code.",
        content: "<input id='ccode' type='number' class='form-control' /><span style='color:red;display:none;' id='cer'>Wrong code.</span>",
        allowBackdrop: false,
        showClose: false,
        noclose: true,
        cancelCallback: function() {
            $('#mainModal').modal("hide");
        },
        confirmCallback: function() {

          if ($("#ccode").val() == "1071") {
              $("#dRefund").addClass("refund");
              $("[refundcontainer]").show();
              $("#dfw").html("Direct Refund");
              localStorage.directRefund = "1";
              loadedPages.shoppingCart.calculateRefund(true);
              $('#mainModal').modal("hide");
          } else {
            $("#cer").show();
          }

        }
    })

  },
  recalculate: function(obj) {
    var id = $(obj).attr("itemid");
    shoppingCartContent[id].quantity = $(obj).val();

    shoppingCartContent[id].toPay = parseInt($(obj).val()) * parseFloat(shoppingCartContent[id].realPrice);
    loadedPages.shoppingCart.drawCart();
  },
  recalculateDiscount: function() {
    $('#masterdiscount').show();
    var dsc = parseFloat($("#subtotal").attr("realvalue")) - $("#cartToPay").val();
    dsc = dsc.toFixed(2);
    $("#masterdiscount").val(dsc);
    $("#masterdiscount").trigger("change");
  },
  removeItem: function(obj) {
    showModal({
      title: "Are you sure to remove item " + $(obj).closest("[serial]").attr("serial") + " " + $(obj).closest("[root]").find("[productname]").html() + " from cart?",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
      confirmCallback: function() {
        delete shoppingCartContent[$(obj).closest("[serial]").attr("serial")];
        loadedPages.shoppingCart.drawCart();
      }
    })

  },
  discounts: function(obj) {
    var id = $(obj).closest("[serial]").attr("serial");
    console.log(shoppingCartContent);
    if (!shoppingCartContent[id].discountLocked) {
      shoppingCartContent[id].Discount = obj.value;
    } else {
      shoppingCartContent[id].additionalDiscount = obj.value;
    }
    if (shoppingCartContent[id].Discount == "") {
      return;
    }
  //  loadedPages.shoppingCart.firstDC = false;
    loadedPages.shoppingCart.drawCart();
  },
    calculateRefund: function(showpay = false) {
      localStorage.directRefundChecked = $("#directRefund")[0].checked ? "1" : "0";

      if (localStorage.isEU == "0") {

          if (localStorage.directRefundChecked == "1") {
              $("[refund]").show();
              $("[norefund]").hide();
              if (showpay) {
                $("#dfw").html("Direct Refund");
                $(".refund").show();
                $(".norefund").hide();

              }
            } else {
              $("#dfw").html("VAT Refund");
              $(".refund").hide();
              $(".norefund").show();
              $("[refund]").hide();
              $("[norefund]").show();
            }
      } else {

            $("#dfw").html("VAT Refund");
            $(".refund").hide();
            $(".norefund").show();
            $("[refund]").hide();
            $("[norefund]").show();

      }
    //  loadedPages.shoppingCart.drawCart();
  },
  checkIsLogged: function() {

      loadPage("checkout");

  },
  discountClickedFired: function() {
    loadedPages.shoppingCart.discountClicked = !loadedPages.shoppingCart.discountClicked;
    loadedPages.shoppingCart.showDiscount = loadedPages.shoppingCart.discountClicked;
    //alert(  loadedPages.shoppingCart.showDiscount)
/*    if (!loadedPages.shoppingCart.discountClicked) {
      for (var key in shoppingCartContent) {
         var obj = shoppingCartContent[key];
         obj.additionalDiscount = "";
         obj.realPrice = obj.startRealPrice;
      }
      $("#masterdiscount").val(localStorage.invoiceDiscount);
      $('#masterdiscount').hide();
      $('[spdiscount]').val("");
      $('[spdiscount]').trigger("change");
      $('[spdiscount]').hide();
      $('[spdiscount1]').hide();
    } else {*/

      $('#masterdiscount').show();
      $('[spdiscount]').show();
      $('[spdiscount1]').show();
  //  }

  //  loadedPages.shoppingCart.drawCart();
},
switchMasterDiscountType: function(obj) {

  $(obj).toggleClass("euro");
  if ($(obj).hasClass("euro")) {
    $("#masterdiscount").val($("#masterdiscount").val().replace("%", ""));
  } else {
      $("#masterdiscount").val($("#masterdiscount").val().replace("%", "") + "%");
  }

},
switchPercent: function(obj) {
  console.log(shoppingCartContent)
    var dfield = $(obj).closest("table").find("td").eq(2).find("[spdiscount]");
    var sno = $(obj).attr("serial");

    if (shoppingCartContent[sno].clicked === undefined) {
      shoppingCartContent[sno]["clicked"] = true;
      shoppingCartContent[sno]["discountType"] = "";

    }
    var o = $(obj);
    if (shoppingCartContent[sno]["discountType"] == "") {
      shoppingCartContent[sno]["discountType"] = "euro";
    } else {
      shoppingCartContent[sno]["discountType"] = "";
    }
    o[0].className = "discounttype " + shoppingCartContent[sno]["discountType"];
    if (shoppingCartContent[sno]["discountType"] == "") {
      dfield.val(dfield.val() + "%");
    } else {
      dfield.val(dfield.val().replace("%", ""));
    }
  //  loadedPages.shoppingCart.discounts(dfield[0]);
},
applyDiscount: function(obj) {
   var dtype = $(obj).closest("table").find("td").eq(1).find(".discounttype");
   var dfield = $(obj).closest("table").find("td").eq(2).find("[spdiscount]");
   if (!dtype.hasClass("euro")) {
     dfield.val(dfield.val().replace("%", ""));
     dfield.val(dfield.val() + "%");
   } else {
     dfield.val(dfield.val().replace("%", ""));
   }
   loadedPages.shoppingCart.discounts(dfield[0]);
}
}
