/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
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
    .directive('pxlContextEnter', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlContextEnter](event.context);
                        });
                    }
                    PxlEventService.addListener('enterContext',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('enterContext',listener);
                    });
                }
            };
        }
    ])
    .directive('pxlContextExit', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlContextExit](event.context);
                        });
                    }
                    PxlEventService.addListener('exitContext',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('exitContext',listener);
                    });
                }
            };
        }
    ])
    .directive('pxlCodeRecognize', [
        'PxlEventService',
        function(PxlEventService) {
            return {
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlCodeRecognize](event.code);
                        });
                    }
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
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlAnnotationsPresent](event.code);
                        });
                    }
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
                link: function(scope, element, attrs) {
                    var listener = function(event) {
                        scope.$apply(function(self) {
                            self[attrs.pxlAnnotationsHide](event.code);
                        });
                    }
                    PxlEventService.addListener('hideAnnotations',listener);
                    element.bind('$destroy', function() {
                        PxlEventService.removeListener('hideAnnotations',listener);
                    });
                }
            };
        }
    ])
    ;