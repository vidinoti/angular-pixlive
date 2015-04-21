/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
 * License: MIT
 * 
 * Remote Controller
 *
 */

'use strict';

angular.module('pixlive', [])
    .factory('PxlRemoteController', [
        '$timeout',
        '$ionicPlatform',
        '$q',
        function PxlRemoteController($timeout, $ionicPlatform, $q) {

            /*private*/

            /*public*/
            return {
                synchronize: function(tags) {
                    var deferred = $q.defer();
                    
                    $ionicPlatform.ready(function () {
                        if(window.cordova && window.cordova.plugins && window.cordova.plugins.PixLive) {
                            window.cordova.plugins.PixLive.synchronize(tags, function(contexts) {
                                deferred.resolve(contexts);
                            }, function(reason) {
                                deferred.reject(reason);
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