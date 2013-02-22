# OS X AppJs Bootstrap
=========================

This is a boilerplate AppJS desktop application for OS X

This is a fork from [tmaiaroto/osx-appjs-bootstrap](https://github.com/tmaiaroto/osx-appjs-bootstrap) with express.js taken out and OS X command keys added in.

For more information about AppJs, see [AppJs.org](http://www.appjs.org)

## Quickstart

You can clone this project and simply open your terminal and type in your terminal:

    ./bundle.sh --open

That will bundle and launch the little default application for you, but you really won't see much.  However, what you will be looking at is actually quite a robust application.  Just about anything you can do with Node.js you'll be able to do here.

## Next Steps

You'll want to go into the `src` directory and start building your application.  Checkout the `app.js` file first. In there you will see options to change file menus in your application among other things.

Note:  The app name is hard-coded in the `app.js` file for now.  This could be retreived dynamically if you made sure the Info.plist was in plain xml and you read that file and used a regex to get the display name.

You can install any node module you like with npm just like normal. Just make sure you are running that in the `src` directory.  When you're done, you can add installed node modules in the `app.js` file `modules` section to make them available throughout your app as `N.module_name` (ex. `N.fs` or `N.crypto`).

You can change the default application icon by making your own .icns file and replacing `src/app.icns`.  Just a small note about the application icons...OS X will cache them. I tried to make the bundle script remove that cache best I could, but you may need to take other measures.

Be sure to look at the help for the bundle script: `./bundle.sh --help` for more options.  Alternatively, you can change the Info.plist file manually (or with XCode or something) after bundling the application if you prefer.

## Misc. Notes

Don't want to build the application bundle to test things out? No problem, run this command:

    ./test.sh

You may even want to run a build command from your IDE to execute that. For example, in Sublimie Text 2, I now simply press Command-B and up pops the application with all my recent changes. It even kills the old process first so I don't need to close the app before launching it again. The only thing I haven't perfected there was to bring the app to the foreground. I tried AppleScirpt via osascript but I couldn't get it to work.

## How?

AppJS is pretty cool. It works by using Chromium and a 32-bit (currently) version of node for OS X and providing a wrapper for it all. This all runs in --harmony mode and essentially you've got a web browser looking at your Node.js application without all the navigation controls, etc.  You can still hit the F12 key to bring up the developer inspector though.  Yes, that can be disabled too, and it probably should be when being bundled vs. tested.

## Dependencies

* <http://appjs.org/>
* <http://mstratman.github.com/cocoadialog/>

## Todo

* Edit menu with Undo/Redo
* open file dialog <http://stackoverflow.com/questions/14597196/appjs-opendialog-return-value-is-garbled>
    * keep and eye on <https://github.com/appjs/appjs/issues/316>
