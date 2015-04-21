# Example plugin for angular-PixLive module using Ionic framework

Quick start:

* `npm install -g ionic bower` to install Bower and Ionic if missing
* `bower install` to install the required components
* `ionic platform add ios` to add the iOS platform (you can also use Android here)
* `ionic plugin add com.vidinoti.cordova.pixlive --variable PIXLIVE_SDK_IOS_LOCATION=\"/Volumes/PixLive SDK/VDARSDK.framework\"` (Do not forget to have the `\"`, this is not a mistake.). The `/Volumes/PixLive SDK/VDARSDK.framework` path contains the PixLive SDK framework for iOS that you downloaded from PixLive Maker - http://pixlivemaker.com
* `ionic emulate ios` to start the iOS simulator with the app