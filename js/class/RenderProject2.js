/**
 * Created by Guillaume on 14/03/2015.
 */
RenderP = function (format) {
    this.tracks = currentProject.tabListTracks;
    this.nextElement = null;
    this.elementEnd = null;
    this.commands = [];
    this.commandTracksAudio = [];
    this.commandTracksVideo = [];
    this.commandList = [];
    this.previousZoom = parseInt(document.getElementById('zoomRange').value);
    changeZoom((parseInt(document.getElementById('zoomRange').max)/2), false);

    this.FORMAT = {
        MPEG4 : { ext : 'mp4', codec : 'mpeg4'},
        AVI : {ext : 'avi', codec : null},
        OGG : {ext : 'ogg', codec : null},
        WEBM : {ext : 'webm', codec : null},
        TS : {ext : 'ts' , codec : null},
        X264 : {ext : 'mp4', codec : 'libx264'}
    };

    this.userFormat = format || this.FORMAT.MPEG4;
    console.log(this.userFormat);

    var tabAudioTrack = [];
    var tabVideoTrack = [];

    for (i=0;i<this.tracks.length;i++)
    {
        if (this.tracks[i].type == TYPE.VIDEO)
        {
            tabVideoTrack.push(this.tracks[i]);
        }
        else
        {
            tabAudioTrack.push(this.tracks[i]);
        }
    }

    console.log(tabAudioTrack, tabVideoTrack, "Tab audioVideo");
    /* Processing audio Tracks */
    this.t = 0;
    for (t = 0; t < tabAudioTrack.length; t++) {

        this.t = t;

        tabAudioTrack[t].tabElements.sort(function (a, b) {
            return a.marginLeft - b.marginLeft
        }); //sort pour avoir les element dans le bon ordre des marges

        this.commands.push([]);

        this.elementInTrack = tabAudioTrack[t].tabElements;

        console.log("track ", t, "elementT", this.elementInTrack);

        for (var e = 0; e < this.elementInTrack.length; e++) {
            console.log("element n°", e);

            if (e == 0) {
                console.log("0 -> deb");
                if (this.elementInTrack[e].marginLeft >= oneSecond) {
                    cmd = "-ar 48000 -f s16le -acodec pcm_s16le -ac 2 -i /dev/zero -acodec libmp3lame -aq 4 -t " + Math.ceil(this.elementInTrack[e].marginLeft / oneSecond) + " -y " + (this.commands[this.t].length) + ".mp3" ;
                    // "-loop 1 -r 1 -c:v png -i black.png -t " + Math.ceil(this.elementInTrack[e].marginLeft / oneSecond) + " -s 1280x720 -y " + (this.commands[this.t].length) + ".ts"
                    this.commandList.push(cmd);
                    this.commands[this.t].push(cmd);

                }

                this.addCommandA(this.elementInTrack[e]);
                //this.addCommandV(this.elementInTrack[e]);
                ((this.elementInTrack.length - 1) != e) ?  this.addBlackA(e) : null;
                //this.addBlackV(e)) : null;

            }
            else if (e == (this.elementInTrack.length - 1)) {
                console.log("length -1");
                this.addCommandA(this.elementInTrack[e]);
                //: this.addCommandV(this.elementInTrack[e]);
            }
            else {
                    console.log("not -1");
                    this.addCommandA(this.elementInTrack[e]) ;
                    //this.addCommandV(this.elementInTrack[e]);
                    this.addBlackA(e) ;
                    //: this.addBlackV(e);
            }
            console.log('End !!')

        }

        if (tabAudioTrack[t].tabElements.length > 0) {
            var lastCmd = "";
            console.log(this.commands[t], this.commands);
            if (this.commands[t].length > 1) {
                lastCmd = '-i "concat:';
                var ending = /*((this.tracks[t].type == TYPE.VIDEO) ? " -c mpeg4" : "" )+*/" -y ";
                for (i = 0; i < this.commands[t].length; i++) {
                    lastCmd +=  "" + i + ".mp3|" ;
                        //: "" + i + ".ts|");
                }
                //lastCmd += complexfliter;
                lastCmd = lastCmd.slice(0, -1);
                lastCmd += '"' + ending;
                lastCmd +=  " track_" + t + ".mp3";
                //: " track_" + t + ".mp4";
            }
            else {
                lastCmd =  "-i 0.mp3 -c copy -y track_" + t + ".mp3";
            //: "-i 0.ts -c mpeg4 -y track_" + t + ".mp4";
            }
            this.commandTracksAudio.push([t, lastCmd]);
            //: this.commandTracksVideo.push([t, lastCmd]);
            this.commands[t].push(lastCmd);
            this.commandList.push(lastCmd);
        }
    }


    //--------------------
    var finalAudio = "audio.mp3";
    // Merge audio tracks into single one
    if (this.commandTracksAudio.length > 1) {
        var cmd = "";
        for (i = 0; i < this.commandTracksAudio.length; i++) {
            var trackId = this.commandTracksAudio[i][0];
            cmd += "-i track_" + trackId + ".mp3 ";
        }
        cmd += "amix=inputs=" + this.commandTracksAudio.length + ":duration=longest:dropout_transition=2 audio.mp3";
        this.commandList.push(cmd);
        finalAudio = "audio.mp3";
    }
    else {
        finalAudio = "track_1.mp3";
    }


    // merge audio and video
    if (this.commandTracksAudio>0 || this.commandTracksVideo>0)
    {
        console.log("-i "+ ((this.commandTracksVideo.length > 0) ? "track_0.mp4 " : "") +" " + ((this.commandTracksAudio.length > 0) ? "-i " + finalAudio : "") + " -s 1280x720 "+((this.FORMAT[this.userFormat].codec != null)?"-c:v "+this.FORMAT[this.userFormat].codec:"")+" final."+this.FORMAT[this.userFormat].ext);
        this.commandList.push("-i "+ ((this.commandTracksVideo.length > 0) ? "track_0.mp4 " : "") + " " + ((this.commandTracksAudio.length > 0) ? "-i " + finalAudio : "") + " -s 1280x720 "+((this.FORMAT[this.userFormat].codec != null)?"-c:v "+this.FORMAT[this.userFormat].codec:"")+" final."+this.FORMAT[this.userFormat].ext);

        this.commandList.push("-i "+ ((this.commandTracksVideo.length > 0) ? "track_0.mp4 " : "") + " " + ((this.commandTracksAudio.length > 0) ? "-i " + finalAudio : "") + " -s 1280x720 -c:v "+this.FORMAT.X264.codec+" final_WEB."+this.FORMAT.X264.ext);

        changeZoom(this.previousZoom, false);
        this.uploadCommands();
    }

};
RenderP.prototype.addCommandV = function (e) {
    var cmd = "";
    this.elementEnd = e.marginLeft + e.width
    var curentFileforElement = this.getFileInformationById(e.fileId)

    if (curentFileforElement.type == TYPE.IMAGE || curentFileforElement.type == TYPE.TEXT) {
        var codec = "";
        switch (curentFileforElement.format) {
            case "png":
                codec = "png";
                break;
            case "bmp":
                codec = "bmp";
                break;
            case "jpeg":
                codec = "mjpeg";
                break;
            case "jpg":
                codec = "mjpeg";
                break;
        }
        cmd = "-loop 1 -r 1 -c:v " + codec + " -i FILE_" + e.fileId + ".data -t " + (Math.ceil((e.width - e.rightGap) / oneSecond))
        + " -s 1280x720 -r 24 -y " + this.commands[this.t].length + ".ts"
        this.commands[this.t].push(cmd);
        this.commandList.push(cmd);
    }
    else {
        cmd = "-ss " + (e.leftGap / oneSecond) + " -i FILE_" + e.fileId + ".data -t " + (Math.ceil((e.width - e.rightGap) / oneSecond)) +
        " -s 1280x720 -y " + this.commands[this.t].length + ".ts";
        this.commands[this.t].push(cmd);
        this.commandList.push(cmd);
    }


};

RenderP.prototype.addCommandA = function (e) {
    this.elementEnd = e.marginLeft + e.width;
    var cmd = "-ss " + (e.leftGap / oneSecond) + " -i FILE_" + e.fileId + ".data -t " + (Math.ceil((e.width - e.rightGap) / oneSecond)) + " -y " + this.commands[this.t].length + ".mp3";
    this.commands[this.t].push(cmd);
    this.commandList.push(cmd);
};

RenderP.prototype.addBlackV = function (e) {
    tempIndex = e;
    tempIndex++;
    var cmd = "";
    if (!(tempIndex > this.elementInTrack.length)) {
        this.nextElement = this.elementInTrack[tempIndex];
        if (this.nextElement.marginLeft == this.elementEnd || this.nextElement.marginLeft - this.elementEnd < oneSecond/2) {
            //fileContent += "\n element+1 sticked !";
            console.log("sticked");
        }
        else {
            console.log("black from ", this.elementEnd, "to ", this.nextElement.marginLeft);
            cmd = "-loop 1 -r 1 -c:v png -i black.png -t "
            + Math.ceil((this.nextElement.marginLeft - this.elementEnd) / oneSecond)
            + " -s 1280x720 -r 24 -y " + this.commands[this.t].length + ".ts";
            this.commands[this.t].push(cmd);
            this.commandList.push(cmd);
        }
    }
};

RenderP.prototype.addBlackA = function (e) {
    tempIndex = e;
    tempIndex++;
    if (!(tempIndex > this.elementInTrack.length)) {
        this.nextElement = this.elementInTrack[tempIndex];
        if (this.nextElement.marginLeft == this.elementEnd || this.nextElement.marginLeft - this.elementEnd < oneSecond/2) {
            //fileContent += "\n element+1 sticked !";
            console.log("sticked");
        }
        else {
            console.log("black from ", this.elementEnd, "to ", this.nextElement.marginLeft);
            var cmd  = "-ar 48000 -f s16le -acodec pcm_s16le -ac 2 -i /dev/zero -acodec libmp3lame -aq 4 -t " + Math.ceil((this.nextElement.marginLeft - this.elementEnd) / oneSecond) + " -y " + this.commands[this.t].length + ".mp3";
            this.commands[this.t].push(cmd);
            this.commandList.push(cmd);
        }
    }
};

RenderP.prototype.getFileInformationById = function (id) {
    for (i = 0; i < currentProject.tabListFiles.length; i++) {
        if (currentProject.tabListFiles[i].id == id) {
            var file = currentProject.tabListFiles[i];
        }
    }
    return file;
};
RenderP.prototype.uploadCommands = function () {
    var finalString = "";

    for (i = 0; i < this.commandList.length; i++) {
        finalString += this.commandList[i];
        if (i != this.commandList.length - 1) {
            finalString += "\n"
        }
    }
    finalString += "\n";

    var txtFile = new Blob([finalString], {type: 'text/plain', name: "command.ffm"});
    uploadFile(-1, "renderFile", txtFile, "RENDER");
};