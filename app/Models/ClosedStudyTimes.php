<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClosedStudyTimes extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'lessonID';

    protected $fillable = [
        'lessonID',
        'courseID',
    ];
}
