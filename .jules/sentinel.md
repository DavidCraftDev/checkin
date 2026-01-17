# Sentinel Journal

This journal records critical security learnings from the CheckIN codebase.

## 2024-05-22 - [Journal Initialized]
**Vulnerability:** N/A
**Learning:** Initialized Sentinel journal for tracking critical security findings.
**Prevention:** N/A

## 2025-05-22 - [Username Enumeration via Timing Attack]
**Vulnerability:** Login function returned immediately when a username was not found in the database, while it performed a slow bcrypt comparison for existing users.
**Learning:** Checking for existence before verifying credentials allows attackers to distinguish between valid and invalid usernames by measuring response time.
**Prevention:** Always perform a constant-time comparison (e.g., against a dummy hash) regardless of whether the user exists.
