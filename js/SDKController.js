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