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