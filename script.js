let pwData = JSON.parse(localStorage.getItem("box_pw_data")) || [];
let activeItem = null;
let deleteCounter = 0;

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(id + "Page");
    if (target) target.classList.remove('hidden');
    if (id === 'password') renderList();
    resetDeleteBtn();
}

function renderList(filter = "") {
    const container = document.getElementById("pwListContainer");
    container.innerHTML = "";
    const filtered = pwData.filter(i => i.site.toLowerCase().includes(filter.toLowerCase()));
    filtered.forEach(item => {
        const div = document.createElement("div");
        div.className = "pw-card";
        div.innerHTML = `<strong>${item.site}</strong>`;
        div.onclick = () => {
            activeItem = item;
            document.getElementById("viewPwTitle").innerText = item.site;
            document.getElementById("viewAcc").innerText = item.acc;
            document.getElementById("viewPass").innerText = item.pass;
            showPage('pwDetail');
        };
        container.appendChild(div);
    });
}

function resetDeleteBtn() {
    deleteCounter = 0;
    const btn = document.getElementById("btnDelPw");
    if(btn) {
        btn.innerText = "删除密码";
        btn.classList.remove("warning");
    }
}

document.getElementById("btnDelPw").onclick = function() {
    if (deleteCounter === 0) {
        deleteCounter = 1;
        this.innerText = "再次点击确认删除";
        this.classList.add("warning");
        if (navigator.vibrate) navigator.vibrate(60);
    } else {
        pwData = pwData.filter(i => i.id !== activeItem.id);
        localStorage.setItem("box_pw_data", JSON.stringify(pwData));
        showPage('password');
    }
};

function closeModals() {
    document.getElementById("pwModal").classList.add("hidden");
}

document.getElementById("btnSavePw").onclick = function() {
    const s = document.getElementById("inPwSite").value.trim();
    const a = document.getElementById("inPwAcc").value.trim();
    const p = document.getElementById("inPwPass").value.trim();
    if(!s || !a || !p) return;
    if(activeItem) {
        activeItem.site = s; activeItem.acc = a; activeItem.pass = p;
    } else {
        pwData.push({id: Date.now(), site: s, acc: a, pass: p});
    }
    localStorage.setItem("box_pw_data", JSON.stringify(pwData));
    closeModals();
    showPage('password');
};

document.getElementById("btnGoPassword").onclick = () => showPage('password');
document.getElementById("btnBackHome").onclick = () => showPage('home');
document.getElementById("btnBackPwList").onclick = () => showPage('password');
document.getElementById("btnCancelModal").onclick = closeModals;

document.getElementById("btnAddPw").onclick = function() {
    activeItem = null;
    document.getElementById("pwModalTitle").innerText = "添加密码";
    document.getElementById("inPwSite").value = ""; 
    document.getElementById("inPwAcc").value = ""; 
    document.getElementById("inPwPass").value = "";
    document.getElementById("pwModal").classList.remove("hidden");
};

document.getElementById("btnEditPw").onclick = function() {
    document.getElementById("pwModalTitle").innerText = "编辑密码";
    document.getElementById("inPwSite").value = activeItem.site;
    document.getElementById("inPwAcc").value = activeItem.acc;
    document.getElementById("inPwPass").value = activeItem.pass;
    document.getElementById("pwModal").classList.remove("hidden");
};

document.getElementById("pwSearchInput").oninput = (e) => renderList(e.target.value);

function copyText(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const t = document.getElementById("toast");
        t.style.opacity = "1";
        setTimeout(() => t.style.opacity = "0", 1500);
    });
}

window.onload = function() {
    showPage('home');
    closeModals();
};