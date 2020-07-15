<?php
    include($_SERVER["DOCUMENT_ROOT"] . "/api/config/database.php");
    $sql = "select * from web_states where stateid='" . $_GET['id'] . "'";

    $res = [];
    $res = mysqli_fetch_assoc($mysqli->query($sql));
 ?>
<!DOCTYPE html>
<head>
  <title>Royal Coster Diamonds</title>
  <meta property="og:title" content="Royal Coster Diamonds - Collection" />
  <meta property="og:description" content="<?=$res1['text']?>" />
  <meta property="og:image" content="http://costercatalog.com:81/catalog/images/crrown.png?t=<?=time()?>" />
  <meta property="og:url" content="http://costercatalog.com:81/ecommerce/shareState.php?id=<?=$_GET['stateid']?>">
  <!--<meta property="og:image:width" content="600"/>-->
  <!--<meta property="og:image:height" content="400"/> -->

  <meta name="twitter:title" content="Royal Coster Diamonds - Collection" />
  <meta name="twitter:description" content="<?=$$res1['description']?>">
  <meta name="twitter:image" content="http://costercatalog.com.81/catalog/images/<?=$res['ImageName']?>" />
  <meta name="twitter:card" content="summary_large_image" />
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
</head>
<body>
<img src="http://costercatalog.com:81/catalog/images/crown.png" />
  <br />
  <p><?=$res1['text']?></p>
</body>
<script type="text/javascript">
  $(document).ready(function() {
  //  alert("http://costercatalog.com:81/ecommerce/#details?" + "<?=$_GET['itemid']?>")
    window.location.href = "http://costercatalog.com:81/ecommerce/#collection?" + "<?=$_GET['id']?>";
  });
</script>
</html>
<?php  ?>
