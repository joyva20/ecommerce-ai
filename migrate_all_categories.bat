@echo off
echo =====================================================
echo   CATEGORY MIGRATION SCRIPT
echo =====================================================
echo.
echo This script will update product categories:
echo   Topwear    -^> Top Wear
echo   Bottomwear -^> Bottom Wear  
echo   Winterwear -^> Top ^& Bottom Wear
echo.
echo IMPORTANT: Make sure your MongoDB server is running!
echo.
pause

echo.
echo [1/2] Migrating MongoDB database...
node migrate_categories.js

echo.
echo [2/2] Migrating CSV file...
python migrate_csv_categories.py

echo.
echo =====================================================
echo   MIGRATION COMPLETED!
echo =====================================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Restart your frontend development server
echo 3. Test the admin panel and collection filters
echo.
pause
