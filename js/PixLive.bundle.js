/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
 * License: MIT
 */

'use strict';

var pixliveModule = angular.module('pixlive', []);
/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
 * License: MIT
 */

'use strict';

pixliveModule
    .directive('pxlView', [
        '$timeout',
        '$ionicPosition',
        '$ionicPlatform',
        '$ionicBackdrop',
        function($timeout, $ionicPosition, $ionicPlatform, $ionicBackdrop) {
            return {
                restrict: 'E',
                require: '^?ionNavView',
                priority: 800,
                compile: function(element, attr) {

                    element.addClass('scroll-content ionic-scroll scroll-content-false');

                    function prelink($scope, $element, $attr, navViewCtrl) {
                        var parentScope = $scope.$parent;
                        $scope.$watch(function() {
                            return (parentScope.$hasHeader ? ' has-header' : '') +
                                (parentScope.$hasSubheader ? ' has-subheader' : '') +
                                (parentScope.$hasFooter ? ' has-footer' : '') +
                                (parentScope.$hasSubfooter ? ' has-subfooter' : '') +
                                (parentScope.$hasTabs ? ' has-tabs' : '') +
                                (parentScope.$hasTabsTop ? ' has-tabs-top' : '');
                        }, function(className, oldClassName) {
                            $element.removeClass(oldClassName);
                            $element.addClass(className);
                        });

                    }


                    function postlink($scope, $element, $attr, navViewCtrl) {
                        $scope.$on("$ionicView.beforeEnter", function(scopes, states) {
                            if ($scope.arView) {
                                $scope.arView.beforeEnter();
                            }
                        });

                        $scope.$on("$ionicView.afterEnter", function(scopes, states) {
                            if (!$scope.arView) {
                                $ionicPlatform.ready(function() {
                                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {

                                        //FIXME: The timeout is a Dirty hack as on iOS, the status bar CSS style is applied after 
                                        //       this directive is loaded, hence we fail to get the proper Y value for the view.
                                        $scope.pixliveTimeout = $timeout(function() {
                                            var offset = $ionicPosition.offset($element);

                                            var y = offset.top;
                                            var x = offset.left;
                                            var width = offset.width;
                                            var height = offset.height;
                                            $scope.pixliveTimeout = null;
                                            $scope.arView = window.cordova.plugins.PixLive.createARView(x, y, width, height, true);

                                            if ($ionicBackdrop.isDisplayed() != false) {
                                                $scope.arView.disableTouch();
                                            } else {
                                                $scope.arView.enableTouch();
                                            }

                                            $scope.onResize = function() {
                                                var offset = $ionicPosition.offset($element);

                                                var y = offset.top;
                                                var x = offset.left;
                                                var width = offset.width;
                                                var height = offset.height;

                                                $scope.arView.resize(x, y, width, height);
                                            };

                                            $scope.onModalShown = function() {
                                                $scope.arView.disableTouch();
                                            };

                                            $scope.onModalHidden = function() {
                                                $scope.arView.enableTouch();
                                            };

                                            $scope.transferShown = function(){
                                                ionic.trigger('transfer.shown', {
                                                    target: window
                                                });
                                            };

                                            $scope.transferHidden = function(){
                                                ionic.trigger('transfer.hidden', {
                                                    target: window
                                                });
                                            };

                                            ionic.on('resize', $scope.onResize, window);
                                            ionic.on('backdrop.shown', $scope.onModalShown, window);
                                            ionic.on('backdrop.hidden', $scope.onModalHidden, window);
                                            $scope.$on('popover.shown', $scope.transferShown);
                                            $scope.$on('popover.hidden', $scope.transferHidden);

                                        }, 300);
                                    }
                                });
                            } else {
                                $scope.onResize();
                                $scope.arView.afterEnter();
                            }

                        });

                        $scope.$on("$ionicView.beforeLeave", function(scopes, states) {
                            if ($scope.pixliveTimeout) {
                                $timeout.cancel($scope.pixliveTimeout);
                                $scope.pixliveTimeout = null;
                            }
                            if ($scope.arView) {
                                $scope.arView.beforeLeave();
                            }

                        });

                        $scope.$on("$ionicView.afterLeave", function(scopes, states) {
                            if ($scope.arView) {
                                $scope.arView.afterLeave();
                            }

                        });

                        $scope.$on('$destroy', function() {
                            if ($scope.pixliveTimeout) {
                                $timeout.cancel($scope.pixliveTimeout);
                                $scope.pixliveTimeout = null;
                            }
                            if ($scope.arView) {
                                ionic.off('resize', $scope.onResize, window);
                                $scope.arView.destroy();
                            }
                            if ($scope.onModalShown) {
                                ionic.off('backdrop.shown', $scope.onModalShown, window);
                                $scope.onModalShown = null;
                            }
                            if ($scope.onModalHidden) {
                                ionic.off('backdrop.hidden', $scope.onModalHidden, window);
                                $scope.onModalHidden = null;
                            }
                        });
                    }

                    return {
                        pre: prelink,
                        post: postlink
                    };
                }
            };
        }
    ])
    .config(["$provide",
        function($provide) {
            // Use the `decorator` solution to substitute or attach behaviors to
            // original service instance; @see angular-mocks for more examples....

            $provide.decorator('$ionicBackdrop', ["$delegate",
                function($delegate) {
                    // Save the original $log.retain()
                    var retainFn = $delegate.retain;
                    var releaseFn = $delegate.release;

                    $delegate.backdropHolds = 0;

                    $delegate.addBackdropHolds = function(){
                        $delegate.backdropHolds++;

                        //Call the disable 
                        if ($delegate.backdropHolds == 1) {
                            ionic.trigger('backdrop.shown', {
                                target: window
                            });
                        }
                    };

                    $delegate.removeBackdropHolds = function(){ 
                        $delegate.backdropHolds--;

                        //Call the disable 
                        if ($delegate.backdropHolds == 0) {
                            ionic.trigger('backdrop.hidden', {
                                target: window
                            });
                        }
                    };

                    ionic.on('transfer.shown', $delegate.addBackdropHolds, window);
                    ionic.on('transfer.hidden', $delegate.removeBackdropHolds, window);

                    $delegate.retain = function() {
                        var args = [].slice.call(arguments);

                        // Call the original with the output prepended with formatted timestamp
                        retainFn.apply(null, args)

                        $delegate.addBackdropHolds();
                    };

                    $delegate.release = function() {
                        var args = [].slice.call(arguments);

                        // Call the original with the output prepended with formatted timestamp
                        releaseFn.apply(null, args)

                        $delegate.removeBackdropHolds();
                    };

                    $delegate.isDisplayed = function() {
                        return $delegate.backdropHolds>0;
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
 * License: MIT
 * 
 * Remote Controller
 *
 */

'use strict';

pixliveModule
    .factory('PxlRemoteController', [
        '$ionicPlatform',
        '$q',
        'PxlEventService',
        function PxlRemoteController($ionicPlatform, $q, PxlEventService) {

            /*private*/

            /*public*/
            return {
                synchronize: function(tags) {
                    var deferred = $q.defer();

                    var callbackListener = function(event) {
                        deferred.notify(event.progress*100);
                    };

                    //Register progress listener
                    PxlEventService.addListener('syncProgress',callbackListener);

                    $ionicPlatform.ready(function () {

                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.synchronize(tags, function(contexts) {
                                PxlEventService.removeListener('syncProgress',callbackListener);
                                deferred.resolve(contexts);
                            }, function(reason) {
                                PxlEventService.removeListener('syncProgress',callbackListener);
                                deferred.reject(reason);
                            });
                        } else {
                            PxlEventService.removeListener('syncProgress',callbackListener);
                            deferred.resolve([]);
                        }

                    });

                    return deferred.promise;
                }
            };
        }
    ]);
/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
 * License: MIT
 * 
 * SDK Controller
 *
 */

'use strict';

pixliveModule
    .factory('PxlController', [
        '$ionicPlatform',
        '$q',
        function PxlController($ionicPlatform, $q) {

            /*private*/

            /*public*/
            return {
                presentNotificationsList: function() {
                    var deferred = $q.defer();

                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.presentNotificationsList(function() {
                                deferred.resolve();
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });

                    return deferred.promise;
                },
                getContexts: function() {
                    var deferred = $q.defer();

                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.getContexts(function(list) {
                                deferred.resolve(list);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });

                    return deferred.promise;
                }
            };
        }
    ]);
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
                    };
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
                    };
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