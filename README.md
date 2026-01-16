# CheckIN (PHP Version)

This is a rewrite of the CheckIN project in PHP with a static HTML/JS frontend.

## Structure

*   `public/`: Web root. Contains static HTML, JS, CSS, and API endpoints.
*   `src/`: PHP classes (Backend logic).
*   `data/`: Configuration and data files.
*   `legacy/`: Contains the original Next.js application.

## Requirements

*   PHP 8.0+
*   PostgreSQL
*   PDO PostgreSQL extension (`php-pgsql`)

## Installation

1.  Configure the database connection in `data/config.json` or via environment variable `POSTGRES_URL`.
2.  Ensure `data/` directory is writable by the web server user.
3.  Serve the `public/` directory using a web server (Apache, Nginx, or PHP built-in server).

## Running with PHP built-in server

```bash
cd public
php -S localhost:8000
```

Then visit `http://localhost:8000`.
