/*
 * angular-pixlive v0.0.1
 * (c) 2015 Vidinoti http://vidinoti.com
 * License: MIT
 */

'use strict';

angular.module('pixlive', [])
    .directive('pxlView', [
        '$timeout',
        '$ionicPosition',
        function($timeout, $ionicPosition) {
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
                                $scope.pixliveTimeout = $timeout(function() {
                                    // console.log($ionicPosition.offset($element).top);
                                    ///console.log($ionicPosition.offset($element).height);

                                    var offset = $ionicPosition.offset($element);

                                    var y = offset.top;
                                    var x = offset.left;
                                    var width = offset.width;
                                    var height = offset.height;
                                    $scope.pixliveTimeout = null;
                                    $scope.arView = window.cordova.plugins.PixLive.createARView(x, y, width, height);
                                }, 300);
                            } else {
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
                                $scope.arView.destroy();
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
    ]);