/*
 * angular-pixlive v1
 * (c) 2015-2016 Vidinoti https://vidinoti.com
 * License: MIT
 *
 * Event directives
 *
 */

'use strict';

pixliveModule
    /**
     * @memberof pixlive
     * @ngdoc service
     * @name PxlEventService
     * @description 
     *   Add / Remove event subscribers to PixLive SDK related events.
     *
     *   **Note:** You should use the plugin's directive (like `pxlContextEnter`) instead of using this service directly.
     */
    .constant('PxlEventService', (function() {
        
        var eventListeners={};

        var handler = function(event) {
            if(event.type && eventListeners[event.type]) {
                for(var i = eventListeners[event.type].length-1; i>=0; i--) {
                    eventListeners[event.type][i](event);
                }
            }
        };

        return {
            handler: handler,

            /**
             * Add a new listener for the provided event type. 
             * 
             * @memberof PxlEventService
             * @param {string} event The event to register for. See the [cordova-plugin-PixLive](https://github.com/vidinoti/cordova-plugin-PixLive) plugin for more info on the event types.
             * @param {function} callback The function to be called when the provided event is generated.
             */
            addListener: function(event, callback) {
                if(!eventListeners[event]) {
                    eventListeners[event]=[];
                }
                eventListeners[event].push(callback);
            },

            /**
             * Remove an existing listener for the provided event type. 
             * 
             * @memberof PxlEventService
             * @param {string} event The event to register for. See the [cordova-plugin-PixLive](https://github.com/vidinoti/cordova-plugin-PixLive) plugin for more info on the event types.
             * @param {function} callback The function that has been passed to the `addListener(event, callback)` method.
             */
            removeListener: function(event, callback) {
                
                if(!eventListeners[event] || eventListeners[event].length == 0) {
                    return;
                }

                var index = eventListeners[event].indexOf(callback);
                
                if(index==-1)
                    return;

                eventListeners[event].splice(index,1);
            }
        };
    })())
    .run(['PxlEventService', '$ionicPlatform', function(PxlEventService, $ionicPlatform) {
        //We make sure the event service is executed and loaded.
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive && !window.cordova.plugins.PixLive.onEventReceived) {
                cordova.plugins.PixLive.onEventReceived = PxlEventService.handler;
            }
        });
    }])

  
    /**
     * @ngdoc directive
     * @name pxlContextEnter
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a context is entered. Such an event 
     * happens when a context is linked with a beacon and you are getting close 
     * to the beacon, or when an image is linked with such a context and this image has been recognized.
     *
     * The unique ID of the context is passed as a parameter.
     *
     * @example
     * <div pxl-context-enter="contextEnter(contextId)">
     *  ...
     * </div>
     */
    .directive('pxlContextEnter', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlContextEnter](event.context);
                        });
                    };
                    PxlEventService.addListener('enterContext',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('enterContext',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlContextExit
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a context is exited. Such an event 
     * happens when a context is linked with a beacon and you are getting away 
     * from the beacon, or when an image is linked with such a context and this image is not 
     * within the camera sight anymore.
     *
     * The unique ID of the context is passed as a parameter.
     *
     * @example
     * <div pxl-context-enter="contextExit(contextId)">
     *  ...
     * </div>
     */
    .directive('pxlContextExit', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlContextExit](event.context);
                        });
                    };
                    PxlEventService.addListener('exitContext',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('exitContext',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name eventFromContent
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when an event is received from the content (PixliveJS).
     * To dispatch an event from PixLiveJS use: device.dispatchEventInApp(eventName, eventParams);
     *
     * event.eventName The name of the event
     * event.eventParams The parameters of the event

     * @example
     * <div pxl-context-enter="eventFromContent(eventName,eventParams)">
     *  ...
     * </div>
     */
    .directive('pxlEventFromContent', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlEventFromContent](event.eventName,event.eventParams);
                        });
                    };
                    PxlEventService.addListener('eventFromContent',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('eventFromContent',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlSensorTriggered
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a sensor state become triggered (i.e. active).
     *
     * The ID of the sensor and the type of sensor are passed as parameters. The types and IDs are defined hereafter.
     * 
     * Three types of sensors are defined:
     *  1. `Vision`<br/>
     *      Corresponds to an image that has been recognized. As of today, the sensor ID corresponds 
     *      to the context ID to which the sensor is linked but this might change in the future as the 
     *      PixLive SDK does support any kind of IDs.
     *  2. `iBeacon`<br/>
     *      Corresponds to an iBeacon that is in the required proximity of the smartphone. The ID is defined to be:
     *      ```
     *      BeaconUUID_Major_Minor
     *      ```
     *  3. `VidiBeacon`<br/>
     *      Corresponds to a VidiBeacon that is in the required proximity of the smartphone. 
     *      The ID is defined to be the VidiBeacon serial.
     *
     * @example
     * <div pxl-sensor-triggered="sensorTriggered(sensorId, sensorType)">
     *  ...
     * </div>
     */
    .directive('pxlSensorTriggered', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlSensorTriggered](event.sensorId,event.sensorType);
                        });
                    };
                    PxlEventService.addListener('sensorTriggered',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('sensorTriggered',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlSensorUpdate
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a sensor parameter changes.
     *
     * The ID of the sensor, the type of sensor, and the sensor parameters are passed as parameters. The types and IDs are defined hereafter.
     * 
     * Three types of sensors are defined:
     *  1. `Vision`<br/>
     *      Corresponds to an image that has been recognized. As of today, this sensor never gets updated.
     *  2. `iBeacon`<br/>
     *      Corresponds to an iBeacon that is in the required proximity of the smartphone. The ID is defined to be:
     *      ```
     *      BeaconUUID_Major_Minor
     *      ```
     *      
     *      The sensor object contains the following two properties:
     *        * `rssi`: The RSSI in dbm of the received beacon signal
     *        * `distance`: The estimated distance in meters between the beacon and the smartphone
     *          
     *  3. `VidiBeacon`<br/>
     *      Corresponds to a VidiBeacon that is in the required proximity of the smartphone. 
     *      The ID is defined to be the VidiBeacon serial.
     *
     *      The sensor object contains the following property:
     *        * `rssi`: The RSSI in dbm of the received beacon signal
     *
     * @example
     * <div pxl-sensor-update="sensorUpdate(sensorId, sensorType, sensor)">
     *  ...
     * </div>
     */
    .directive('pxlSensorUpdate', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlSensorUpdate](event.sensorId,event.sensorType, event);
                        });
                    };
                    PxlEventService.addListener('sensorUpdate',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('sensorUpdate',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlSensorUntriggered
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a sensor state become untriggered (i.e. not anymore active).
     *
     * The ID of the sensor and the type of sensor are passed as parameters. The types and IDs are defined hereafter.
     * 
     * Three types of sensors are defined:
     *  1. `Vision`<br/>
     *      Corresponds to an image that has been recognized. As of today, the sensor ID corresponds 
     *      to the context ID to which the sensor is linked but this might change in the future as the 
     *      PixLive SDK does support any kind of IDs.
     *  2. `iBeacon`<br/>
     *      Corresponds to an iBeacon that is in the required proximity of the smartphone. The ID is defined to be:
     *      ```
     *      BeaconUUID_Major_Minor
     *      ```
     *  3. `VidiBeacon`<br/>
     *      Corresponds to a VidiBeacon that is in the required proximity of the smartphone. 
     *      The ID is defined to be the VidiBeacon serial.
     *
     * @example
     * <div pxl-sensor-triggered="sensorUntriggered(sensorId, sensorType)">
     *  ...
     * </div>
     */
    .directive('pxlSensorUntriggered', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlSensorUntriggered](event.sensorId,event.sensorType);
                        });
                    };
                    PxlEventService.addListener('sensorUntriggered',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('sensorUntriggered',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlCodeRecognize
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a code (QR Code, Barcode etc..) is recognized by the PixLive SDK
     *
     * The code value (e.g. the URL in case of a QR Code with URL) is passed as parameter.
     *
     * *Note*: You have to enable Code recognition on the SDK for this method to be called.
     * 
     *
     * @example
     * <div pxl-code-recognize="codeRec(codeValue)">
     *  ...
     * </div>
     */
    .directive('pxlCodeRecognize', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlCodeRecognize](event.code);
                        });
                    };
                    PxlEventService.addListener('codeRecognize',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('codeRecognize',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlAnnotationsPresent
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when some augmented reality content is presented on screen.
     *
     * This gives you the opportunity to hide any overlay you may have added over the Augmented Reality (AR) view.
     *
     * *Note*: This method is only called when the AR view is displayed.
     * 
     * @example
     * <div pxl-annotations-present="hideOverlay()">
     *  ...
     * </div>
     */
    .directive('pxlAnnotationsPresent', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlAnnotationsPresent]();
                        });
                    };
                    PxlEventService.addListener('presentAnnotations',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('presentAnnotations',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlAnnotationsHide
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when no more augmented reality content is present on screen.
     *
     * This gives you the opportunity to put back any overlay you may have added over the Augmented Reality (AR) view.
     *
     * *Note*: This method is only called when the AR view is displayed.
     * 
     * @example
     * <div pxl-annotations-hide="showOverlay()">
     *  ...
     * </div>
     */
    .directive('pxlAnnotationsHide', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlAnnotationsHide]();
                        });
                    };
                    PxlEventService.addListener('hideAnnotations',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('hideAnnotations',listener);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name pxlSynchronizationRequired
     * @element Attribute
     * @memberof pixlive
     * @param {service} PxlEventService PixLive SDK Event service
     * @restrict A
     *
     * @description
     * Expression that is evaluated when a context synchronization is required.
     *
     * You should then call the RemoteController to trigger the synchronization with the passed tags (and any others you might want to add).
     *
     * The tags array to synchronize the app with, is passed as parameter (`tags`in the example below)
     *
     * @example
     * <div pxl-synchronization-required="doSync(tags)">
     *  ...
     * </div>
     */
    .directive('pxlSynchronizationRequired', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlSynchronizationRequired](event.tags);
                        });
                    };
                    PxlEventService.addListener('requireSync',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('requireSync',listener);
                    });
                }
            };
        }
    ])
    ;