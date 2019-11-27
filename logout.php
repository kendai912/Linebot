<?php
session_start();

//sessionを初期化
$_SESSION = array();

//cookieに保存してあるsessionIDの保存期間を過去にして破棄
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-42000, '/');
}

//サーバのsessionを破棄
session_destroy();

//処理後、login.phpにリダイレクト
header("Location: login.php");
exit();
