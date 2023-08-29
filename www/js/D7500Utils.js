var coms = [];
var allDone;
var processingQue = false;
utilListener = UtilSocketResponse;
function processQue() {
    if (processingQue)
        return;
    if (coms.length <= 0)
        return;
    processingQue = true;
    var cmd = coms.shift();
    sendOneCustomCommand(cmd, function () {
        //console.log("que callback");
        if (coms.length == 0) {
            processingQue = false;
            allDone();
            return;
        }
        processingQue = false;
        processQue();
    })
}
var feedBack;
function sendOneCustomCommand(cmd, fb) {
    feedBack = fb;
    var url = "/command?commandText=";
    cmd = cmd.trim();
    if (cmd.trim().length == 0) return;
    CustomCommand_history.push(cmd);
    CustomCommand_history.slice(-40);
    CustomCommand_history_index = CustomCommand_history.length;
    document.getElementById("custom_cmd_txt").value = "";
    Monitor_output_Update(cmd + "\n");
    cmd = encodeURI(cmd);
    //because # is not encoded
    cmd = cmd.replace("#", "%23");
    SendGetHttp(url + cmd, SendCustomCommandSuccess, SendCustomCommandFailed);
}
// this isn't working yet.
var interceptFeedback = false;
function sendCustomCommands(commands, feedback, msg) {
    interceptFeedback = true;

    commands.forEach(function (command) {
        coms.push(command);
    });
    utilWaitdlg("Please Wait", msg);
    function allDoneFB() {
        closeModal('custom coms');
        feedback();
        interceptFeedback = false;
    };
    allDone = allDoneFB;
    processQue();
}

function UtilSocketResponse(resp) {
    if (calibPoint <= 0 && !interceptFeedback)
        return;
    if (resp.startsWith("ok")) {
        if (typeof feedBack !== 'undefined') {
            //console.log("calling fb");
            feedBack(resp);
        }
    } else {
        console.log("Socket Response: " + resp);
    }
}

//wait dialog
function utilWaitdlg(titledlg, textdlg) {
    var modal = setactiveModal('utilWaitdlg.html');
    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    if (modal == null) return;
    showModal(modal);
}

function removeFilament() {
    function removeNow() {
        setTimeout(function () {
            sendCustomCommands([
                "M83",
                "G1 E5 F150",
                "G1 E-100 F3000",
                "G1 E-100 F3000",
                "G1 E-100 F3000",
                "G1 E-100 F3000",
                "G1 E-100 F3000",
                "M82",
                "M18 E"], function () { }, "I am pushing the filament out...");
        }, 500);
    };
    sendCustomCommands(
        [
            "M104 S200",
            "G91",
            "G1 Z5 F1000",
            "G90",
            "M109 S190"], removeNow, "Please wait while I heat up the nozzle")
}

function insertFilament() {
    function beginInsert(resp){
        if (resp != "yes")
            return;
        function insertNow() {
            setTimeout(function () {
                sendCustomCommands([
                    "M83",
                    "G1 E30 F300",
                    "G1 E100 F3000",
                    "G1 E100 F3000",
                    "G1 E100 F3000",
                    "G1 E50 F500",
                    "G1 E30 F300",
                    "M82"], function () { }, "I am pulling the filament in...");
            }, 500);
        };
        sendCustomCommands(
            [
                "M104 S200",
                "G91",
                "G1 Z5 F1000",
                "G90",
                "M109 S190"], insertNow, "Please wait while I heat up the nozzle")
    }
    confirmdlg("Get Ready!", "Cut the end of filament at an angle and insert in to the feeder just enough for the gear to grip it.", beginInsert);

}

function bedLevelingBoxes() {
    function func(resp){
        sendCustomCommands(
            [
    "M83", 
    "G1 Z3 X10 Y10 F2000", 
    "G1 Z0.3", 
    "G1 X140 Z0.3 E11 F1300", 
    "G1 Y140 Z0.3 E11", 
    "G1 X10 Z0.3 E11", 
    "G1 Y10 Z0.3 E11", 
    "G1 X20 Y20 Z0.3 E3", 
    "G1 X130 Z0.3 E9", 
    "G1 Y130 Z0.3 E9", 
    "G1 X20 Z0.3 E9", 
    "G1 Y20 Z0.3 E9", 
    "G1 X0 Y0 Z5", 
            ], function () { }, "Drawing boxees...");

    }
    confirmdlg("Do you want to coninue?", "Kindly continue only if the printer is at home, the filament has been inserted and the nozzle is hot enough", func)
}
