loadedPages.invoice = {
  language: "",
  invoiceID: "",
  salePerson: {},
  documentName: "",
  currentStep: 1,
  checkCustomer: false,
  validator: null,
  vatRefundID: "",
  adminChargeID: "",
  vatRefund: false,
  initialize: function() {
    $("#content").css({
      marginTop: 0
    })
    setTimeout(function() {
      loadedPages.invoice.triggerCurrencyChange();

      login();
    }, 3000);
    this.salePerson = $.parseJSON(localStorage.sp);
    $("#country").countrySelect({
      preferredCountries: ['ru', 'cn', 'us', 'ch', 'jp',  'gb', 'fr', 'es']
    });
    $("#invoice_country").countrySelect({
      onlyCountries: ['gb', 'ru', 'ua']
    });


    $("#invoice_country").bind("change", function() {
      loadedPages.invoice.language = $("#invoice_country_code").val();
      $.ajax({
          dataType: "json",
          url: "translations/translation_" + $("#invoice_country_code").val() + ".json",
          type: "GET",
          async: false,
          success: function(res) {
              translation = res;
          }
        });

    });
    $("#invoice_country").trigger("change");
    
    api_csv.call("showrooms", function(res) {
      var td = [];
      $.each(res.data, function() {
        td.push({
          id: this.showroomid,
          name: this.name
        })
      })

      $("#showroom").typeahead({
        scrollHeight: 100,
        items: "all",
        source: td,
        autoSelect: true,
        afterSelect: function(obj) {
          swal({
            type: "question",
            text: "Confirm " + obj.name + " as selected Showroom",
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then((result) => {
            if (!result.value) {
              setTimeout(function() {
                $("#showroom").val("").trigger("input");
                $("#showroom").attr("confirmed", "no");
              }, 500);
            } else {
                localStorage.showRoom = obj.showroomid;
                $("#cshowroom").val(obj.showroomid);
                $("#showroom").attr("confirmed", "yes");
            }
          })
        }
      });

      $('#showroom').val(localStorage.showRoomName);
    }, {}, {})

  },

 get: function() {
   var obj = {
     SerialNo:$("#serial").val()
   }
   api.call("getScannedProduct", function(res) {
     if (res[0] == undefined) {
       swal({
         type: 'error',
         text: "No product with this serial."
       })
     } else {
       var img = $(res[0].imageUR);
       var exr = $("#currency").find("option:selected").attr("rate");
       html = res[0].imageURL.replace(/50px/g,"300px");
       html += "<div style='width:100%;'>" + res[0].productName + "</div>";
       html += "<br />";
       if (res[0].Discount > 0) {
         html += "<div style='float:right;'><span style='color:red;'><b>" + res[0].Discount + "% </b></span><span style='text-decoration:line-through;'>" + (parseFloat(res[0].SalesPrice) * parseFloat(exr)).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div></br />";
       }
       html += "<div style='float:right;'><span>" + (parseFloat(res[0].realPrice) * parseFloat(exr)).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";

       swal({
         showCancelButton: true,
         type: "question",
         title: "Add to invoice?",
         html: html
       }).then((result) => {
         if (result.value) {
           addToInvoice(res[0]);
         }
       })
   }
   }, obj, {})
/*   $.ajax({
     url: "http://85.214.165.56:81:5000/?product=" + $("#serial").val(),
     type: "GET",
     success: function(res) {

       if (res[0] == undefined) {
         swal({
           type: 'error',
           text: "No product with scanned code"
         })
       } else {
         swal({
           showCancelButton: true,
           type: "question",
           title: "Add to invoice?",
           text: res[0]["ITEM ID"] + " " + res[0].name + " (€ " + parseInt(res[0]["Sales Price"]).toLocaleString("nl-NL") + ".00)"
         }).then((result) => {
           if (result.value) {
             loadedPages.invoice.addToInvoice(res[0]);
           }
         })
     }
    }
  })*/

 },


 saveSP: function() {
   var obj = {
    name: $("#salespersonname").val()
   }
   api.call("insertSalesPerson", function(res) {
     $("#addSalesPerson").modal("hide");
   }, obj, {});
 },
 saveSR: function() {
   var obj = {
    name: $("#roomname").val()
   }
   api.call("insertRoom", function(res) {
     $("#addShowRoom").modal("hide");
   }, obj, {});
 },

 triggerCurrencyChange: function() {

   var iframeWin = document.getElementById("catalog").contentWindow;
   iframeWin.postMessage('changeCurrency#' + $("#currency").val(),'*');
 },
 checkInvoice: function() {

   var ok = true;
   if ($("#invoiceBody").find("tbody").find('tr').length == 0) {
     ok = false;
     swal({
       type: "error",
       text: "No items selected"
     })
   }
   if (!ok) {
     return false;
   }
   var tp = 0;
   $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {
     if (ind > 0) {
       if ($(this).find("input").length > 0) {
        tp += parseFloat($(this).find("input").val().replace(".","").replace(",", "."));

      }
     }
   })

   var tpp = parseFloat($("[invoicedue]").attr("realvalue"));
   if (tp != tpp) {
     ok = false;
     swal({
       type: "error",
       text: "Total and payments are not in balance."
     })
   }
   if (!ok) {
     return false;
   }
   if ($("#tourForm").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Select Tour."
     }).then((result) => {
       $("#tour").appendTo("body").modal("show");
     })
   } else {

   }
   if (!ok) {
     return false;
   }
/*   if ($("#salesperson").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Sales Person not confirmed! Confirm one"
     })
   }
   if (!ok) {
     return false;
   }*/
/*   if ($("#showroom").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Showroom not confirmed! Confirm one"
     })
   }
   if (!ok) {
     return false;
   }*/
   if ($("#customerForm").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Confirm customer data."
     }).then((result) => {
       $("#customer").appendTo("body").modal("show");
     })
   }
   if (!ok) {
     return false;
   }
  loadedPages.invoice.mail();
 },

 addPayment: function() {
   var tr = $("#master").clone();
   $("#paymentsTable").find("tbody").find("tr:last").remove();
   tr.appendTo($("#paymentsTable").find("tbody"));
   $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).val("1");
   $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).prop("disabled", false);
   $("#paymentsTable").find("tbody").find("tr:last").find("input").prop("disabled", false);
   $("#paymentsTable").find("tbody").find("tr:last").find("i").show();
   var tp = 0;

   $.each($("#paymentsTable").find("tbody").find("tr"), function() {
     if ($(this).find("select").eq(0).val() == "7") {
       $(this).remove();
     }
   })
   $.each($("#paymentsTable").find("tbody").find("tr").not(":last"), function(ind) {
     if (ind > 0) {
       if ($(this).find("input").length > 0) {

         if ($(this).find("select").eq(0).val() != "7") {
             var thenum = $(this).find("input").val().replace( /^\D+/g, '');
             var n = thenum.replace(/\./g, "");
            tp += parseFloat(n);
          }
      }
     }
   })


   var tpp = parseFloat($("[invoicedue]").attr("realvalue"));
    $("#paymentsTable").find("tbody").find("tr:last").find("input").val(parseFloat(tpp - tp).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
   loadedPages.invoice.calculatePayments();
 },
 deletePayment: function(obj) {
   var tr = $(obj).closest("tr");
   swal({
     type: "question",
     text: "Remove this payment?",
     showCancelButton: true,
     allowOutsideClick: false,
     allowEscapeKey: false,
     showConfirmButton: true
   }).then((result) => {
     if (result.value) {
       tr.remove();
       loadedPages.invoice.calculatePayments();
     }
   })
 },
 fromCatalog: function(id) {
   var obj = {
     ItemID: id
   }

   api.call("getProductByItemID", function(res) {
     if (res[0] == undefined) {
       swal({
         type: 'error',
         text: "No product with this id."
       })
     } else {

       addToInvoice(res[0]);
    }
   }, obj, {})
 },
 hideCatalog: function() {
  /*$("#catalog_container").hide();
   $("#catalog_container").css({
     visibility: "visible"
   })
   $("button").prop("disabled", false);*/
 },

}
