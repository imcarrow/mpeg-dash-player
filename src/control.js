function Controls() {

    /** @private {HTMLMediaElement} */
    this._video = null;

    /** @private {shaka.Player} */
    this._player = null;

    /** @private {VideoIterator} */
    this._videoIterator = null;

    /** @private {Element} */
    this._videoContainer = document.getElementById('videoContainer');

    /** @private {Element} */
    this._controls = document.getElementById('controls');

    /** @private {Element} */
    this._controlsTop = document.getElementById('controlsTop');

    /** @private {Element} */
    this._playButton = document.getElementById('playButton');

    /** @private {Element} */
    this._pauseButton = document.getElementById('pauseButton');

    /** @private {Element} */
    this._seekBar = document.getElementById('seekBar');

    /** @private {Element} */
    this._currentTime = document.getElementById('currentTime');

    /** @private {Element} */
    this._durationTime = document.getElementById('durationTime');

    /** @private {Element} */
    this._rewindButton = document.getElementById('rewindButton');

    /** @private {Element} */
    this._forwardButton = document.getElementById('forwardButton');

    /** @private {Element} */
    this._previousButton = document.getElementById('previousButton');

    /** @private {Element} */
    this._nextButton = document.getElementById('nextButton');

    /** @private {Element} */
    this._bufferingSpinner = document.getElementById('bufferingSpinner');

    /** @private {Element} */
    this._nameVideoCurrent = document.getElementById('controlsTopNameVideoCurrent');

    /** @private {Element} */
    this._nameVideoNext = document.getElementById('controlsTopNameVideoNext');

    /** @private {Element} */
    this._legendQuality = document.getElementById('legendQuality');

    /** @private {Element} */
    this._legendExit = document.getElementById('legendExit');

    /** @private {Element} */
    this._legendQualityText = document.getElementById('legendQualityText');

    /** @private {boolean} */
    this._isSeeking = false;

    /** @private {?number} */
    this._seekTimeoutId = null;

    /** @private {?number} */
    this._mouseStillTimeoutId = null;

    /** @private {?number} */
    this._lastTouchEventTime = null;

    /** @private {?number} */
    this._trackId = null;

    /** @private {ControlIterator} */
    this._controlIterator = null;
}

Controls.prototype.init = function (video, player, videoIterator) {
    this._video = video;
    this._player = player;
    this._videoIterator = videoIterator;

    this._controlIterator = new ControlIterator();
    this._controlIterator.init([
        {
            element: this._previousButton,
            class: this._previousButton.getAttribute('class')
        },
        {
            element: this._rewindButton,
            class: this._rewindButton.getAttribute('class')
        },
        [
            {
                element: this._playButton,
                class: this._playButton.getAttribute('class')
            },
            {
                element: this._pauseButton,
                class: this._pauseButton.getAttribute('class')
            }
        ],
        {
            element: this._forwardButton,
            class: this._forwardButton.getAttribute('class')
        },
        {
            element: this._nextButton,
            class: this._nextButton.getAttribute('class')
        }
    ]);

    this._pauseButton.setAttribute('class', this._pauseButton.getAttribute('class') + ' active');
    this._player.addEventListener('buffering', this._onBufferingStateChange.bind(this));

    window.setInterval(this._updateTimeAndSeekRange.bind(this), 125);

    this._playButton.addEventListener('click', this._onPlayPauseClick.bind(this));
    this._pauseButton.addEventListener('click', this._onPlayPauseClick.bind(this));
    this._rewindButton.addEventListener('click', this._onRewindClick.bind(this));
    this._forwardButton.addEventListener('click', this._onForwardClick.bind(this));
    this._previousButton.addEventListener('click', this._onPreviousClick.bind(this));
    this._nextButton.addEventListener('click', this._onNextClick.bind(this));
    this._legendQuality.addEventListener('click', this._quality.bind(this));
    this._legendExit.addEventListener('click', this._exit.bind(this));

    this._video.addEventListener('play', this._onPlayStateChange.bind(this));
    this._video.addEventListener('pause', this._onPlayStateChange.bind(this));
    this._video.addEventListener('ended', this._onPlayStateChange.bind(this));
    this._video.addEventListener('ended', this._onEnded.bind(this));

    this._seekBar.addEventListener('mousedown', this._onSeekStart.bind(this));
    this._seekBar.addEventListener('touchstart', this._onSeekStart.bind(this), { passive: true });
    this._seekBar.addEventListener('input', this._onSeekInput.bind(this));
    this._seekBar.addEventListener('touchend', this._onSeekEnd.bind(this));
    this._seekBar.addEventListener('mouseup', this._onSeekEnd.bind(this));

    this._videoContainer.addEventListener('touchstart', this._onContainerTouch.bind(this), { passive: false });
    this._videoContainer.addEventListener('click', this._onContainerClick.bind(this));
    this._videoContainer.addEventListener('mousemove', this._onMouseMove.bind(this));
    this._videoContainer.addEventListener('touchmove', this._onMouseMove.bind(this), { passive: true });
    this._videoContainer.addEventListener('touchend', this._onMouseMove.bind(this), { passive: true });
    this._videoContainer.addEventListener('mouseout', this._onMouseOut.bind(this));

    this._controls.addEventListener('click', function (event) { event.stopPropagation(); });
    this._controlsTop.addEventListener('click', function (event) { event.stopPropagation(); });

    window.addEventListener('keydown', this._onKeyDown.bind(this));

    this._setupNamesTopControls();
};

/** @private **/
Controls.prototype._onEnded = function () {
    this._onNextClick();
}

/** @private **/
Controls.prototype._closeControlPanel = function () {
    this._mouseStillTimeoutId = null;
    this._videoContainer.style.cursor = 'none';
    this._controls.style.opacity = 0;
    this._controlsTop.style.opacity = 0;
    var currentButton = this._controlIterator.getCurrent();
    currentButton.element.setAttribute('class', currentButton.class);
}

/**
 * @param {!Event} event
 * @private
 */
Controls.prototype._onKeyDown = function (event) {
    event = event || window.event;
    // backspase
    if (event.keyCode == '8') {
        this._closeControlPanel();
    }
    //Нажатие "Y"
    else if (event.keyCode == '89') {
        this._quality();
    }
    //Нажатие "r"
    else if (event.keyCode == '82') {
        this._exit();
    }
    //Нажатие "enter"
    else if (event.keyCode == '13') {
        if (this._controls.style.opacity == 0) {
            this._showControlPanel();
        } else {
            this._setTimeoutCloseControlPanel(10000);
            var currentButton = this._controlIterator.getCurrent();
            currentButton.element.click();
        }
    }
    // up arrow
    else if (event.keyCode == '38') {
        this._showControlPanel();
    }
    // down arrow
    else if (event.keyCode == '40') {
        this._showControlPanel();
    }
    // left arrow
    else if (event.keyCode == '37') {
        if (this._controls.style.opacity == 0) {
            this._showControlPanel();
        } else {
            this._setTimeoutCloseControlPanel(10000);
            var currentButton = this._controlIterator.getCurrent();
            currentButton.element.setAttribute('class', currentButton.class);
            currentButton = this._controlIterator.previous();
            currentButton.element.setAttribute('class', currentButton.class + ' active');
        }
    }
    // right arrow
    else if (event.keyCode == '39') {
        if (this._controls.style.opacity == 0) {
            this._showControlPanel();
        } else {
            this._setTimeoutCloseControlPanel(10000);
            var currentButton = this._controlIterator.getCurrent();
            currentButton.element.setAttribute('class', currentButton.class);
            currentButton = this._controlIterator.next();
            currentButton.element.setAttribute('class', currentButton.class + ' active');
        }
    }
}

/** @private **/
Controls.prototype._showControlPanel = function () {
    this._controls.style.opacity = 1;
    this._controlsTop.style.opacity = 1;
    this._setTimeoutCloseControlPanel(10000);
    var currentButton = this._controlIterator.getCurrent();
    currentButton.element.setAttribute('class', currentButton.class);
    this._controlIterator.setKeyCurrent(2);
    var element = !this._video.paused ? this._pauseButton : this._playButton;
    element.setAttribute('class', element.getAttribute('class') + ' active');
}

/** @private **/
Controls.prototype._setTimeoutCloseControlPanel = function (second) {
    if (this._mouseStillTimeoutId) {
        window.clearTimeout(this._mouseStillTimeoutId);
    }
    if (!this._lastTouchEventTime) {
        this._mouseStillTimeoutId = window.setTimeout(this._onMouseStill.bind(this), second);
    }
}

/** @private */
Controls.prototype._exit = function () {
    location.href = '//localhost';
}

/** @private */
Controls.prototype._quality = function () {
    var tracks = this._player.getVariantTracks();
    var trackId = 0;
    var track = tracks[trackId];
    var text = "low quality (Y)";
    this._player.configure({ abr: { enabled: false } });
    if (this._trackId === 0) {
        trackId = tracks.length - 1;
        track = tracks[trackId];
        text = "high quality (Y)";
    }
    this._legendQualityText.textContent = text;
    this._trackId = trackId;
    this._player.selectVariantTrack(track, true);
}

/** @private */
Controls.prototype._onPreviousClick = function () {
    this._videoIterator.previous();
    var currentVideo = this._setupNamesTopControls();
    this._video.pause()
    this._player.load(currentVideo.manifestUri, 0);
    this._onPlayStateChange();
}

/** @private */
Controls.prototype._onNextClick = function () {
    this._videoIterator.next();
    var currentVideo = this._setupNamesTopControls();
    this._video.pause()
    this._player.load(currentVideo.manifestUri, 0);
    this._onPlayStateChange();
}

/** @private */
Controls.prototype._setupNamesTopControls = function () {
    var currentVideo = this._videoIterator.getCurrent()
    this._nameVideoCurrent.textContent = currentVideo.name;
    var nextVideo = this._videoIterator.getNext();
    this._nameVideoNext.textContent = nextVideo.name;

    return currentVideo;
}

/**
 * @param {!Event} event
 * @private
 */
Controls.prototype._onMouseMove = function (event) {
    if (event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend') {
        this._lastTouchEventTime = Date.now();
    } else if (this._lastTouchEventTime + 1000 < Date.now()) {
        this._lastTouchEventTime = null;
    }
    if (this._lastTouchEventTime && event.type == 'mousemove') {
        return;
    }
    this._videoContainer.style.cursor = '';
    this._controls.style.opacity = 1;
    this._controlsTop.style.opacity = 1;
    var element = !this._video.paused ? this._pauseButton : this._playButton;
    element.setAttribute('class', element.getAttribute('class') + ' active');
    this._updateTimeAndSeekRange();
    this._setTimeoutCloseControlPanel(3000);
};

/** @private */
Controls.prototype._onMouseOut = function () {
    if (this._lastTouchEventTime) return;
    if (this._mouseStillTimeoutId) {
        window.clearTimeout(this._mouseStillTimeoutId);
    }
    this._onMouseStill();
};

/** @private */
Controls.prototype._onMouseStill = function () {
    this._closeControlPanel();
};

/**
 * @param {!Event} event
 * @private
 */
Controls.prototype._onContainerTouch = function (event) {
    if (!this._video.duration) {
        return;
    }

    if (this._controls.style.opacity == 1) {
        this._lastTouchEventTime = Date.now();
    } else {
        this._onMouseMove(event);
        event.preventDefault();
    }
};

/**
 * @param {!Event} event
 * @private
 */
Controls.prototype._onContainerClick = function (event) {
    this._onPlayPauseClick();
};

/** @private */
Controls.prototype._onPlayPauseClick = function () {
    if (!this._video.duration) {
        return;
    }
    if (this._video.paused) {
        this._video.play();
    } else {
        this._video.pause();
    }
};

/** @private */
Controls.prototype._onPlayStateChange = function () {
    if (this._video.ended && !this._video.paused) {
        this._video.pause();
        this._onNextClick();
    }
    if (this._video.paused && !this._isSeeking) {
        this._controlIterator.switchToPlay();
        this._playButton.style.display = 'inline-block';
        this._pauseButton.style.display = 'none'
    } else {
        this._controlIterator.switchToPause();
        this._playButton.style.display = 'none';
        this._pauseButton.style.display = 'inline-block'
    }
    var currentButton = this._controlIterator.getCurrent();
    currentButton.element.setAttribute('class', currentButton.class + ' active');
};

/** @private */
Controls.prototype._onSeekStart = function () {
    this._isSeeking = true;
    this._video.pause();
};

/** @private */
Controls.prototype._onSeekInput = function () {
    if (!this._video.duration) {
        return;
    }
    this._updateTimeAndSeekRange();
    if (this._seekTimeoutId != null) {
        window.clearTimeout(this._seekTimeoutId);
    }
    this._seekTimeoutId = window.setTimeout(this._SeekInputTimeout.bind(this), 125);
};

/** @private */
Controls.prototype._SeekInputTimeout = function () {
    this._seekTimeoutId = null;
    this._video.currentTime = parseFloat(this._seekBar.value);
};

/** @private */
Controls.prototype._onSeekEnd = function () {
    if (this._seekTimeoutId != null) {
        window.clearTimeout(this._seekTimeoutId);
        this._SeekInputTimeout();
    }
    this._isSeeking = false;
    this._video.play();
};

/** @private */
Controls.prototype._onRewindClick = function () {
    if (!this._video.duration) {
        return;
    }
    var currentTime = this._video.currentTime;
    if (currentTime < 15) {
        this._video.currentTime = 0;
    } else {
        this._video.currentTime -= 15;
    }
};

/** @private */
Controls.prototype._onForwardClick = function () {
    if (!this._video.duration) {
        return;
    }
    var currentTime = this._video.currentTime;
    var durationTime = this._video.duration;
    if (durationTime - currentTime >= 15) {
        this._video.currentTime += 15;
    }
    else {
        this._video.currentTime = durationTime;
    }
};

/**
 * @param {Event} event
 * @private
 */
Controls.prototype._onBufferingStateChange = function (event) {
    this._bufferingSpinner.style.display =
        event.buffering ? 'inherit' : 'none';
};

/**
 * @return {boolean}
 * @private
 */
Controls.prototype._isOpaque = function () {
    let parentElement = this._controls.parentElement;
    return (this._controls.style.opacity == 1 ||
        parentElement.querySelector('#controls:hover') == this._controls);
};

/** @private */
Controls.prototype._updateTimeAndSeekRange = function () {
    if (!this._isOpaque()) {
        return;
    }
    let displayTime = this._isSeeking ?
        this._seekBar.value : this._video.currentTime;
    let duration = this._video.duration;
    let bufferedLength = this._video.buffered.length;
    let bufferedStart = bufferedLength ? this._video.buffered.start(0) : 0;
    let bufferedEnd =
        bufferedLength ? this._video.buffered.end(bufferedLength - 1) : 0;
    let seekRange = this._player.seekRange();
    let seekRangeSize = seekRange.end - seekRange.start;

    this._seekBar.min = seekRange.start;
    this._seekBar.max = seekRange.end;

    if (this._player.isLive()) {
        let behindLive = Math.floor(seekRange.end - displayTime);
        displayTime = Math.max(0, behindLive);

        let showHour = seekRangeSize >= 3600;
        if ((displayTime >= 1) || this._isSeeking) {
            this._currentTime.textContent =
                '- ' + this._buildTimeString(displayTime, showHour);
            this._durationTime.textContent = this._buildTimeString(this._video.duration, showHour);
            this._currentTime.style.cursor = 'pointer';
        } else {
            this._currentTime.textContent = 'LIVE';
            this._currentTime.style.cursor = '';
        }

        if (!this._isSeeking) {
            this._seekBar.value = seekRange.end - displayTime;
        }
    } else {
        let showHour = duration >= 3600;

        this._currentTime.textContent =
            this._buildTimeString(displayTime, showHour);
        this._durationTime.textContent = this._buildTimeString(this._video.duration, showHour);

        if (!this._isSeeking) {
            this._seekBar.value = displayTime;
        }

        this._currentTime.style.cursor = '';
    }

    let gradient = ['to right'];
    if (bufferedLength == 0) {
        gradient.push('#000 0%');
    } else {
        let clampedBufferStart = Math.max(bufferedStart, seekRange.start);
        let clampedBufferEnd = Math.min(bufferedEnd, seekRange.end);

        let bufferStartDistance = clampedBufferStart - seekRange.start;
        let bufferEndDistance = clampedBufferEnd - seekRange.start;
        let playheadDistance = displayTime - seekRange.start;

        let bufferStartFraction = (bufferStartDistance / seekRangeSize) || 0;
        let bufferEndFraction = (bufferEndDistance / seekRangeSize) || 0;
        let playheadFraction = (playheadDistance / seekRangeSize) || 0;

        gradient.push('#000 ' + (bufferStartFraction * 100) + '%');
        gradient.push('#ccc ' + (bufferStartFraction * 100) + '%');
        gradient.push('#ccc ' + (playheadFraction * 100) + '%');
        gradient.push('#444 ' + (playheadFraction * 100) + '%');
        gradient.push('#444 ' + (bufferEndFraction * 100) + '%');
        gradient.push('#000 ' + (bufferEndFraction * 100) + '%');
    }
    this._seekBar.style.background =
        'linear-gradient(' + gradient.join(',') + ')';
};

/** @private */
Controls.prototype._buildTimeString = function (displayTime, showHour) {
    let h = Math.floor(displayTime / 3600);
    let m = Math.floor((displayTime / 60) % 60);
    let s = Math.floor(displayTime % 60);
    if (s < 10) s = '0' + s;
    let text = m + ':' + s;
    if (showHour) {
        if (m < 10) text = '0' + text;
        text = h + ':' + text;
    }
    return text;
};