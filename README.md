# angular-video
Easy to use Angular JS directive for playing HTML5 video sources.

## Basic Usage

```javascript
var module = angular.module('myApp', ['']);
module.controller('MyCtrl', [
    // HtmlPlayer service is provided by the video player
    '$scope', 'HtmlPlayer',
    function($scope, HtmlPlayer) {
        $scope.player = HtmlPlayer;
        $scope.video = { 
            sources: [
                ['video/webm',  'video-file.webm'],
                ['video/ogg',   'video-file.ogv'],
                ['video/mp4',   'video-file.mp4'],
                ['video/3gp',   'video-file.3gp']
            ]
        };
    }
]);
```

## Markup

```html
<link type="text/css" src="/bower_components/jeffsrepoaccount/angular-video/dist/angular-video.css" />
<script type="text/javascript" src="/bower_components/jeffsrepoaccount/angular-video/dist/angular-video.min.js"></script>

<jrl-video-player 
    data-video="video"
    data-player="player">
</jrl-video-player>
```

## All Options

```html
<jrl-video-player 
    data-video="video"
    data-player="player"
    data-autoplay="false"
    data-muted="false"
    data-loop="false"
    data-controls="false">
</jrl-video-player>
```

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT). For full details refer to LICENSE
