var coms = [];
var allDone;
var processingQue = false;
var calibListener = CalibSocketResponse;
function processQue() {
    if (processingQue)
        return;
    if (coms.length <= 0)
        return;
    processingQue = true;
    var cmd = coms.shift();
    SendCalibCommand(cmd, function () {
        console.log("que callback");
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
function SendCalibCommand(cmd, fb) {
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
function sendCustomCommands(commands, feedback, msg){
    interceptFeedback = true;
    
    commands.forEach(function (command) {
        coms.push(command);
    });
    calibWaitdlg("Please Wait", msg);
    function allDoneFB() {
        closeModal('custom coms');
        feedback();
        interceptFeedback = false;
    };
    allDone = allDoneFB;
    processQue();
}

function CalibSocketResponse(resp) {
    if (calibPoint <= 0 && !interceptFeedback)
        return;
    console.log("Socket Response: " + resp);
    if (resp.startsWith("ok")) {
        if (typeof feedBack !== 'undefined') {
            console.log("calling fb");
            feedBack(resp);
        }
    } else {
        console.log("Socket Response not OK");
    }
}

//wait dialog
function calibWaitdlg(titledlg, textdlg) {
    var modal = setactiveModal('calibWaitdlg.html');
    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    if (modal == null) return;
    showModal(modal);
}


var calibPoint = 0;
function calibBegin() {
    calibPoint = 1;
    calibWaitdlg("Preparing for calibration...", "Please wait...");
    coms.push("G91");
    coms.push("G1 Z5 F1000");
    coms.push("G90");
    coms.push("G28 X Y");
    coms.push("G28 Z");
    coms.push("G29");
    processQue();

    allDone = function () {
        closeModal();
        // show abort and next button, hide start calib
        document.getElementById("calib_begin_btn").classList.add("hide_it");
        document.getElementById("calib_abort_btn").classList.remove("hide_it");
        document.getElementById("calib_next_btn").classList.remove("hide_it");
        document.getElementById("calib_up_btn").classList.remove("hide_it");
        document.getElementById("calib_down_btn").classList.remove("hide_it");
    }
}
function calibAbort() {
    var modal = setactiveModal("confirmCalibAbortdlg.html");
    if (modal == null) return;
    showModal(modal);
}
function calibCancelled() {
    coms.push("G29 A");
    console.log('G29 Abort called')
    allDone = function () {
        calibPoint = 0;
        console.log('G29 Abort returned')
        alertdlg("Aborted", "Calibration was aborted");
        document.getElementById("calib_begin_btn").classList.remove("hide_it");
        document.getElementById("calib_abort_btn").classList.add("hide_it");
        document.getElementById("calib_next_btn").classList.add("hide_it");
        document.getElementById("calib_up_btn").classList.add("hide_it");
        document.getElementById("calib_down_btn").classList.add("hide_it");
    };
    processQue();
}
function calibNextPoint() {
    console.log("Next Point: " + calibPoint)
    calibPoint++;

    coms.push("G29 W");
    calibWaitdlg("Calibrating...", "Please wait...");
    function allDoneFB() {
        if (calibPoint > 9) {
            // save the data now
            coms.push("M500");
            allDone = function () {
                closeModal('G29 Done and saved');
                calibPoint = 0;
                alertdlg("Done", "I have saved the calibration data, kindly restart your printer.", function(){}, false);
                document.getElementById("calib_begin_btn").classList.remove("hide_it");
                document.getElementById("calib_abort_btn").classList.add("hide_it");
                document.getElementById("calib_next_btn").classList.add("hide_it");
                document.getElementById("calib_up_btn").classList.add("hide_it");
                document.getElementById("calib_down_btn").classList.add("hide_it");
            }
            processQue();
        }
        else {
            closeModal('G29 W');
            console.log("G29 went through. Move to next.");
        }
    };
    allDone = allDoneFB;
    processQue();
}
function calibMoveUp() {
    console.log("Move Up");

}
function calibMoveDown() {
    console.log("Next Down");
}