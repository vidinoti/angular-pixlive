# angular-pixlive
Plugin for using PixLive SDK in Ionic framework.

## Usage

* Add the plugin to your Ionic project: 
  
  `ionic add vidinoti/angular-pixlive`
* Add the Cordova plugin for PixLive SDK to your Ionic project. This has to be done **after** having added the different platforms you use: 
  
  `ionic plugin add com.vidinoti.cordova.pixlive --variable PIXLIVE_SDK_IOS_LOCATION=\"/home/PixLiveSDKiOS/VDARSDK.framework\" --variable PIXLIVE_SDK_ANDROID_LOCATION=\"/home/PixLiveSDKAndroid/lib\"`
  
  where the paths corresponds to the location for iOS and Android of the framework and libs.
* Add JS Bundle file in you index.html: 
  
  `<script src="lib/angular-PixLive/js/PixLive.bundle.js"></script>` 
* Add the PixLive SDK init call in your app.js: 

  ```
if(window.cordova && window.cordova.plugins) {
  //Init PixLive SDK
  cordova.plugins.PixLive.init(cordova.file.dataDirectory+'pixliveData','<My License ID>');
}
  ```
* Add an Augmented Reality view in one of your Ionic views. Note that content inserted within the view is display on platforms where the SDK is not available:
  
  ```
<ion-view view-title="PixLive">
  <pxl-view>
    <div class="row row-center" style="height: 100%;">
        <div class="col" style="text-align: center"><img src="http://www.vidinoti.com/images/logo.png" style="max-width: 100%"></div>
    </div>
  </pxl-view>
</ion-view>
  ```
