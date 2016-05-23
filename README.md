# angular-pixlive
[![Build Status](https://travis-ci.org/vidinoti/angular-pixlive.svg?branch=master)](https://travis-ci.org/vidinoti/angular-pixlive)

Plugin for using PixLive SDK in Ionic framework.

## Documentation

The documentation is available at [http://vidinoti.github.io/angular-pixlive/docs](http://vidinoti.github.io/angular-pixlive/docs).

## Using the Augmented Reality View

Follow the following steps do add an augmented reality view in your Ionic project:

* Add the plugin to your Ionic project: 
  
  `ionic add vidinoti/angular-pixlive`
* Add the Cordova plugin for PixLive SDK to your Ionic project:

  ```bash
  ionic plugin add cordova-plugin-pixlive  --variable LICENSE_KEY=MyLicenseKey \
      --variable PIXLIVE_SDK_IOS_LOCATION=\"/home/PixLiveSDKiOS/VDARSDK.framework\"
      --variable PIXLIVE_SDK_ANDROID_LOCATION=\"/home/PixLiveSDKAndroid/vdarsdk-release.aar\"
  ```
  
  where the paths corresponds to the location for iOS and Android of the framework and AAR files. **Do not remove the backslashes before and after the quotes (i.e. \") or the command will fail.**

* Add JS Bundle file in you index.html: 
  
  `<script src="lib/angular-pixlive/js/PixLive.bundle.js"></script>` 
* Add the `pixlive` angular module to be loaded with your app. It should like similar to:
  
  ```js
angular.module('myApp', ['ionic', 'myApp.controllers', 'myApp.services', 'pixlive'])
  ```
* Optionally set up push notification in your app.js, in the init part: 

  ```js
if(window.cordova && window.cordova.plugins) {
  //Init PixLive SDK
  cordova.plugins.PixLive.setNotificationsSupport(true,'GoogleProjectID');
}
  ```
  
  where `GoogleProjectID` corresponds to the ID of the Google project you created in the Google Developer console.
* Add an Augmented Reality view in one of your Ionic views. Note that content inserted within the view will be displayed on top of the AR camera view.
  
  ```html
<ion-view view-title="PixLive" style="background-color: transparent !important;">
  <pxl-view>
    <!-- You can insert other elements here to create overlays -->
  </pxl-view>
</ion-view>
  ```

  **Warning**: The camera view is inserted **below** your Ionic app. Therefore you need to make sure to have your view transparent where the camera should appear. As above, set the CSS property `background-color` to `transparent` on your ion-view as well as on your ion-tabs, if any.

## Synchronizing content from PixLive Maker

PixLive Maker is a platform that allows anyone to create content for your app embeding PixLive SDK.

Your app needs to be synchronized with PixLive Maker so that the content can be used within the app.

To do so, the plugin exposes a `PxlRemoteController` service allowing you to request synchronizations of the contexts / AR content. This can be done anywhere in your controllers or at app launch time. The plugin make sure that everything is ready before issuing the call so it's safe to use it anywhere.

Example of usage within a controller constructor:

```js
myApp.controller('PixLiveCtrl', function($scope, $ionicLoading, $compile, PxlRemoteController, $ionicPopup) {
    // Trigger a synchronization with the tag *test*
    // You can pass an empty array to synchronize with all the contexts.
    PxlRemoteController.synchronize(['test']).then(function(contexts) {
        console.log('Syncronization OK: ');
        console.log(contexts);
    }, function(reason) {
        $ionicPopup.alert({
            title: 'PixLive Synchronization Error',
            template: reason
        });
    }, function(progress) {
        console.log('Synchronization progress: '+progress);
    });
});
```

## Directives for events

The following directives can be used **as attribute** on any elements to get the associated events from the PixLive SDK:

* pxlContextEnter
* pxlContextExit
* pxlCodeRecognize
* pxlAnnotationsPresent
* pxlAnnotationsHide
* pxlSynchronizationRequired
* pxlSensorTriggered
* pxlSensorUpdate
* pxlSensorUntriggered

It can be used for example as follow in your HTML template:

```
<ion-view view-title="AR" style="background-color: transparent !important;">
  <pxl-view pxl-context-enter="contextEnter">
    
  </pxl-view>
</ion-view>
```

This will call the `contextEnter` on the controller linked with the view when an image or a iBeacon is detected. The context ID is passed as a parameter to the contextEnter method.

See the directives' doc for more information.