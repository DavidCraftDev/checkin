<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('event_id')->nullable()->constrained('events')->nullOnDelete(); // Assuming eventID refers to Events
            $table->integer('cw');
            $table->text('teacherNote')->nullable();
            $table->text('studentNote')->nullable();
            $table->string('type')->nullable();
            $table->enum('feedback', ['GREEN', 'YELLOW', 'RED'])->default('GREEN');
            $table->text('selfReflection')->nullable();
            $table->boolean('attended')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
