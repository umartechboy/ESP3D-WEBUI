//alert dialog
function alertdlg(titledlg, textdlg, closefunc, showIcon) {
    if (typeof showIcon === 'undefined')
        showIcon = true;
    var modal = setactiveModal('alertdlg.html', closefunc);
    if (modal == null) return;
    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    var icon = modal.element.getElementsByClassName("modal-icon")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    if(showIcon)
        icon.classList.remove("hide_it")
    else
        icon.classList.add("hide_it")
    showModal();
}