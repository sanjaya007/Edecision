
<?php
$url = 'http://ec2-3-80-123-193.compute-1.amazonaws.com/ePathServer/api/locations?postalCode=';
$postalCode = isset($_GET['postalCode']) ? urlencode($_GET['postalCode']) : '';

if (strlen($postalCode) < 1){
  echo json_encode(['error' => true]);
  exit;
}

$ch = curl_init();

// set url
curl_setopt($ch, CURLOPT_URL, "$url{$postalCode}");
//return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// $output contains the output string
$output = curl_exec($ch);

// close curl resource to free up system resources
curl_close($ch);
echo $output;
exit;
