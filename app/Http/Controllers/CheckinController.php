<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;

class CheckinController extends Controller
{
    public function show()
    {
        return view('checkin');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'studentNote' => 'nullable|string',
            'type' => 'nullable|string', // e.g., 'StudyTime' or 'Course'
        ]);

        $attendance = new Attendance();
        $attendance->user_id = Auth::id();
        $attendance->cw = date('W'); // Current calendar week
        $attendance->studentNote = $validated['studentNote'] ?? null;
        $attendance->type = $validated['type'] ?? 'SelfStudy';
        $attendance->feedback = 'GREEN'; // Default
        $attendance->attended = true;
        $attendance->save();

        return redirect()->route('dashboard')->with('success', 'Check-in successful!');
    }
}
