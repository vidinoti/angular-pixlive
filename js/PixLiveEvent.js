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
            addListener: function(event, callback) {
                if(!eventListeners[event]) {
                    eventListeners[event]=[];
                }
                eventListeners[event].push(callback);
            },
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
     * @restrict 'A'
     *
     * @description
     * Expression that is evaluated when a context is entered. Such an event 
     * happens when you are getting close to a beacon registered with the PixLive SDK 
     * or when an image has been recognized.
     *
     * The unique ID of the context is passed as parameter
     *
     * @example
       <div pxl-context-enter="myScopeFunction">
        ...
       </div>
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
     * @restrict 'A'
     *
     * @description
     * Expression that is evaluated when a context is exited. Such an event 
     * happens when you are getting away from a beacon registered with the PixLive SDK 
     * or when an image that has been previously recognized is now out of sight from the camera.
     *
     * The unique ID of the context is passed as parameter
     *
     * @example
       <div pxl-context-enter="myScopeFunction">
        ...
       </div>
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
    ]).directive('pxlAnnotationsPresent', [
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
    ]).directive('pxlAnnotationsHide', [
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
    ]).directive('pxlSynchronizationRequired', [
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