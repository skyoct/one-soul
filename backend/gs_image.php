<?php
header('Content-type:application/json');

$file = 'gs_images.json';

$data = json_decode(file_get_contents($file), true);

$rand = rand(0, count($data)-1);
echo json_encode($data[$rand]);