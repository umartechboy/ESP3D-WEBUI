var calibPoint = 0;
var currentZ = 0;
function calibBegin() {
    calibPoint = 1;
    currentZ = 0;
    utilWaitdlg("Preparing for calibration...", "Please wait while I prepare the bed and nozzle for calibration.");
    coms.push("M104 S120");
    coms.push("M109 S110");    
    coms.push("M206 Z0");
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
    coms.push("G91");
    coms.push("G1 Z" + currentZ + " F1000");
    coms.push("G90");
    utilWaitdlg("Calibrating...", "Please wait...");
    function allDoneFB() {
        if (calibPoint > 9) {
            // save the data now
            coms.push("M500");
            coms.push("G1 Z5 F5000");
            coms.push("G1 X0 Y0");
            allDone = function () {
                closeModal('G29 Done and saved');
                calibPoint = 0;
                alertdlg("Done", "I have saved the calibration data, kindly restart your printer.", function () { }, false);
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

function moveZ(dZ) {
    console.log("Move Z" + dZ);
    currentZ += dZ;
    coms.push("G91");
    coms.push("G1 Z" + dZ + " F1000");
    coms.push("G90");
    utilWaitdlg("Moving...", "Please wait...");

    allDone = function allDoneFB() {closeModal("End Move"); };
    processQue();
}
function calibMoveUp() {
    moveZ(0.1);
}
function calibMoveDown() {
    moveZ(-0.1);
}