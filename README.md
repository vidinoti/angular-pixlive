# angular-pixlive
Plugin for using PixLive SDK in Ionic framework.

## Using the AR View

* Add the plugin to your Ionic project: 
  
  `ionic add vidinoti/angular-pixlive`
* Add the Cordova plugin for PixLive SDK to your Ionic project. This has to be done **after** having added the different platforms you use: 
  
  `ionic plugin add com.vidinoti.cordova.pixlive --variable PIXLIVE_SDK_IOS_LOCATION=\"/home/PixLiveSDKiOS/VDARSDK.framework\" --variable PIXLIVE_SDK_ANDROID_LOCATION=\"/home/PixLiveSDKAndroid/lib\"`
  
  where the paths corresponds to the location for iOS and Android of the framework and libs.
* Add JS Bundle file in you index.html: 
  
  `<script src="lib/angular-pixlive/js/PixLive.bundle.js"></script>` 
* Add the `pixlive` angular module to be loaded with your app. It should like similar to:
  
  ```js
angular.module('myApp', ['ionic', 'myApp.controllers', 'myApp.services', 'pixlive'])
  ```
* Add the PixLive SDK init call in your app.js, in the init part: 

  ```js
if(window.cordova && window.cordova.plugins) {
  //Init PixLive SDK
  cordova.plugins.PixLive.init(cordova.file.dataDirectory+'pixliveData','<My License ID>');
}
  ```
  
* Add an Augmented Reality view in one of your Ionic views. Note that content inserted within the view is display on platforms where the SDK is not available:
  
  ```html
<ion-view view-title="PixLive" style="background-color: transparent !important;">
  <pxl-view>
    <div class="row row-center" style="height: 100%;">
        <div class="col" style="text-align: center"><img src="http://www.vidinoti.com/images/logo.png" style="max-width: 100%"></div>
    </div>
  </pxl-view>
</ion-view>
  ```

**Warning**: The camera view is inserted **below** your app. Therefore you need to make to have your view transparent where the camera should appear. As above, put the background color to transparent on your ion-view as well as on your ion-tabs, if any.

## AR Model / Context Synchronization

The plugin exposes a `PxlRemoteController` service allowing you to request synchronizations of the contexts / AR Models. This can be done anywhere in your controllers or at app launch time. The plugin make sure that everything is ready before issuing the call so it's safe to use it anywhere.

Example of usage:

```js
myApp.controller('PixLiveCtrl', function($scope, $ionicLoading, $compile, PxlRemoteController, $ionicPopup) {
    // Trigger a synchronization with the tag test, pass an empty array to synchronize with all the contexts.
    PxlRemoteController.synchronize(['test']).then(function(contexts) {
        console.log('Syncronization OK: ');
        console.log(contexts);
    }, function(reason) {
        $ionicPopup.alert({
            title: 'PixLive Synchronization Error',
            template: reason
        });
    });
});
```

## Events

The following directives can be used **as attribute** on any elements to get the associated events from the PixLive SD:

* pxlContextEnter
* pxlContextExit
* pxlCodeRecognize

It can be used for example as follow in your HTML template:

```
<ion-view view-title="AR"  style="background-color: transparent !important;">
  <pxl-view pxl-context-enter="contextEnter">
    
  </pxl-view>
</ion-view>
```

This will call the `contextEnter` on the controller linked with the view when an image or a iBeacon is detected.