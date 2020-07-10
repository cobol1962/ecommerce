<?php
header('Content-Type: application/json');
use \PhpPot\Service\StripePayment;


if (!empty($_POST["token"])) {
    require_once 'StripePayment.php';
    $stripePayment = new StripePayment();


    $stripeResponse = $stripePayment->chargeAmountFromCard($_POST);
    $amount = $stripeResponse["amount"] /100;

    $param_type = 'ssdssss';
    $param_value_array = array(
        $_POST['email'],
        $_POST['item_number'],
        $amount,
        $stripeResponse["currency"],
        $stripeResponse["balance_transaction"],
        $stripeResponse["status"],
        json_encode($stripeResponse)
    );


    $res = [];
    if ($stripeResponse['amount_refunded'] == 0 && empty($stripeResponse['failure_code']) && $stripeResponse['paid'] == 1 && $stripeResponse['captured'] == 1 && $stripeResponse['status'] == 'succeeded') {
      $res["status"] = $stripeResponse["status"];
      $res["id"] =  $stripeResponse["id"];
      $res["amount"] = $amount;
    //    $successMessage = "Stripe payment is completed successfully. The TXN ID is " . $stripeResponse["balance_transaction"];
    }
    echo  json_encode($res);
  }
?>
