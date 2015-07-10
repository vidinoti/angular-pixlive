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