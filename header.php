<header style="background-color:rgb(117, 151, 203)">
  <div id="headerTitle">フットサル動画ストック</div>
  <div class="logoutBox">
    <button id="logout" onClick="location.href='logout.php'">ログアウト</button>
  </div>
    <form method="POST" action="top.php">
      <input type="hidden" name="userName" value="<?= h($_SESSION['userName']) ?>">
      <input type="hidden" name="password" value="<?= h($_SESSION['password']) ?>">
    </form>
</header>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>フットサル動画ストック</title>
</head>
<body>
  
  <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
  <script>
  $("#headerTitle").on("click", function() {
    $("form").submit();
  })
  </script>
</body>
</html>


