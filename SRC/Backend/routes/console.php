<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Tự động khai giảng lớp học mỗi ngày lúc 00:01
// Điều kiện: lớp trạng thái "chuan_bi", đến ngày khai giảng, có ít nhất 1 học viên
Schedule::command('lophoc:khai-giang')->dailyAt('00:01');
