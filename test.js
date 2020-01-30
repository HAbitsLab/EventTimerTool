//=================== Timer class ==============================
function CountDownTimer(duration, granularity) {
    this.duration = duration;
    this.granularity = granularity || 1000;
    this.tickFtns = [];
    this.running = false;
}

CountDownTimer.prototype.start = function() {
    if (this.running) {
        return;
    }
    this.running = true;

    if (this.hasOwnProperty("alarmTime")) {
        this.toggleAlarmOn = true;
    }

    var start = Date.now(),
        that = this,
        diff, obj,
        timeoutID;

    (function timer() {

        diff = that.duration - (((Date.now() - start) / 1000) | 0);

        if (diff > 0) {
            timeoutID = setTimeout(timer, that.granularity);
        } else {
            diff = 0;
            that.running = false;
        }

        if ((diff < that.alarmTime) && that.toggleAlarmOn) {
            that.toggleAlarmOn = false; // make sure that the alarm is called once;
            that.alarmFtn.call(this);
        }

        obj = CountDownTimer.parse(diff);
        that.tickFtns.forEach(function(ftn) {
            ftn.call(this, obj.minutes, obj.seconds);
        }, that);

        return timeoutID;
    }());

    var resetTimer = function() {
        if (that.running) {
            clearTimeout(timeoutID);
            that.running = false;
            that.duration = 0;
        }
    }
    return resetTimer;
};

CountDownTimer.prototype.onTick = function(ftn) {
    if (typeof ftn === 'function') {
        this.tickFtns.push(ftn);
    }
    return this;
};

CountDownTimer.prototype.onAlarm = function(ftn) {
    if (typeof ftn === 'function') {
        this.alarmFtn = ftn;
    }
    return this;
};

CountDownTimer.prototype.expired = function() {
    return !this.running;
};

CountDownTimer.prototype.setTime = function(secs) {
    this.duration = secs;
}

CountDownTimer.prototype.setAlarmTime = function(alarmTime) {
    this.alarmTime = alarmTime;
}

CountDownTimer.prototype.reset = function(timeoutID) {}

CountDownTimer.parse = function(seconds) {
    return {
        'minutes': (seconds / 60) | 0,
        'seconds': (seconds % 60) | 0
    };
};

// ===================================================================

var globalIndex = 0;
var timer;
var reset;
var round;

var previousTime = 0;


window.onload = function() {
    console.log("========== Starting experiment ===========");
    // console.log("Start,End,Label")

    round = experiment[0].round

    $("#resultlabel").append("round,activity,start,end\n");

    // updateSelection(0);

    display = document.querySelector('#timer');

    globalIndex = 1;
    $('#ActionGuide').text(experiment[globalIndex].action);

    timer = new CountDownTimer(experiment[globalIndex].secs);
    timer.setAlarmTime(1);
    timer.onAlarm(playsound);
    reset = timer.onTick(format).start();

    previousTime = Date.now();

};

function updateSelection(newIndex) {

    globalIndex = newIndex;
    $('#ActionGuide').text(experiment[globalIndex].action);
    
    var currentTime = Date.now();

    if (newIndex > 0) {
        $("#resultlabel").append(round + "," + (globalIndex - 1) + "," +  previousTime + "," + currentTime  +"\n");
    }
    
}

function format(minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    $('#timer').text(minutes + ':' + seconds);

    if (this.expired()) 
        restart();
}

function next(){
     
     timer.setTime(experiment[globalIndex].secs);
     reset = timer.start();
     previousTime = Date.now();
     $('#timer').css('color', 'black')
}

function restart() {

    if (globalIndex < experiment.length - 1) {
        updateSelection(globalIndex + 1);
    }

    
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}




function playsound() {
    var snd = new Audio('./elevator.mp3');
    snd.play();

    if ((globalIndex < experiment.length - 1) && (globalIndex > 0)) {
        $('#timer').css('color', 'purple')
        // $('#ActionGuide').text('Prepare for the next action: ' + experiment[globalIndex + 1].action)
    } else if (globalIndex == experiment.length - 1){
        $("#resultlabel").append(round + "," + (globalIndex) + "," + previousTime + "," + Date.now() +"\n");

        $('#ActionGuide').text('Done!');
        // Start file download.
        download("label.csv",$("#resultlabel").text());
    }
        
}
