/*
 * angular-pixlive v1
 * (c) 2015-2016 Vidinoti https://vidinoti.com
 * License: MIT
 */

'use strict';

pixliveModule

    /**
     * @ngdoc directive
     * @name pxlView
     * @memberof pixlive
     * @param {service} $timeout Angular $timeout service
     * @param {service} $ionicPosition Ionic $ionicPosition service
     * @param {service} $ionicPlatform Ionic $ionicPlatform service
     * @param {service} $ionicBackdrop Ionic $ionicBackdrop service
     * @restrict E
     *
     * @description
     * Add an augmented reality view to your Ionic app.
     *
     * **Notice**: You should minimize the number of AR view included into your app to the minimum as this is CPU resource intensive. 
     * You should also avoid having two AR views visible at the same time as this will create unexpected behaviors.
     * 
     * **Warning**: This view has to be inside an `ion-view` element whose background has been set to transparent. Failing to do so will make the AR view invisible.
     * 
     * @example
     * <ion-view view-title="AR" style="background-color: transparent !important;">
     *  <pxl-view>
     *    <!-- Any overlay you want -->
     *  </pxl-view>
     * </ion-view>
     */
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

                        // Call the original method
                        retainFn.apply(null, args)

                        $delegate.addBackdropHolds();
                    };

                    $delegate.release = function() {
                        var args = [].slice.call(arguments);

                        // Call the original method
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
    ]).config(["$provide",
        function($provide) {
            $provide.decorator('$ionicModal', ["$delegate","$q",
                function($delegate,$q) {
                    // Save the original $log.show()
                    var fromTemplate = $delegate.fromTemplate;
                    var fromTemplateUrl = $delegate.fromTemplateUrl;
         
                    var overrideShowHide = function (ret) {
                        // Save old methods
                        ret.showOld = ret.show;
                        ret.hideOld = ret.hide;

                        ret.show=function() {
                            ionic.trigger('transfer.shown', {
                                target: window
                            });
                            var args2 = [].slice.call(arguments);
     
                            return this.showOld.apply(this, args2);
                        };

                        ret.hide=function() {
                            ionic.trigger('transfer.hidden', {
                                target: window
                            });
                            var args2 = [].slice.call(arguments);

                            return this.hideOld.apply(this, args2);
                        };
                    };

                    $delegate.fromTemplate = function() {
                        var args = [].slice.call(arguments);

                        var ret = fromTemplate.apply(null, args);

                        overrideShowHide(ret);

                        return ret;
                    };

                    $delegate.fromTemplateUrl = function() {
                        var args = [].slice.call(arguments);
                        var deferred = $q.defer();

                        fromTemplateUrl.apply(null, args).then(function(modal) {
                            overrideShowHide(modal);
                            deferred.resolve(modal);
                        }, function(err) {
                            deferred.reject(err);
                        });

                        return deferred.promise;
                    };

                    return $delegate;
                }
            ]);
        }
    ]);