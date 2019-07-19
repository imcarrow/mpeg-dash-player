var app = {
    _controls: null,

    /** @private **/
    _onError: function (error) {
        console.error('Error code', error.code, 'object', error);
    },

    /** @private **/
    _getVideoItems: function (callbackOnload) {
        var oReq = new XMLHttpRequest();
        oReq.onload = callbackOnload;
        oReq.open("get", "/data/video-items.json", true);
        oReq.send();
    },

    /** @private **/
    _onErrorEvent: function (event) {
        let error = event.detail;
        app.onError_(error);
    }
};

app.init = function () {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
        app._getVideoItems(app.initPlayer);
    } else {
        console.error('Browser not supported!');
    }
}

app.initPlayer = function () {
    var response = JSON.parse(this.responseText);
    var videoItems = response.items;
    shaka.Player.probeSupport().then(function (support) {
        var video = document.getElementById('video');
        var player = new shaka.Player(video);
        var videoIterator = new VideoIterator();
        videoIterator.init(videoItems);

        player.addEventListener('error', app._onErrorEvent);

        app._controls = new Controls();
        app._controls.init(video, player, videoIterator);

        player.configure({
            streaming: { alwaysStreamText: false }
        });

        var currentVideo = videoIterator.getCurrent()

        player.load(currentVideo.manifestUri, 0);
    }).catch(function (error) {
        app._onError(error);
    });
}

document.addEventListener('DOMContentLoaded', app.init);