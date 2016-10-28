/*
 * angular-pixlive v1
 * (c) 2015-2016 Vidinoti https://vidinoti.com
 * License: MIT
 */

'use strict';

var pixliveModule = angular.module('pixlive', []);
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
/*
 * angular-pixlive v1
 * (c) 2015-2016 Vidinoti https://vidinoti.com
 * License: MIT
 * 
 * Remote Controller
 *
 */

'use strict';

pixliveModule

    /**
     * @memberof pixlive
     * @ngdoc service
     * @name PxlRemoteController
     * @param {service} $ionicPlatform The Ionic Platform helper
     * @param {service} $q Angular promise service
     * @param {service} PxlEventService PixLive SDK Event service
     * @description 
     *   Manage and trigger PixLive Maker content synchronization with the app.
     */
    .factory('PxlRemoteController', [
        '$ionicPlatform',
        '$q',
        'PxlEventService',
        function PxlRemoteController($ionicPlatform, $q, PxlEventService) {

            /*private*/

            /*public*/
            return {

                /**
                 * Start an asynchronous content synchronization with PixLive Maker backend
                 *
                 * **Warning**: Only one synchronization can be started at a time.
                 * 
                 * @memberof PxlRemoteController
                 * @param {string[]} tags The array of tags to start the synchronization with. Pass an empty array for synchronizing your app with all the available content.
                 * @returns {Promise} The Angular promise that can be used for checking asynchronously the result of the call.
                 */
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
 * angular-pixlive v1
 * (c) 2015-2016 Vidinoti https://vidinoti.com
 * License: MIT
 * 
 * SDK Controller
 *
 */

'use strict';

pixliveModule

    /**
     * @memberof pixlive
     * @ngdoc service
     * @name PxlController
     * @param {service} $ionicPlatform The Ionic Platform helper
     * @param {service} $q Angular promise service
     * @description 
     *   Exposes PixLive SDK methods using an angular-like service
     */
    .factory('PxlController', [
        '$ionicPlatform',
        '$q',
        function PxlController($ionicPlatform, $q) {

            /*private*/

            /*public*/
            return {

                /**
                 * Display the PixLive SDK notification list over the Ionic app. 
                 * If no notification is available, the call fails and return false.
                 * 
                 * @memberof PxlController
                 * 
                 * @returns {boolean} True if the method was able to show the list (i.e. if the list is not empty), false otherwise.
                 */
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

                /**
                 * Will show the list of "nearby" contents. It can be either geolocalized points (GPS points)
                 * or beacons. If called with the coordinates (0, 0), a loading wheel (progress bar) will
                 * be displayed for indicating that the position is being acquired. The list can then be
                 * reloaded by calling the function PixLive.refreshNearbyList. If called 
                 * 
                 * @param {float} latitude - the current latitude
                 * @param {float} longitude - the current longitude
                 */
                presentNearbyList: function(latitude, longitude) {
                    var deferred = $q.defer();

                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.presentNearbyList(latitude,longitude);
                        }
                    });
                },
                
                /**
                 * If the list displaying the nearby GPS point is displayed, calling this function
                 * will reload the nearby elements according to the new given coordinate.
                 * The beacon list will be refreshed as well.
                 * 
                 * @param {float} latitude - the current latitude
                 * @param {float} longitude - the current longitude
                 */
                refreshNearbyList: function(latitude, longitude) {
                    var deferred = $q.defer();

                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.refreshNearbyList(latitude,longitude);
                        }
                    });
                },

                /**
                 * Class returned by the getContext method of the PxlController 
                 * service that describe a single context available within the app.
                 * 
                 * @class
                 * @groupName class
                 * @name Context
                 * @memberOf pixlive
                 * @property {string}  contextId            - The ID of the context
                 * @property {string}  name                 - The name of the context as entered in PixLive Maker
                 * @property {string}  lastUpdate           - Date of last update of the context in the format YYYY-MM-DD HH:MM:SS ±HHMM
                 * @property {string}  description          - The description of the context as entered in PixLive Maker
                 * @property {string}  notificationTitle    - The title of the last notification generated by the context, or `null` if no such notification is available.
                 * @property {string}  notificationMessage  - The message of the last notification generated by the context, or `null` if no such notification is available.
                 * @property {string}  imageThumbnailURL    - The absolute URL toward the thumbnail of the image representing this context, null if not available.
                 * @property {string}  imageHiResURL        - The absolute URL toward the full resolution image representing this context, null if not available.
                 */

                /**
                 * Asynchronously return the list of contexts that is available within the app (i.e. the ones that have been synchronized.)
                 * 
                 * See {@link pixlive.Context} for the description of the Context class.
                 * 
                 * @memberof PxlController
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with an `Array<Context>` 
                 *      argument corresponding to all the context/content contained in the app. 
                 */
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
                },

                /**
                 * Asynchronously return the context with the given contextId if this context has been synchronized.
                 * 
                 * See {@link pixlive.Context} for the description of the Context class.
                 * 
                 * @param {string} contextId the ID (from the {@link pixlive.Context#contextId } property of the Context object) of the context to add to the bookmark list
                 * 
                 * @memberof PxlController
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with a `Context` 
                 *      argument corresponding to the context/content with the given contextId 
                 */
                getContext: function(contextId) {
                    var deferred = $q.defer();

                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.getContext(contextId,function(context) {
                                deferred.resolve(context);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });

                    return deferred.promise;
                },
                /**
                 * Return true if the app contain GPS points, false otherwise
                 *
                 * @memberof PxlController
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with a `boolean` 
                 *      argument indicating if the app contain GPS points (true) or not (false)
                 */
                isContainingGPSPoints: function() {
                    var deferred = $q.defer();
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.isContainingGPSPoints(function(containingGPSPoints) {
                                deferred.resolve(containingGPSPoints);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                },
                /**
                 * Asynchronously return the list of GPS points in the bounding box specified by its lower left and uper right corner
                 *
                 * @memberof PxlController
                 *
                 * @param {Number} lat1 latitude of point 1
                 * @param {Number} lon1 longitude of point 1
                 * @param {Number} lat2 latitude of point 2
                 * @param {Number} lon2 longitude of point 2
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with a Number argument
                 *      corresponding to distance between the two GPS points
                 */
                computeDistanceBetweenGPSPoints: function(lat1, lon1, lat2, lon2) {
                    var deferred = $q.defer();
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.computeDistanceBetweenGPSPoints(lat1, lon1, lat2, lon2, function(distance) {
                                deferred.resolve(distance);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                },

                /**
                 * Asynchronously return the list of nearby GPS points
                 *
                 * See {@link pixlive.GPSPoint} for the description of the GPSPoint class.
                 *
                 * @memberof PxlController
                 *
                 * @param {Number} myLat current latitude
                 * @param {Number} myLon current longitude
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with an `Array<GPSPoint>` 
                 *      argument corresponding to nearby GPS points
                 */
                getNearbyGPSPoints: function(myLat, myLon) {
                    var deferred = $q.defer();
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.getNearbyGPSPoints(myLat, myLon, function(list) {
                                deferred.resolve(list);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                },

                /**
                 * Asynchronously return the list of GPS points in the bounding box specified by its lower left and uper right corner
                 *
                 * See {@link pixlive.GPSPoint} for the description of the GPSPoint class.
                 *
                 * @memberof PxlController
                 *
                 * @param {Number} latitude of the lower left corner
                 * @param {Number} longitude of the lower left corner
                 * @param {Number} latitude of the uper right corner
                 * @param {Number} longitude of the uper right corner
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with an `Array<GPSPoint>` 
                 *      argument corresponding to GPS points in the specified bounding box
                 */
                getGPSPointsInBoundingBox: function(minLat, minLon, maxLat, maxLon) {
                    var deferred = $q.defer();
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.getGPSPointsInBoundingBox(minLat, minLon, maxLat, maxLon, function(list) {
                                deferred.resolve(list);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                },

                /**
                 * Asynchronously return the list of contexts that have been bookmarked.
                 *
                 * When bookmark support has been enabled (by calling cordova.plugins.PixLive.setBookmarkSupport(true)), 
                 * a bookmark button is displayed on fullscreen content such as web pages. Clicking it will mark the content as 
                 * bookmarked. The content that have been bookmarked can be retrieved using this method.
                 * You can also add and remove bookmarks programatically using the {@link pixlive.PxlController#addBookmark} / {@link pixlive.PxlController#removeBookmark} method
                 * 
                 * See {@link pixlive.Context} for the description of the Context class.
                 * 
                 * @memberof PxlController
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with an `Array<Context>` 
                 *      argument corresponding to the context/content that have been bookmarked. 
                 */
                getBookmarks: function() {
                    var deferred = $q.defer();
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.getBookmarks(function(list) {
                                deferred.resolve(list);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                },

                /**
                 * Add a new bookmark for a given context. The context corresponding to the contextId
                 * will be added to the bookmark list.
                 * 
                 * @param {string} contextId the ID (from the {@link pixlive.Context#contextId } property of the Context object) of the context to add to the bookmark list
                 * 
                 * @memberof PxlController
                 */
                addBookmark: function(contextId) {
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.addBookmark(contextId);
                        }
                    });
                },

                /**
                 * Remove a context from the bookmark list.
                 * 
                 * @param {string} contextId the ID (from the {@link pixlive.Context#contextId } property of the Context object) of the context to remove from the bookmark list
                 * 
                 * @memberof PxlController
                 */
                removeBookmark: function(contextId) {
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.removeBookmark(contextId);
                        }
                    });
                },

                /**
                 * Asynchronously returns true or false depending if the context identifier by contextId (its ID) has been bookmarked or not.
                 * 
                 * @param {string} contextId the ID (from the {@link pixlive.Context#contextId } property of the Context object) of the context to check
                 *
                 * @returns {Promise} An Angular Promise where the success 
                 *      method will be called with an `boolean` 
                 *      argument indicating if the context has been bookmarked (true) or not (false)
                 * 
                 * @memberof PxlController
                 */
                isBookmarked: function(contextId) {
                    var deferred = $q.defer();
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.isBookmarked(contextId, function(bookmarked) {
                                deferred.resolve(bookmarked);
                            }, function() {
                                deferred.reject();
                            });
                        } else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                },

                /**
                 * Will open an url with the PixLive SDK internal browser
                 * 
                 * @param {string} url - The url
                 *
                 * @memberof PxlController
                 */
                openURLInInternalBrowser: function(url) {
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.openURLInInternalBrowser(url);
                        }
                    });
                }               
            };
        }
    ]);
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