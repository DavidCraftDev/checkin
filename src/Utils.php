<?php

class Utils {
    public static function parsePgArray($pgArray) {
        if (empty($pgArray) || $pgArray === '{}') return [];
        return explode(',', trim($pgArray, '{}'));
    }
}
