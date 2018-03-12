# Browsersyncifying Liferay a little

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
3.  Run `npm i`
4.  Run `gulp`
