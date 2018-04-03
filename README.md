# Browsersyncifying Liferay a little

## Setup

1.  If you want to modify the `default.config.json` file, create a `custom.config.json` with the keys you want to change

*   For instance, by default browser sync will look for Liferay at port `80`
*   But if your server is on a different port you can place this in your `custom.config.json` file:

```json
{
	"LIFERAY_SERVER_PORT": "3000"
}
```

2.  Prerequisite software:

    *   [Ruby install](https://www.ruby-lang.org/en/documentation/installation/)
    *   [Compass install](http://thesassway.com/beginner/getting-started-with-sass-and-compass)
        *   `gem install compass`

3.  Run:

```
npm i
```

## Running Browser Sync

1.  Running as a **global** command

    *   Npm has a really cool feature where you can symlink your local npm package and run it as a global package from any dir
    *   From the root of this repo simply run

```
npm link
```

*   **Then you can simply run this command from any directory to start up browser sync:**

```
life
```

2.  Running as a **local** command

    *   If you don't want to run this as a global command run then you can do 1 of 2 things:

    *   Run this from root of repo:

```
npm run dev
```

OR Install `gulp-cli` npm module and run this from root of repo:

```
gulp
```

## Known Bugs

1.  Wherever you run the `life` command from produces a superfluous css folder with the bundled css
    *   You can just delete that when you are done developing (it's not needed)
2.  Navigating to another page removes your css changes
    *   You have to hit `Ctrl + s` in the css directory where you are making changes to reapply the changes
