# OS X AppJs Bootstrap
=========================

This is a boilerplate AppJS desktop application for OS X

This is a fork from [tmaiaroto/osx-appjs-bootstrap](https://github.com/tmaiaroto/osx-appjs-bootstrap) with express.js taken out and other stuff like OS X command keys and default menus added in.

For more information about AppJs, see [AppJs.org](http://www.appjs.org)

## Quickstart

You can clone this project, `cd` into the repo folder, and type the command:

    ./test

That will bundle and launch the little default application for you, but you really won't see much.  However, what you will be looking at is actually quite a robust application.  Just about anything you can do with Node.js you'll be able to do here.

Then when you're ready you can build an app bundle with the `appjsbuild` command.  For example:

    ./appjsbuild --open --name="My Amazing App" --targetdir=~/build 

See `.appjsbuild -h` for more options.

## Next Steps

You'll want to go into the `src` directory and start building your application.  Checkout the `app.js` file first. In there you will see options to change file menus in your application among other things.

You can install any node module you like with npm just like normal. Just make sure you are running that in the `src` directory.  When you're done, you can add installed node modules in the `app.js` file `modules` section to make them available throughout your app as `N.module_name` (ex. `N.fs` or `N.crypto`).

You can change the default application icon by making your own .icns file and replacing `src/app.icns`.  Just a small note about the application icons...OS X will cache them. I tried to make the bundle script remove that cache best I could, but you may need to take other measures.

## Dependencies

* <http://appjs.org/>

## Todo

* open file dialog <http://stackoverflow.com/questions/14597196/appjs-opendialog-return-value-is-garbled>
    * keep and eye on <https://github.com/appjs/appjs/issues/316>
