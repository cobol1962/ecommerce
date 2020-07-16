<?php
    include($_SERVER["DOCUMENT_ROOT"] . "/api/config/database.php");
    $sql = "select * from web_states where stateid='" . $_GET['id'] . "'";

    $res = [];
    $res = mysqli_fetch_assoc($mysqli->query($sql));

 ?>
<!DOCTYPE html>
<head>
  <title>Royal Coster Diamonds</title>
  <meta property="og:title" content="Royal Coster Diamonds" />
  <meta property="og:description" content="<?=$res['text']?>" />
  <meta property="og:image" content="http://costercatalog.com:81/catalog/images/crown.png?t=<?=time()?>" />
  <meta property="og:url" content="http://costercatalog.com:81/ecommerce/shareState.php?id=<?=$_GET['id']?>">
  <!--<meta property="og:image:width" content="600"/>-->
  <!--<meta property="og:image:height" content="400"/> -->

  <meta name="twitter:title" content="Royal Coster Diamonds" />
  <meta name="twitter:description" content="<?=$$res['text']?>">
  <meta name="twitter:image" content="http://costercatalog.com.81/catalog/images/crown.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
</head>
<body>
<img src="http://costercatalog.com:81/catalog/images/crown.png" />
  <br />
  <p><?=$res['text']?></p>
</body>
<script type="text/javascript">
  $(document).ready(function() {
  //  alert("http://costercatalog.com:81/ecommerce/#details?" + "<?=$_GET['itemid']?>")
    window.location.href = "http://costercatalog.com:81/ecommerce/#catalog?" + "<?=$_GET['id']?>";
  });
</script>
</html>
<?php  ?>
