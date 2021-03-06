var TYPE = {
    AUDIO : 0,
    VIDEO : 1,
    IMAGE : 2,
    TEXT : 3
};

File = function(id, uId, type, size, fileName, format) {
    this.id = id;
    this.uId = uId;

    this.type = type;
    this.size = size;
    this.fileName = fileName;
    this.format = format;

    this.isVideo = false;
    this.isAudio = false;

    this.thumbnail = {i: null, a: null};

    this.properties = null;

    this.isUploaded = {
        i: -1,
        a: -1,
        file: 0
    };
};

File.prototype.makeVideo = function() {
    this.isVideo = true;
};

File.prototype.makeAudio = function() {
    this.isAudio = true;
};

File.prototype.setDuration = function(duration) {
    this.duration = duration;
};

File.prototype.isEditing = function() {
    return this.type == TYPE.TEXT;
};

File.prototype.setProperties = function(properties) {
    this.properties = properties;
};

File.prototype.setThumbnailImage = function(blobImageUrl) {
    this.thumbnail.i = blobImageUrl;
    this.isUploaded.i = 0;
};

File.prototype.setThumbnailAudio = function(blobImageUrl) {
    this.thumbnail.a = blobImageUrl;
    this.isUploaded.a = 0;
};