<?php
$url = 'http://ec2-3-80-123-193.compute-1.amazonaws.com/ePathServer/api/eui?region=';
$region = isset($_GET['region']) ? urlencode($_GET['region']) : '';

if (strlen($region) < 1){
  echo json_encode(['error' => true]);
  exit;
}

$ch = curl_init();

// set url
curl_setopt($ch, CURLOPT_URL, "$url{$region}");

//return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// $output contains the output string
$output = curl_exec($ch);

// close curl resource to free up system resources
curl_close($ch);

echo $output;
exit;
