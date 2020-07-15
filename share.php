<?php
    include($_SERVER["DOCUMENT_ROOT"] . "/api/config/database.php");
    $sql = "select * from products where ItemID='" . $_GET['itemid'] . "'";

    $res = [];
    $res = mysqli_fetch_assoc($mysqli->query($sql));


  $res1 = [];
  $sql = "select * from itemsTableView where itemid='" . $_GET['itemid'] . "'";
  $r = $mysqli->query($sql);
  $qnt = 0;
  $weight = 0;
  $desc = "";
  $desc ="";
  while ($row = mysqli_fetch_assoc($r)) {
    $qnt += $row["Qnt"];
    $weight += $row["TotalWeight"];
    if ($row["Qnt"] > 1) {
      $s = "stones";
    } else {
      $s = "stone";
    }
    if ($row["Qnt"] != "0") {
      $desc .= "" . $row["Qnt"] . " " . $s . " " . round($row["TotalWeight"], 2) . " crt ";
    } else {
      $desc .= round($row["TotalWeight"], 2) . " crt</b> ";
    }
    $desc .=  $row["TypeID"] . " ";
    if ($row["ColourID"] != "") {
      $desc .= "color: " . $row["ColourID"] . " ";
    }
    if ($row["ClarityID"] != "") {
      $desc .= "clarity: " . $row["ClarityID"] . " ";
    }
    if ($row["CutID"] != "") {
      $desc .= "cut: " . $row["CutID"] . " ";
    }
    $desc .=  "-";
  }
  $desc .= "";
  $res1["description"] = $desc;

 ?>
<!DOCTYPE html>
<head>
  <title>Royal Coster Diamonds</title>
  <meta property="og:title" content="Royal Coster Diamonds - <?=$res['SerialName']?>" />
  <meta property="og:description" content="<?=$res1['description']?>" />
  <meta property="og:image" content="http://costercatalog.com:81/catalog/images/<?=$res['ImageName']?>?t=<?=time()?>" />
  <meta property="og:url" content="http://costercatalog.com:81/ecommerce/share.php?itemid=<?=$_GET['itemid']?>">
  <!--<meta property="og:image:width" content="600"/>-->
  <!--<meta property="og:image:height" content="400"/> -->

  <meta name="twitter:title" content="Royal Coster Diamonds - <?=$res["SerialName"]?>">
  <meta name="twitter:description" content="<?=$$res1['description']?>">
  <meta name="twitter:image" content="http://costercatalog.com.81/catalog/images/<?=$res['ImageName']?>">
  <meta name="twitter:card" content="summary_large_image">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
</head>
<body>
<img src="http://costercatalog.com:81/catalog/images/<?=$res['ImageName']?>" />
  <br />
  <p><?=$res1['description']?></p>
</body>
<script type="text/javascript">
  $(document).ready(function() {
  //  alert("http://costercatalog.com:81/ecommerce/#details?" + "<?=$_GET['itemid']?>")
    window.location.href = "http://costercatalog.com:81/ecommerce/#details?" + "<?=$_GET['itemid']?>";
  });
</script>
</html>
<?php  ?>
