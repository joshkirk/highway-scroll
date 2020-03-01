# Project
This project runs a Prismic based headless solution with PHP backend and is tied to Shopify through a combination of webhooks, the Admin API, and the Storefront API
&nbsp;
___
## Project Dependencies
- PHP version 7.2 or greater (7.0 or greater with manually installed extensions)
-- Extensions: libsodium, intl
- NPM version 6.0 or greater
- Node version 8.0 or greater
&nbsp;
___
## Folder Structure
All work will take place within the `src` folder with only a few exceptions:

- PHP based function files are stored within `web/app/includes`
- PHP based caching & webhook files are stored within `web/site/server`
&nbsp;
___
## Localhost Setup
*Note: Localhost development depends on the `web/cache` folder being downloaded from Staging/Production*
1. Open a console window and navigate to your project root folder (contains `package.json`
2. Navigate to the web folder: `cd web`
3. Run `composer install`
4. Run `composer update` to make sure the latest is downloaded
5. Return to the project root folder from here: `cd ..`
6. Run `npm install`
7. Run `npm update` to make sure the latest is downloaded
8. To start the project now, setup your watch: `npm run watch`

Now you'll need to run your local server. If you're running Apache/PHP through MAMP/WAMP/XAMPP, set your localhost root folder to the `web/site` folder in your Daye project directory. If you want to run a PHP virtual server do the following:
- Windows: Using a console window, navigate to `web` and then type `serve.sh` this will run the bash script for the server startup
- OSX: Using a console window, navigate to `web/site` and then type `php -S localhost:8000` to start your virtual server