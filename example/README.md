# Example plugin for angular-PixLive module using Ionic framework

Quick start:

* `npm install -g ionic bower` to install Bower and Ionic if missing
* `bower install` to install the required components
* `ionic platform add ios` to add the iOS platform (you can also use Android here)
* `cordova plugin add cordova-plugin-pixlive --variable LICENSE_KEY=MyLicenseKey --variable PIXLIVE_SDK_IOS_LOCATION=\"path/to/VDARSDK.framework\" --variable PIXLIVE_SDK_ANDROID_LOCATION=\"path/to/android/vdarsdk-release.aar\"
  
  Do not forget to have the `\"`, this is not a mistake.
  
  The `/Volumes/PixLive SDK/VDARSDK.framework` path contains the PixLive SDK framework for iOS that you downloaded from PixLive Maker. Same holds for the AAR Android file - http://pixlivemaker.com. You should replace the MyLicenseKey with your license key that can be obtained in the PixLive SDK->My Licenses section in PixLive Maker.
* `ionic emulate ios` to start the iOS simulator with the app
