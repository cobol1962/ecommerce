loadedPages.checkout = {
  table: {},
  adminChargeID: "",
  vatRefundID: "",
  directRefund: false,
  cache: 0,
  invoiceID: "",
  documentName: "",
  currentInvoice: "",
  ttl: 0,
  t1: 0,
  stripeResponse: {},
  initialize: function() {


  api.call("getExcangeRates", function(res) {
    $.each(res, function() {

        $('<option value="' + this.CurrencyCode + '" rate="' + (parseFloat(this.ExchangeRate) / 100) + '">' + this.CurrencyCode + '</option>').appendTo($("#pay_currency"));
    })
  }, {}, {});
   $("#mainModal").modal("hide");
  $("#fullshoppingcart").css({
    minHeight: window.innerHeight - 100,
    maxHeight: window.innerHeight - 100
  })


  if (localStorage.customerCountry === undefined) {
    api.call("getCountries", function(res) {
      var data = [];
      $.each(res, function() {
        var ths = this;
        var obj = {
          id: ths.CountryID,
          text: ths.Country,
          eu: ths.EUMember,
          nationality: ths.Nationality
        }
        data.push(obj);
      })

      $("#countries").select2({
        data: data,
        placeholder: "Select a customer country origin",
        allowClear: true,
        width: '100%'
      });

    }, {}, {});
  } else {
    var obj = $.parseJSON(localStorage.customerCountry);
    $("#cstc").html("Country: " + obj.text);
    $("#countries").hide();
    $("#cstc").show();
  }

    var oTable = $("#tours").DataTable({
       ajax: {
           "url": "http://85.214.165.56:81/api/index.php?request=getTours",

       },
       info: false,
       columns: [

           { "data": "AVisitDateTime",
               "render": function ( data, type, row ) {
                 var dt = new Date(data);
                 return  type === 'sort' ? data : moment(dt).format("DD/MM HH:mm");
               }
           },
            { "data": "ProjId" },
               { "data": "ProjName" },
             { "data": "PAX" },
            { "data": "country",
              "render": function ( data, type, row ) {
                return "<span style='max-width:100%;'><b>" + row["touroperater"] + "</b></span><br />" + data;
              }
           },
            { "data": "touroperater" },

        ],
       dom: 'Bfrtip',
       "order": [[ 0, "desc" ]],
       buttons: [

       ],
       "paging":         false,
       stateSave: true
  });
  this.table = oTable;
  setTimeout(function() {
      if (localStorage.tour !== undefined) {
        var data = $.parseJSON(localStorage.tour);
        $('#'+ data.DT_RowId).addClass("selected");
        $("#tdiv").animate({
          scrollTop: $('#'+ data.DT_RowId).offset().top - 200
        }, 500);
        $("#tours_div").addClass("checked");
      }
    }, 2000);
    api.call("getCountries", function(res) {
      var data = [];
      $.each(res, function() {
        var ths = this;
        var obj = {
          id: ths.CountryID,
          text: ths.Country,
          eu: ths.EUMember,
          nationality: ths.Nationality
        }
        data.push(obj);
      })

      $('#countries').on('select2:select', function (e) {
          $("#customerForm").validate().element('#countries');
      });
      $('#countries').on('select2:clear', function (e) {
        $("#customerForm").validate().element('#countries');
      });
      $("#country").select2({
        data: data,
        placeholder: "Select country",
        allowClear: true,
        width: '100%'
      });
      $('#country').on('select2:clear', function (e) {
        $("#refund")[0].checked = false;
        $("#refundContainer").hide();
        loadedPages.shoppingCart.calculateRefund();
      });
      if (localStorage.customer !== undefined) {
        var c = $.parseJSON(localStorage.customer);
        for (var k in c) {

          $("#customerForm").find("[name='" + k + "']").val(c[k]);
        }
          $("#countries").val(c["countryCode"]).trigger('change');
      }
    }, {}, {});
    setTimeout(function() {

        yadcf.init(loadedPages.checkout.table, [
          {
            style_class: "form-control",
             filter_container_id: "filter_date",
             filter_type: "text",
              column_number: 0,
          },
          {
            style_class: "form-control",
              filter_container_id: "filter_nationality",
              column_number: 3,
              filter_type: "multi_select",
              select_type: 'select2'
          },
          {
            style_class: "form-control",
              filter_container_id: "filter_operator",
              column_number: 4,
              filter_type: "multi_select",
              select_type: 'select2'
          },
        ]);

        $("#filters_temp").appendTo($("#filters_body"));
        $("#filters_temp").css({
          visibility: "visible"
        })
      }, 2000);
      $('#tours tbody').on( 'click', 'tr', function () {
          if ( $(this).hasClass('selected') ) {
              $(this).removeClass('selected');
              $("#tours_div").removeClass("checked");
              delete localStorage.tour;
          }
          else {
              loadedPages.checkout.table.$('tr.selected').removeClass('selected');
              localStorage.tour = JSON.stringify(loadedPages.checkout.table.row( this ).data());
              var dt = loadedPages.checkout.table.row( this ).data();
              $(this).addClass('selected');
              $("#tours_div").addClass("checked");
              $("#2")[0].checked = true;

          }
      } );
      $.validator.addMethod("countrySelected", function(value, element) {
        var data = $('#countries').select2('data');
        return (data[0].id != "");
      }, "This field is mandatory");
      $(".form-group").css({
        marginBottom: 25
      })
      $(".form-control").css({
        minHeight: 40
      })
      $( "#customerForm" ).validate({
          rules: {
            countries: {
              countrySelected: true
            },
            email: {
              required: true,
              email: true
            },
            name: {
              required: true
            },
            address1: {
              required: true
            },
            telephone: {
              required: true
            },
            zip: {
              required: true
            },
            city: {
              required: true
            }
          },
          submitHandler: function(form) {
              var obj = {};
              $.each($("#customerForm").find("[name]"), function() {
                obj[$(this).attr("name")] = $(this).val();
              })
              delete obj["countries"];
              delete obj["tourNo"];
              obj["country"] = $("#countries").select2("data")[0].text;
              obj["countryCode"] = $("#countries").select2("data")[0].id;
              if ($("#cstc").is(":visible")) {
                obj["country"] = $("#cstc").html().split(":")[1].trim();
                obj["countryCode"] = $.parseJSON(localStorage.customerCountry).id;
              } else {
                obj["country"] = $("#countries").select2("data")[0].text;
                obj["countryCode"] = $("#countries").select2("data")[0].id;
              }

              localStorage.customer = JSON.stringify(obj);

                    api.call("insertWebCustomer", function(res) {

                          if (res.status == "ok") {
                            localStorage.customerid = res.customerid;
                            $("#customer_div").addClass("checked");
                            /*swal({
                              type: "success",
                              text: "Customer succesfully registered."
                            })*/
                      //  $("#customerid").val(res.customerid);

                        loadedPages.checkout.prepareOverview();
                            $("#1").hide();
                            $("#2").show();
                          }
                      }, obj, {},{})
          }
        });

  },
  setPayments: function() {

      api.call("getPMethods", function(res) {
         $.each(res, function() {
           if (this.IsAdminCharge == "0" && this.IsVatRefund == "0") {
             $("<option value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentMethods"));
             $("<option value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentsTable").find("tbody").find("tr").eq(1).find("select").eq(0));
           } else {
             $("<option disabled value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentMethods"));
             $("<option disabled value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentsTable").find("tbody").find("tr").eq(1).find("select").eq(0));
             if (this.IsAdminCharge != "0") {
               loadedPages.checkout.adminChargeID = this.PaymentID;
             }
             if (this.IsVatRefund != "0") {
               loadedPages.checkout.vatRefundID = this.PaymentID;
             }
           }
         })
        loadedPages.checkout.toggleVAT();

      }, {}, {});

  },
  toggleVAT: function() {

     vatRefund = (localStorage.directRefund == "1");

    if (true) {
      $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {
        if (ind > 0) {
          $(this).remove();
        }
      });

      if (vatRefund) {
        var tpp = parseInt(localStorage.payWithRefund);
        loadedPages.checkout.calculatePayments();
      }  else {
          var tpp = parseInt(localStorage.payNoRefund);
      }

      var tr = $("#master").clone();
      tr.find("select").eq(0).val("1");
    //  tr.find("select").eq(1).hide();
      tr.find("input").attr("realvalue", tpp);
      tr.find("input").attr("euro", tpp);
      tr.find("input").val(parseFloat(tpp).toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }));
      tr.find("input").prop("disabled", false)
      tr.find("select").eq(1).prop("disabled", false)
      tr.find("i").show();
      tr.appendTo($("#paymentsTable").find("tbody"));
      var tp = 0;
      $.each($("#paymentsTable").find("tbody").find("tr"), function() {
        if ($(this).find("select").eq(0).val() == "7") {
          $(this).remove();
        }
      })
      $.each($("#paymentsTable").find("tbody").find("tr").not(":last"), function(ind) {

          if (this.id != "administrative") {
            if ($(this).find("input").length > 0) {

              if ($(this).find("select").eq(0).val() != "7") {
                  var thenum = $(this).find("input").val().replace( /^\D+/g, '');
                  var n = thenum.replace(/\./g, "");
                  n = n.replace(/\,/g, ".");
                  tp += parseFloat(n);
               }
           }
         }

      })
      if (vatRefund) {
          var tpp = parseFloat(localStorage.payWithRefund);
            loadedPages.checkout.calculatePayments();
      }  else {
          var tpp = parseFloat(localStorage.payNoRefund);
          $("#administrative").remove();
          $("#vatrefund").remove();
          loadedPages.checkout.calculatePayments();
      }
    } else {
      $("#administrative").remove();
      $("#vatrefund").remove();
      loadedPages.checkout.calculatePayments();
    }


  },
  calculatePayments: function() {

    var tp = 0;
    payments = {};
    $.each($("#paymentsTable").find("tbody").find("tr"), function() {
      if ($(this).find("select").eq(0).val() == "7") {
        $(this).remove();
      }
    })
    loadedPages.checkout.cache = 0;
    $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {
        if (this.id != "administrative") {
          var ths = this;
          if ($(this).find("input").length > 0) {
            var thenum = $(ths).find("input").val().replace( /^\D+/g, '');
            if ($(ths).find("select").eq(0).find("option:selected").attr("value") == "1") {
              loadedPages.checkout.cache += parseFloat($(ths).find("input").attr("euro"));
            }
            var n = thenum.replace(/\./g, "");
            var n = n.replace(/\,/g, ".");
        //    n = parseFloat(n) / (parseFloat($(ths).closest("tr").find("td").eq(1).find("select").find("option:selected").attr("rate")));
            $(ths).find("input").val(parseInt(n).toLocaleString("nl-NL",{ style: 'currency', currency: $(ths).find("td").eq(1).find("select").val()}))

            var obj = {
              paymentID: $(ths).find("select").eq(0).val(),
              paymentMethod: $(ths).find("select").eq(0).find(":selected").text(),
              currency: $(ths).find("select").eq(1).find(":selected").attr("value"),
              amount: parseFloat(n)
            }

            if ($(this).find("input").val() != "") {
              var thenum = $(this).find("input").val().replace( /^\D+/g, '');
              var n = thenum.replace(/\./g, "");
              var n = n.replace(/\,/g, ".");
              n = parseFloat(n) / (parseFloat($(this).closest("tr").find("td").eq(1).find("select").find("option:selected").attr("rate")));
              tp += parseFloat(n);
              obj.original = n;
            }

            payments[Object.keys(payments).length] = obj;
         }
      }

    })

    if (vatRefund) {
        var tpp = parseFloat(localStorage.payWithRefund);
    }  else {
        var tpp = parseFloat(localStorage.payNoRefund);
    }


    $("#master").clone().appendTo($("#paymentsTable").find("tbody"));
  //  $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(1).hide();
    $("#paymentsTable").find("tbody").find("tr:last").find("i").hide();
    $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).val("7");
    $("#paymentsTable").find("tbody").find("tr:last").find("select").prop("disabled", true);
    $("#paymentsTable").find("tbody").find("tr:last").find("input").val(parseInt(tpp - tp).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
    $("#paymentsTable").find("tbody").find("tr:last").find("input").prop("disabled", true);
    $("#paymentsTable").find("tbody").find("input").unbind("change");
    var obj = {
      paymentID: $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).val(),
      paymentMethod: $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).find(":selected").text(),
      amount: parseInt(tpp - tp)
    }
    if (parseInt(tpp - tp) <= 0) {
      $("#addpayment").prop("disabled", true);
    } else {
      $("#addpayment").prop("disabled", false);
    }
    payments[Object.keys(payments).length] = obj;
    $("#paymentsTable").find("tbody").find("input").bind("change", function() {
      var slct = $(this).closest("tr").find("td").eq(1).find("select");
      var rate = slct.find("option:selected").attr("rate");
      $(this).attr("euro",parseFloat($(this).val() / rate));
    //  $(this).val(parseFloat($(this).val()).toLocaleString("nl-NL",{ style: 'currency', currency: slct.find("option:selected").attr("value")}));
      loadedPages.checkout.calculatePayments();
    });
  },
  deletePayment: function(obj) {
    var tr = $(obj).closest("tr");
    showModal({
      title: "Remove this payment?",
      allowBackdrop: false,
      showClose: false,
     confirmCallback: function() {
        tr.remove();
        loadedPages.checkout.calculatePayments();
      }
    })
  },
  addPayment:function() {

    var tr = $("#master").clone();
    $("#paymentsTable").find("tbody").find("tr:last").remove();
    tr.appendTo($("#paymentsTable").find("tbody"));
    $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).val("1");
    $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).prop("disabled", false);
    $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(1).prop("disabled", false);
    $("#paymentsTable").find("tbody").find("tr:last").find("input").prop("disabled", false);
    $("#paymentsTable").find("tbody").find("tr:last").find("i").show();
    var tp = 0;

    $.each($("#paymentsTable").find("tbody").find("tr"), function() {
      if ($(this).find("select").eq(0).val() == "7") {
        $(this).remove();
      }
    })
    $.each($("#paymentsTable").find("tbody").find("tr").not(":last"), function(ind) {
        if (this.id != "administrative") {
            if ($(this).find("input").length > 0) {
              if ($(this).find("select").eq(0).val() != "7") {
                  var thenum = $(this).find("input").val().replace( /^\D+/g, '');
                  var n = thenum.replace(/\./g, "");
                  n = parseFloat(n) / (parseFloat($(this).closest("tr").find("td").eq(1).find("select").find("option:selected").attr("rate")));
                  tp += parseFloat(n);
               }
            }
         }

    })
    if (vatRefund) {
        var tpp = parseFloat(localStorage.payWithRefund);
    }  else {
        var tpp = parseFloat(localStorage.payNoRefund);
    }
      $("#paymentsTable").find("tbody").find("tr:last").find("input").attr("euro", tpp - tp);
    $("#paymentsTable").find("tbody").find("tr:last").find("input").attr("realvalue", tpp - tp);
   $("#paymentsTable").find("tbody").find("tr:last").find("input").val(parseFloat(tpp - tp).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
    loadedPages.checkout.calculatePayments();
  },
  changeCurrency: function(obj) {
    var crt = parseFloat($(obj).find("option:selected").attr("rate"));
    var vl = $(obj).closest("tr").find("td").eq(2).find("input").attr("euro");
    $(obj).closest("tr").find("td").eq(2).find("input").val(parseInt(vl * crt).toLocaleString("nl-NL",{ style: 'currency', currency: $(obj).find("option:selected").attr("value")}));
    var pid = $(obj).closest("tr")[0].rowIndex - 1;
    var vl = $(obj).closest("tr").find("td").eq(2).find("input").val();
    var thenum = vl.replace( /^\D+/g, '');
    var n = thenum.replace(/\./g, "");
    n = n.replace(/\,/g, ".");

    var obj = {
      paymentID: $(obj).closest("tr").find("select").eq(0).val(),
      paymentMethod: $(obj).closest("tr").find("select").eq(0).find(":selected").text(),
      currency: $(obj).closest("tr").find("select").eq(1).find(":selected").attr("value"),
      amount: parseInt(n),
      original: $(obj).closest("tr").find("td").eq(2).find("input").attr("euro")
    }
    payments[pid] = obj;

  },
  newInvoice: function() {

    if (Object.keys(shoppingCartContent).length == 0) {
      $("#toggleShoppigCart").addClass("empty");
    } else {
      $("#toggleShoppigCart").removeClass("empty");
    }
    loadPage("invoice");
  },
  invoice: function() {
    var checkd = 0;
    $.each($("[step]"), function() {
      if ($(this).hasClass("checked")) {
        checkd++;
      }
    })
    if (checkd != 3) {
      swal({
        type: "warning",
        text: "Confirm all steps please."
      })
      return;
    } else {

      mail();
    }
  },
  paymentMethodChanged: function(obj) {

    if ($(obj).val() == "1") {
      $(obj).closest("tr").find("td").eq(1).find("select").prop("disabled", false);
    } else {
      $(obj).closest("tr").find("td").eq(1).find("select").val("EUR");
      var euro = $(obj).closest("tr").find("td").eq(2).find("input").attr("euro");
      $(obj).closest("tr").find("td").eq(2).find("input").val((parseFloat(euro)).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
      $(obj).closest("tr").find("td").eq(1).find("select").prop("disabled", true);
    }
    loadedPages.checkout.calculatePayments();
  },
  prepareOverview: function() {
    if ($("#name").val() != "") {
      $("[firstname]").html($("#name").val());
      $("[firstname]").parent().show();
    } else {
      $("[firstname]").parent().hide();
    }
    if ($("#hotel").val() != "") {
      $("[hotel]").html($("#hotel").val());
        $("[hotel]").parent().show();
    } else {
      $("[hotel]").parent().hide();
    }
    if ($("#address1").val() != "") {
      $("[address1]").html($("#address1").val());
      $("[address1]").parent().show();
    } else {
      $("[address1]").parent().hide();
    }
    if ($("#ringsize").val() != "") {
      $("[ringsize]").html("Ring size: " + $("#ringsize").val());
      $("[ringsize]").parent().show();
    } else {
      $("[ringsize]").parent().hide();
    }
    if ($("#address2").val() != "") {
      $("[address2]").html($("#address2").val());
      $("[address2]").parent().show();
    } else {
      $("[address2]").parent().hide();
    }
    if ($("#zip").val() != "" ||  $("#city").val() != "") {
      $("[city]").html($("#zip").val() + " " + $("#city").val());
      $("[city]").parent().show();
    } else {
      $("[city]").parent().hide();
    }

    if ($("#cstc").is(":visible")) {
      $("[country]").html($("#cstc").html());
    } else {
        if ($("#country").val() != "") {
          $("[country]").html($("#countries").select2('data')[0].text);
          $("[country]").parent().show();
        } else {
          $("[country]").parent().hide();
        }
    }
    if ($("#telephone").val() != "") {
      $("[telephone]").html("T " + $("#telephone").val());
      $("[telephone]").parent().show();
    } else {
      $("[telephone]").parent().hide();
    }
    if ($("#email").val() != "") {
      $("[email]").html($("#email").val());
      $("[email]").parent().show();
    } else {
      $("[email]").parent().hide();
    }
    $("#items").html("");
    $("#total_div").html("");
    var ii = 0;
    var total = 0;
    for (var key in shoppingCartContent) {
       var obj = shoppingCartContent[key];
    //   alert(obj.Discount)

       obj.Discount = ((obj.Discount == "0%") ? "" : (obj.Discount));
       obj.imageURL = obj.imageURL.replace("50px", "100px");
       ii += parseInt(obj.quantity);
       total += parseInt(obj.toPay);
       var html = "<div root style='font-size:14px;'><div serial='" + obj.SerialNo + "' style='border-top:1px solid #e2e2e2;min-height:115px;border-bottom:1px solid #e2e2e2;padding:10px;padding-bottom:20px;width:100%;position:relative;'>";
       html += "<div>" + ((obj.imageURL != "") ? obj.imageURL : "<img style='width:100px;' src='http://85.214.165.56:81/coster/www/images/crown.png' />");
       html += "<div style='position:absolute;top:10px;left:120px;color:#ADADAD;'>" + obj.SerialNo + "<br />"
       html += "<span productname style='color:black;max-width:300px;font-size:11px;'>" + obj.productName.replace("undefined","") + "</span></div>";

        html += "<div style='position:absolute;top:10px;right:0px;color:black;font-size:13px;'>";
        html += "<div style='float:right;'>" + "<span>" + obj.quantity + "X&nbsp;</span>" + "<span realvalue='" + parseFloat(obj.realPrice) + "'>" + (parseFloat(obj.realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
        html += "<br /><span style='float:right;font-weight:bold;'>" + (parseFloat(obj.toPay) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";

        html += "<input spdiscount onchange='loadedPages.shoppingCart.discounts(this);' value='" + obj.Discount + "' type='text' class='form-control' style='clear:both;text-align:right;float:right;width:85px;display:none;' placeholder='Discount' /><br />";
        html += "</div></div></div>";
        $(html).appendTo($("#items"));

     }
     iii = (ii > 1) ? " items " : " item ";
     $("#itemsinfo").html(ii + " " + iii + parseFloat(total).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }))
     loadedPages.checkout.ttl = parseFloat(total).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" });
     loadedPages.checkout.t1 = parseFloat(total);
  },
  shareOverview: function() {

    var node = document.getElementById('share');
    $.LoadingOverlay("show", optionsLoader);
    domtoimage.toPng(node)
      .then(function (dataUrl) {
        $("body").append("<img id='hiddenImage' src='"+ dataUrl +"' />");
        var width = $('#hiddenImage').width();
        var height = $('#hiddenImage').height();
        $('#hiddenImage').remove();
        var doc = new jsPDF("p", "mm", "a5");
        var width = doc.internal.pageSize.getWidth();
        var height = doc.internal.pageSize.getHeight();
        var imgProps= doc.getImageProperties(dataUrl);
        var pdfHeight = (imgProps.height * width) / imgProps.width;
        doc.addImage(dataUrl,'PNG',0,0, width, pdfHeight);
        var b64 = btoa(doc.output());

      $.LoadingOverlay("hide");
        window.plugins.socialsharing.shareViaEmail(
            "", // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
            'Overview of your order',
            null, // TO: must be null or an array
            null, // CC: must be null or an array
            null, // BCC: must be null or an array
          "data:application/pdf;base64," + b64, // FILES: can be null, a string, or an array
            onSuccess, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
            onError // called when sh*t hits the fan
          );

    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });


  },
  printOverview: function() {

    try {
      var type = "text/html";
      var title = "overview.html";
      var fileContent = "<html>Phonegap Print Plugin</html>";
      window.plugins.PrintPlugin.print(fileContent,function(){console.log('success')},function(){console.log('fail')},"",type,title);
    } catch(err) {
      alert(err);
    }

  },
  writeInvoice: function() {

  },
  generateInvoice: function() {
    alert("?????")
    var t = parseFloat(loadedPages.checkout.t1);
    var obj = {
       customerid: localStorage.customerid,
       total: loadedPages.checkout.t1,
       date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
       pdf: "",
       vatExcluded: (t / 1.21).toFixed(2),
       vat: t - ((t / 1.21).toFixed(2)),
       stripe_id: loadedPages.checkout.stripeResponse.id
    }
    api.call("insertWebInvoice", function(res) {
      if (res.status == "ok") {
        var nm = "WebInvoice_" + moment(new Date()).format("YYYYMMDD") + "_" + "8" + res.invoiceid.toString().padStart(5, "0") + ".pdf";
        var obj = {
          invoiceid: res.invoiceid,
          pdf: nm
        }
        api.call("updateWebInvoice", function(r) {
          if (res.status == "ok") {
            for (var key in shoppingCartContent) {
              var data = shoppingCartContent[key];
              var obj = {};
              var img = $(data["imageUrl"]);
              console.log(data)
              for (var k in data) {
                obj[k] = data[k];
              }
              var dd = $(obj["CompName"]);
              obj["name"] = (obj["productName"] != "") ? obj["productName"] : obj["CompName"].replace(/<\/?[^>]+(>|$)/g, "");
              obj["imageURL"] = "";
              obj["invoiceid"] = res.invoiceid;
              obj["total"] = parseInt(obj.quantity) * parseFloat(obj.realPrice);
              alert(obj["total"]);
              api.call("insertWebInvoiceBody", function(r) {
                console.log(r);
              }, obj, {}, {});
            }
            loadedPages.checkout.generateInvoice1("8" + res.invoiceid.toString().padStart(5, "0"), nm, res.invoiceid);
          }
        }, obj, {}, {});
      } else {
        showModal({
           title: "Something went wrong",
           showCancelButton: false
        })
      }
    }, obj, {}, {})
  },
  generateInvoice1: function(iid, pdf, invoiceID) {

    $("body").LoadingOverlay("hide");
    var mode = $("#sign").attr("mode");
    $("#sign").modal("hide");
    $("[parts]").hide();
    $("#invoice").show();
    $("#cinf").html("");
    $("#customerInfo").clone().appendTo($("#cinf"));
   $("#mTableBody").html("");
   $("#pTable").html("");
   $("#summary").html("");
   var bc = textToBase64Barcode(iid);
     // $.LoadingOverlay("hide");
     $("#bar_image").attr("src", bc);
    $("#invoiceDate").html(moment(new Date()).format("DD-MM-YYYY HH:mm"));
//  $("#invoiceDate").html("18-06-2020 16:33");
    var h = "";
    var rclass = "even";
    console.log(shoppingCartContent)
    for (var key in shoppingCartContent) {
      var obj = shoppingCartContent[key];
      rclass = (rclass == "even") ? "" : "even";
      h += "<tr class='" + rclass + "'>";
      h += "<td style=''>" + obj.ItemID + "</td>";
      h += "<td style='max-width:50%;width:50%;min-width:50%;text-align:left;word-break:break-word;white-space:normal;'>" + obj.CompName.replace("undefined", "") + "</td>";
      h += "<td style='padding-left:10px;'>" + obj.quantity + "&nbsp;X&nbsp;";
      var tt = parseInt(parseFloat(obj.total) / parseInt(obj.quantity));
      h += "€&nbsp;" + parseFloat(tt).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
      var dd = "";
      if (obj.Discount != "") {
        h += "<br />";
        if (obj.Discount.indexOf("%") > -1) {
          dd += "<span style='color:red;'>&nbsp;-" + obj.Discount;
        } else {
          dd += "€&nbsp;" + parseFloat(obj.Discount).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        dd += "</span>";
        h += dd + "&nbsp;€&nbsp;" + parseFloat(obj.realPrice).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }); + "</td>";
      } else {
        h += "</td>";
      }
      var add = "";
      if (obj.additionalDiscount != "") {
        if (obj.additionalDiscount.indexOf("%") > -1) {
          add += " " + obj.additionalDiscount;
        } else {
          add += "&nbsp;€&nbsp;" + parseFloat(obj.additionalDiscount).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
      obj["showPrice"] = "€&nbsp;" + parseFloat(obj.realPrice).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        shoppingCartContent[key] = obj;
      h += "<td style='text-align:right;'>&nbsp;€&nbsp;" + parseFloat(obj.toPay).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>";
      h += "</tr>";
    }

    if (true) {

  //    h += "<tr><td></td><td></td><td colspan='3' style='font-size:6pt;padding-left:10px;vartical-align:bottom;text-align:right;'>Total: </td><td style='border-top:1px solid #e2e2e2;text-align:right;font-size: 5pt;'>€&nbsp;</td><td style='border-top:1px solid #e2e2e2;text-align:right;font-size: 5pt;'>" + (loadedpages.checkout.t1).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td></tr>";
    }

    var tobepaid = 0;



  /*  h = "<tr><td style='width:100%;font-size: 5pt;'>Total amount to be paid:</td>";
    h += "<td style='width:100px;text-align:left;font-size: 5pt;border-bottom:1px solid #e2e2e2;'>€</td>";
    h += "<td style='width:100px;text-align:right;font-size: 5pt;border-bottom:1px solid #e2e2e2;'>" + parseFloat(tobepaid).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>";
    h += "</tr>";
    $(h).appendTo($("#pTable"));*/

    var vv = (parseFloat(loadedPages.checkout.t1) / 1.21).toFixed(2);
    h += "<tr><td></td><td></td><td style='border-top:1px solid #e2e2e2;width:100%;text-align: right;font-size: 5pt;'>VAT excluding:</td>";
    h += "<td style='border-top:1px solid #e2e2e2;width:100px;text-align:right;font-size: 5pt;'>€&nbsp;" + parseFloat(vv).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>";
    h += "</tr>";

    h += "<tr><td></td><td></td><td style='width:100%;text-align: right;font-size: 5pt;'>VAT 21%:</td>";
    h += "<td style='width:100px;text-align:right;font-size: 5pt;'>€&nbsp;" +  (parseFloat(loadedPages.checkout.t1) - vv).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>";
    h += "</tr>";

    h += "<tr><td></td><td></td><td style='width:100%;text-align: right;font-size: 5pt;'>Total due:</td>";
    h += "<td style='width:100px;text-align:right;font-size: 5pt;'>€&nbsp;" + parseFloat(loadedPages.checkout.t1).toLocaleString("nl-NL",{ minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>";
    h += "</tr>";
    h += "<tr><td colspan='4' style='white-space:normal;text-align:center;padding-top:15px;'>In case of any problem please contact support@costerdiamonds.com. Reffer to your invoice number and your payment id <b>Stripe " + loadedPages.checkout.stripeResponse.id + "</b>.</td>"



    $(h).appendTo($("#mTableBody"));

    $("#inm").html(iid);
        return;



       if (obj.vatRefund == "") {
         obj.vatRefund == "0";
       }
       if (obj.adminCharge == "") {
         obj.adminCharge == "0";
       }

         api.call(((invoiceID == "") ? "insertInvoice" : "updateInvoiceDocuments"), function(res) {
console.log(res)
           if (res.status == "ok") {
             loadedPages.checkout.currentInvoice = invoiceID.toString().padStart(5, "0");
             invoiceID = res.invoiceid;
            localStorage.invoiceID =  res.invoiceid;
              var nm = "SalesInvoice_" + moment(new Date()).format("YYYYMMDD") + "_" + "9" + invoiceID.toString().padStart(5, "0");
              localStorage.documentName = nm;
               documentName = nm;
              var obj1 = {
                invoiceid: invoiceID,
                pdf:  nm + "_" + "gb" + ".pdf",
                documentName :  nm,
              }
            api.call("updateInvoicepdf", function(res) {

            }, obj1, {}, {});
            var ivoiceID = "9" + invoiceID.toString().padStart(5, "0");
      //          var ivoiceID = "9" + 19.toString().padStart(5, "0");
            $("#inm").html(ivoiceID);
             api.call("deleteInvoiceBody", function(r) {
             }, {invoiceid: invoiceID }, {}, {})
             api.call("deleteInvoicePayments", function(r) {
             }, {invoiceid: invoiceID }, {}, {})
             for (var key in shoppingCartContent) {
               var data = shoppingCartContent[key];
               var obj = {};
               var img = $(data["imageUrl"]);
               console.log(data)
               for (var k in data) {
                 obj[k] = data[k];
               }
               obj["name"] = obj["productName"].split("<br />")[0];
               obj["imageURL"] = "";
               obj["invoiceid"] = invoiceID;

               api.call("insertInvoiceBody", function(r) {
                 console.log(r);
               }, obj, {}, {});
             }
             for (var key in payments) {
               var data = payments[key];
               var obj = {};
               for (var k in data) {
                 obj[k] = data[k];
               }
               obj["invoiceid"] = invoiceID;
               if (obj.paymentID != "7") {
                 api.call("insertInvoicePayments", function(r) {
                 }, obj, {}, {});
               }
             }
             var ivoiceID = "9" + invoiceID.toString().padStart(5, "0");

             var bc = textToBase64Barcode(ivoiceID);
               // $.LoadingOverlay("hide");
               $("#bar_image").attr("src", bc);
               var html = $("#invoice")[0].outerHTML;
               $.ajax({
                 url: "http://85.214.165.56:5100",
                 type: 'POST',
                 dataType: "json",
                 data: {
                   createPDF: "1",
                   html: html,
                   name: nm
                 },
                 success: function(res) {

                   var mail =  {
                        from: "costerdiamonds@gmail.com",
                        customer: $("#email").val(),
                        customerName: $("#name").val(),
                        name: nm + "_" + "gb" + ".pdf",
                        subject: "Invoice",
                        text: "Generated " + (new Date()),
                        user: "cobol1962@gmail.com",
                        mode: mode,
                        invoiceid: invoiceID,
                        date: moment(new Date()).format("DD-MM-YYYY"),
                        invoiceNumber: ivoiceID
                  }
                  api.call("sendMail", function(res) {
                    var txt = "";
                    if (mode == 1) {
                      txt = "Mail sent succesfully"
                    }
                    if (mode == 2) {
                      txt = "Invoice created succesfully"
                    }
                    if (mode == 3) {
                      txt = "Invoice created and sent succesfully"
                    }
                    setTimeout(function() {
                        $.LoadingOverlay("hide");

                        showModal({
                          title: txt,
                          allowBackdrop: false,
                          showCancelButton: false,
                          confirmCallback: function() {
                            $("#4").show();
                            $("#invoice").hide();
                            if (mode != 1) {
                              window.open("http://85.214.165.56:81/api/invoices/" +  nm + "_" + "gb" + ".pdf", '_system');
                              $.LoadingOverlay("hide");
                            }
                            var t = $.parseJSON(localStorage.tour);
                            if (t.custom !== undefined) {
                              delete localStorage.tour;
                            }
                            resetLocalStorage();
                            userData.activity = "Created invoice 9" + loadedPages.checkout.currentInvoice;
                            api.call("createlog", function () {
                                ws.send(JSON.stringify({action: "reloadadmin"}))
                            }, userData, {}, {});
                            loadPage('homepage')
                          }
                        })
                      }, 4000);
                  }, mail, {});
                 }
               })

           } else {
             showModal({
                title: "Something went wrong",
                showCancelButton: false
             })

             $.LoadingOverlay("hide");
             return false;
           }
         }, obj, {},{});
     },
     checkEmail: function() {

    /*   api.call("checkCustomerEmail", function(res) {
         if (res.length > 0) {
           var html = "<table style='width:100%;'>";
           $.each(res, function() {
             html += "<tr id='" + this.customerid + "' onclick='loadedPages.checkout.getCustomer(this);'><td>" + this.customer + "</td></tr>";
           })
           html += "</table>";
           showModal({
             title: "Customer(s) bellow found with same email. Click one to get data or confirm new customer.",
             content: html,
             showCancelButton: false,
             confirmButtonText: "CONFIRM NEW CUSTOMER"
           })
         }

       }, { email: $("#email").val() }, {}, {})*/
     },
     getCustomer: function(obj) {

       api.call("getCustomerByid", function(res) {
         $("#customerid").val(obj.id);
         var d = res[0];
         for (var k in d) {
           $("#customerForm").find("[name='" + k + "']").val(d[k]);
         }
         $("#countries").val(d["countryCode"]).trigger('change');
         $('#mainModal').modal("hide");
       }, {query: obj.id}, {}, {})
     },
     addTour: function() {
       showModal({
           title: "Enter tour noumber",
           content: "<input id='tnum' type='number' class='form-control' />",
           allowBackdrop: false,
           showClose: false,
           noclose: true,
           cancelCallback: function() {
               $('#mainModal').modal("hide");
           },
           confirmCallback: function() {
             localStorage.tour = JSON.stringify({ ProjId: $("#tnum").val(), custom: "1" });
              $('#tours tbody tr').removeClass('selected');
             $("#mainModal").modal("hide");
             loadedPages.checkout.setCName();
           }
       })
     },
     setCName: function() {

       if (localStorage.tour !== undefined) {
         var data = $.parseJSON(localStorage.tour);

         if (data.PrivateID != "null") {
           $("#name").val(data.ProjName);
         }
         $('#1').hide();
         $('#2').show();
       } else {
         showModal({
            title: "Choose tour or add new tour.",
            showCancelButton: false,
            confirmCallback: function() {
              $('#1').show();
              $('#2').hide();
             }
         })

       }
     },
     signature: function(mode) {
       $("#sign").attr("mode", mode);
       $("#clear").trigger("click");
       $('#sign').modal({
         backdrop: 'static',
         keyboard: false
       })
       $('#sign').modal("show");
     },
     doStripe: function() {
       loadedPages.checkout.stripeResponse;
       showModal({
         title: "Confirm payment of " + loadedPages.checkout.ttl,
         confirmButtonText: "CONFIRM",
         confirmCallback: function() {
           $("#frmStripePayment").find("#amount").val(loadedPages.checkout.t1);
           $.ajax({
              url:"stripe.php",
              method:"POST",
              data:$('#frmStripePayment').serialize(),
              dataType: "JSON",
              success:function(res){
                if (res.status = "succeeded") {
                  loadedPages.checkout.stripeResponse = res;
                  loadedPages.checkout.thankyou();
                  $("#3").hide();
                  $("#4").show();
                } else {
                  showModal({
                    type: "error",
                    title: "Something went wrong. Check your card details",
                    showCancelButton:false
                  });
                }

              }
         });
         }
       })
     },
     thankyou: function() {
       $("#sname").val($("#customerForm").find("#name").val());
       $("#saddress1").val($("#customerForm").find("#address1").val());
       $("#saddress2").val($("#customerForm").find("#address2").val());
       $("#stelephone").val($("#customerForm").find("#telephone").val());
       $("#szip").val($("#customerForm").find("#zip").val());
       $("#scity").val($("#customerForm").find("#city").val());

       html = "<b>" + $("#customerForm").find("#name").val() + " Thank you for your order." + "</b><br/>";
       html += "Your payment has been succesfully proccessed. Payment reference is Stripe " +  loadedPages.checkout.stripeResponse.id + "<br /><br />";
       html += "<h4>Please confirm shipping details:</h4>";
       $("#thanks").html(html);
     }

}
