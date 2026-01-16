<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'username',
        'displayname',
        'permission',
        'password',
        'group',
        'needs',
        'competence',
        'courses',
        'pwdLastSet',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'group' => 'array',
        'needs' => 'array',
        'competence' => 'array',
        'courses' => 'array',
        'pwdLastSet' => 'datetime',
        'password' => 'hashed',
    ];

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function studyTimeData()
    {
        return $this->hasMany(StudyTimeData::class);
    }
}
