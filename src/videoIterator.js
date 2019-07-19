function VideoIterator() {
    /** @private {Array} */
    this._items = [];
    /** @private {Object} */
    this._keyCurrent = null;
}

VideoIterator.prototype.init = function (items) {
    if (!items.length) {
        throw new Error('Items with video empty');
    }
    this._items = items;
}

VideoIterator.prototype.getCurrent = function () {
    if (this._keyCurrent === null) {
        this._keyCurrent = 0; this._items[0];
    }
    return this._items[this._keyCurrent];
}

VideoIterator.prototype.getNext = function () {
    return this._items[this._getKeyNext()];
}

VideoIterator.prototype.next = function () {
    this._keyCurrent = this._getKeyNext();
    return this._items[this._keyCurrent];
}

VideoIterator.prototype.previous = function () {
    this._keyCurrent = this._getKeyPrevious();
    return this._items[this._keyCurrent];
}
/** @private {Number} */
VideoIterator.prototype._getKeyNext = function () {
    var keyNext = this._keyCurrent + 1;
    if (keyNext > this._items.length - 1) {
        keyNext = 0;
    }
    return keyNext;
}
/** @private {Number} */
VideoIterator.prototype._getKeyPrevious = function () {
    var keyPrevious = this._keyCurrent - 1;
    if (keyPrevious < 0) {
        keyPrevious = this._items.length - 1;
    }
    return keyPrevious;
}