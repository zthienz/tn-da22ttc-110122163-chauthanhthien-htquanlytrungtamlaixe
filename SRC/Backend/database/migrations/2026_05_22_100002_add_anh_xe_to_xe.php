<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('xe', function (Blueprint $table) {
            $table->string('anh_xe')->nullable()->after('ghi_chu');
        });
    }

    public function down(): void
    {
        Schema::table('xe', function (Blueprint $table) {
            $table->dropColumn('anh_xe');
        });
    }
};
