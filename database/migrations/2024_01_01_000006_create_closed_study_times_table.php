<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('closed_study_times', function (Blueprint $table) {
            $table->uuid('lessonID')->primary();
            $table->string('courseID');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('closed_study_times');
    }
};
