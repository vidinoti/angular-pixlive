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

                                            ionic.on('resize', $scope.onResize, window);
                                            ionic.on('backdrop.shown', $scope.onModalShown, window);
                                            ionic.on('backdrop.hidden', $scope.onModalHidden, window);

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

                    $delegate.retain = function() {
                        var args = [].slice.call(arguments);

                        // Call the original with the output prepended with formatted timestamp
                        retainFn.apply(null, args)

                        $delegate.backdropHolds++;

                        //Call the disable 
                        if ($delegate.backdropHolds == 1) {
                            ionic.trigger('backdrop.shown', {
                                target: window
                            });
                        }
                    };

                    $delegate.release = function() {
                        var args = [].slice.call(arguments);

                        // Call the original with the output prepended with formatted timestamp
                        releaseFn.apply(null, args)

                        $delegate.backdropHolds--;

                        //Call the disable 
                        if ($delegate.backdropHolds == 0) {
                            ionic.trigger('backdrop.hidden', {
                                target: window
                            });
                        }
                    };

                    $delegate.isDisplayed = function() {
                        return $delegate.backdropHolds>0;
                    }

                    return $delegate;
                }
            ]);
        }
    ]);