#!/bin/bash

# Simple test script for PHP implementation
# This validates that the core structure is working

echo "=== CheckIN PHP Implementation Tests ==="
echo ""

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed"
    exit 1
fi
echo "✓ PHP is available: $(php -v | head -n1)"

# Check PHP version
PHP_VERSION=$(php -r 'echo PHP_VERSION;')
PHP_MAJOR=$(echo $PHP_VERSION | cut -d. -f1)
PHP_MINOR=$(echo $PHP_VERSION | cut -d. -f2)
if [ "$PHP_MAJOR" -lt 8 ] || ([ "$PHP_MAJOR" -eq 8 ] && [ "$PHP_MINOR" -lt 1 ]); then
    echo "❌ PHP 8.1 or higher required, found $PHP_VERSION"
    exit 1
fi
echo "✓ PHP version is compatible: $PHP_VERSION"

# Check for PDO extension
if ! php -m | grep -q "^PDO$"; then
    echo "❌ PDO extension not found"
    exit 1
fi
echo "✓ PDO extension is available"

# Check for pgsql extension
if ! php -m | grep -q "^pdo_pgsql$"; then
    echo "❌ pdo_pgsql extension not found"
    exit 1
fi
echo "✓ PDO PostgreSQL extension is available"

# Check if composer is available
if ! command -v composer &> /dev/null; then
    echo "⚠ Composer is not installed (optional but recommended)"
else
    echo "✓ Composer is available: $(composer -V | head -n1)"
fi

# Check if vendor/autoload.php exists
if [ ! -f "vendor/autoload.php" ]; then
    echo "❌ Autoloader not found. Run 'composer install' first."
    exit 1
fi
echo "✓ Composer autoloader is present"

# Test PHP syntax of all PHP files
echo ""
echo "Testing PHP syntax..."
SYNTAX_ERRORS=0
for file in $(find src public -name "*.php"); do
    if ! php -l "$file" > /dev/null 2>&1; then
        echo "❌ Syntax error in $file"
        SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))
    fi
done

if [ $SYNTAX_ERRORS -eq 0 ]; then
    echo "✓ All PHP files have valid syntax"
else
    echo "❌ Found $SYNTAX_ERRORS file(s) with syntax errors"
    exit 1
fi

# Test that classes can be loaded
echo ""
echo "Testing class loading..."
php -r "
require 'vendor/autoload.php';
try {
    new CheckIn\Core\Config();
    echo '✓ Config class loaded' . PHP_EOL;
    new CheckIn\Core\Response();
    echo '✓ Response class loaded' . PHP_EOL;
    new CheckIn\Core\Router();
    echo '✓ Router class loaded' . PHP_EOL;
    echo 'CheckIn\Core\Database class exists: ' . (class_exists('CheckIn\Core\Database') ? '✓' : '❌') . PHP_EOL;
    echo 'CheckIn\Auth\SessionManager class exists: ' . (class_exists('CheckIn\Auth\SessionManager') ? '✓' : '❌') . PHP_EOL;
} catch (Exception \$e) {
    echo '❌ Error loading classes: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"

if [ $? -ne 0 ]; then
    exit 1
fi

echo ""
echo "=== All basic tests passed! ==="
echo ""
echo "To start the development server:"
echo "  export POSTGRES_URL='postgres://user:pass@host:5432/db'"
echo "  composer start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up"
