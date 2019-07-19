function ControlIterator() {
    /** @private {Array} */
    this._items = [];

    /** @private {Object} */
    this._keyCurrent = 2;

    /** @private {Boolean} */
    this._isPlay = true;

    /** @private {Number} */
    this._keyPlay = 2;
}

ControlIterator.prototype.init = function (items) {
    if (!items.length) {
        throw new Error('Items with video empty');
    }
    this._items = items;
}

ControlIterator.prototype.setKeyCurrent = function(keyCurrent) {
    this._keyCurrent = keyCurrent;
}

ControlIterator.prototype.getCurrent = function () {
    if (this._keyCurrent === null) {
        this._keyCurrent = 0; this._items[0];
    }
    var result = this._items[this._keyCurrent];
    if (this._keyCurrent == this._keyPlay) {
        result = this._isPlay ? this._items[this._keyCurrent][0] : this._items[this._keyCurrent][1];
    }
    return result;
}

ControlIterator.prototype.getNext = function () {
    return this._items[this._getKeyNext()];
}

ControlIterator.prototype.next = function () {
    this._keyCurrent = this._getKeyNext();
    return this.getCurrent();
}

ControlIterator.prototype.previous = function () {
    this._keyCurrent = this._getKeyPrevious();
    return this.getCurrent();
}

ControlIterator.prototype.switchToPlay = function () {
    this._isPlay = true;
}

ControlIterator.prototype.switchToPause = function () {
    this._isPlay = false;
}

/** @private {Number} */
ControlIterator.prototype._getKeyNext = function () {
    var keyNext = this._keyCurrent + 1;
    if (keyNext > this._items.length - 1) {
        keyNext = 0;
    }
    return keyNext;
}
/** @private {Number} */
ControlIterator.prototype._getKeyPrevious = function () {
    var keyPrevious = this._keyCurrent - 1;
    if (keyPrevious < 0) {
        keyPrevious = this._items.length - 1;
    }
    return keyPrevious;
}