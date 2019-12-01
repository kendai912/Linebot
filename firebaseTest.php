<?php
require './vendor/autoload.php';

// ----------------------------------------------------------------------
// Firebase認証
// ----------------------------------------------------------------------
use Kreait\Firebase;
use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

$serviceAccount = ServiceAccount::fromJsonFile(__DIR__.'/firebase_credentials.json');
$factory = (new Factory)->withServiceAccount($serviceAccount);
$database = $factory->createDatabase();

// ----------------------------------------------------------------------
// Firebaseへのデータ保存
// ----------------------------------------------------------------------
// $newPost = $database->getReference('test')->set([
  //   'newPost' => '初投稿'
  // ]);
  
// ----------------------------------------------------------------------
// Firebaseデータ取得
// ----------------------------------------------------------------------
$reference = $database->getReference('U5675b178054001cb3f7f6f00920faa92');
$data = $reference->getValue();
var_dump($data);

foreach ($data as $key => $value) {
    echo $value['titleTag']."<br>";
}
