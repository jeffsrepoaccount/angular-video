(function() {
    'use strict';
    // Usage:
    // <jrl-video-player 
    //    data-video=""
    //    data-player="">
    // </jrl-video-player>
    // Optional attributes:
    //  data-autoplay="true|false"
    //  data-muted="true|false"
    //  data-loop="true|false"
    var module = angular.module('jrl-video', []);
    
    module.paths = {
        root: '/js/demos/video-player/src/'
    };

    module.constant('JRL_VIDEO_ROOT', module.paths.root);

    module.directive('jrlVideoPlayer', [
            '$timeout', 'JRL_VIDEO_ROOT',
            function($timeout, JRL_VIDEO_ROOT) {
                return {
                    link: link,
                    restrict: 'E',
                    templateUrl: JRL_VIDEO_ROOT + 'html.html',
                    scope: {
                        video: '=',
                        player: '=',
                        controls: '=',
                        autoplay: '=',
                        loop: '=',
                        controlsTimeout: '=',
                        muted: '='
                    },
                    replace: true
                };

                function link(scope, element, attrs) {
                    var $video = element.find('video');
                    scope.player.init(element, $video)
                    //scope.$apply();

                    if(scope.autoplay) {
                        $video.attr('autoplay', true);
                    }

                    if(scope.loop) {
                        $video.attr('loop', true);
                    }

                    if(scope.muted) {
                        scope.player.toggleMute();
                    }

                    if(scope.controls !== 'undefined' && scope.controls) {
                        var timeoutPromise;
                        element.hover(
                            function() {
                                if(timeoutPromise) {
                                    $timeout.cancel(timeoutPromise);
                                }
                                var controls = $video.parent().find('.video-controls');
                                controls.stop(true,true).fadeIn(1000);
                            },
                            function(e) {
                                timeoutPromise = $timeout(function() {
                                    var controls = $video.parent().find('.video-controls');
                                    controls.stop(true,true).fadeOut(1000);
                                }, 750);
                            }
                        );    
                    }

                    $video.on('click', function() {
                        scope.player.togglePlayback();
                    });
                    
                }
            }
        ])
        .directive('jrlVideoControls', [
            '$rootScope', 'JRL_VIDEO_ROOT',
            function($rootScope, JRL_VIDEO_ROOT) {
                return {
                    link: link,
                    restrict: 'E',
                    templateUrl: JRL_VIDEO_ROOT + 'controls.html',
                    scope: {
                        video: '=',
                        player: '='
                    },
                    replace: true,
                };

                function link(scope, element, attrs) {
                    // Control interface actions
                    scope.togglePlayback = togglePlayback;
                    scope.toggleFullscreen = toggleFullscreen;
                    scope.seek = seek;
                    scope.formatTime = formatTime;
                    scope.skip = skip;
                    scope.progressStyle = { width: '0' };

                    // TODO: Move this to player
                    scope.player.video[0].addEventListener('durationchange', durationChange);
                    scope.player.video[0].addEventListener('timeupdate', timeUpdate);
                    scope.player.video[0].addEventListener('ended', playbackComplete);

                    var $progressContainer = element.find('.video-track');


                    function durationChange() {
                        scope.player.durationChange();
                        scope.$apply();
                    }

                    function timeUpdate() {
                        scope.progressStyle = { 
                            width: parseInt(this.currentTime / scope.player.duration * 100) + '%' 

                        };
                        scope.player.timeUpdate(this.currentTime);
                        scope.$apply();
                    }

                    function togglePlayback() {
                        scope.player.togglePlayback();
                    }

                    function toggleFullscreen() {
                        scope.player.toggleFullscreen();
                    }

                    function seek(e) {
                        scope.player.seek(
                            ((e.pageX - $progressContainer.offset().left) / $progressContainer.width()) * 
                            scope.player.duration
                        );
                    }

                    function skip(direction) {
                        scope.player.seek(scope.player.video[0].currentTime + direction);
                    }

                    function playbackComplete() {
                        scope.player.playbackComplete();
                        element.show();
                        scope.$apply();
                    }

                    function formatTime(seconds) {
                        seconds = parseInt(seconds);
                        var rawMinutes = Math.floor(seconds / 60),
                            minutes = rawMinutes % 60,
                            hours = Math.floor(rawMinutes / 60),
                            seconds = seconds % 60
                        ;

                        return (hours > 0 ? hours + ':' : '') + 
                            (minutes < 10 ? '0' : '' ) + minutes + ':' + 
                            (seconds < 10 ? '0' : '') + seconds;
                    }
                }
            }
        ])
        .directive('jrlVideoButtonVolume', [
            '$timeout', 'JRL_VIDEO_ROOT',
            function($timeout, JRL_VIDEO_ROOT) {
                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: JRL_VIDEO_ROOT + 'volume.html',
                    link: link,
                    scope: {
                        player: '='
                    }
                }

                function link(scope, element, attrs) {
                    scope.setVolume = setVolume;
                    scope.toggleMute = toggleMute;

                    var $container = element.find('.volume-container'),
                        $volumeBar = element.find('.volume-bar'),
                        $volumeSetting = element.find('.volume-bar-setting'),
                        mouseClicking = false;

                    element.hover(
                        function() {
                            $container.stop(true, false).slideDown('fast').fadeIn('fast');
                        }, function() {
                            $container.stop(true, false).slideUp('fast').fadeOut('fast');
                        }
                    );

                    scope.$watch(function() { return scope.player.volume; },
                        function(newVal) {
                            $volumeSetting.css({height: $volumeBar.height() * newVal});
                        }
                    );

                    function setVolume(e) {
                        var containerHeight = $volumeBar.height(),
                            relY = e.pageY - $volumeBar.offset().top;

                        scope.player.changeVolume((containerHeight - relY) / containerHeight);
                        e.stopPropagation();
                    }

                    function toggleMute() {
                        scope.player.toggleMute();
                        $timeout(function() { scope.$apply(); });
                    }

                    $volumeBar.mousemove(function(e) {
                        if(mouseClicking) {
                            setVolume(e);
                            scope.$apply();
                        }
                    })

                    $volumeBar.mousedown(function() {
                        mouseClicking = true;
                    });

                    $volumeBar.mouseup(function() {
                        mouseClicking = false;
                    });
                }
            }
        ])
        .service('HtmlPlayer', [
            '$rootScope',
            function($rootScope) {
                var svc = {
                    /** Player Properties **/
                    currentTime:        0,
                    volume:             0,
                    duration:           0,
                    element:            null,
                    isFullscreen:       false,
                    isPaused:           true,
                    video:              null,
                    /** Player Functions **/
                    changeVolume:       changeVolume,
                    durationChange:     durationChange,
                    init:               init,
                    playbackComplete:   playbackComplete,
                    seek:               seek,
                    supportsFullscreen: supportsFullscreen,
                    timeUpdate:         timeUpdate,
                    toggleFullscreen:   toggleFullscreen,
                    toggleMute:         toggleMute,
                    togglePlayback:     togglePlayback
                };

                var oldVolume = 0;

                return svc;

                function init(element, video) {
                    // Register fullscreen event listeners
                    document.addEventListener("fullscreenchange", onFullScreenChange);
                    document.addEventListener("webkitfullscreenchange", onFullScreenChange);
                    document.addEventListener("mozfullscreenchange", onFullScreenChange);
                    document.addEventListener("MSFullscreenChange", onFullScreenChange);

                    svc.element = element;
                    svc.video = video;
                    svc.changeVolume(0.5);
                }

                function playbackComplete() {
                    svc.isPaused = true;
                }

                function durationChange() {
                    svc.duration = svc.video[0].duration;
                }

                function timeUpdate(time) {
                    svc.currentTime = time;
                }

                function onFullScreenChange() {
                    svc.isFullscreen = document.fullscreenElement ||
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement ||
                        document.msFullscreenElement;
                    $rootScope.$apply();
                }

                function toggleMute() {
                    svc.video[0].volume = svc.video[0].volume ? 0 : oldVolume;
                    svc.volume = svc.video[0].volume;
                }

                function changeVolume(volume) {
                    svc.volume = oldVolume = volume;
                    svc.video[0].volume = volume;
                }

                function togglePlayback() {
                    if(svc.video[0].paused) {
                        svc.video[0].play();
                    } else {
                        svc.video[0].pause();
                    }
                    // Return whether or not the video is currently playing,
                    // update isPaused status
                    return !(svc.isPaused = !svc.isPaused);
                }

                function supportsFullscreen() {
                    return document.fullscreenEnabled || 
                        document.webkitFullscreenEnabled || 
                        document.mozFullScreenEnabled ||
                        document.msFullscreenEnabled;
                }

                function toggleFullscreen() {
                    if( !(document.fullscreenElement ||
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement ||
                        document.msFullscreenElement) 
                    ) {  
                        enterFullscreen(svc.element[0]);
                    } else {
                        exitFullscreen();
                    }

                    function enterFullscreen(element) {
                        if (element.requestFullscreen) {
                            element.requestFullscreen();
                            svc.isFullscreen = true;
                        } else if (element.webkitRequestFullscreen) {
                            element.webkitRequestFullscreen();
                            svc.isFullscreen = true;
                        } else if (element.mozRequestFullScreen) {
                            element.mozRequestFullScreen();
                            svc.isFullscreen = true;
                        } else if (element.msRequestFullscreen) {
                            element.msRequestFullscreen();
                            svc.isFullscreen = true;
                        } 
                    }

                    function exitFullscreen() {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                            svc.isFullscreen = false;
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                            svc.isFullscreen = false;
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                            svc.isFullscreen = false;
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                            svc.isFullscreen = false;
                        }
                    }
                }

                function fullscreenEnabled() {
                    return
                        document.fullscreenEnabled || 
                        document.webkitFullscreenEnabled || 
                        document.mozFullScreenEnabled ||
                        document.msFullscreenEnabled
                    ;
                    
                }

                function seek(time) {
                    svc.video[0].currentTime = time;
                }
            }
        ])
    ;
})();
