<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyTimeData extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'needs',
        'cw',
        'year',
    ];

    protected $casts = [
        'needs' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
