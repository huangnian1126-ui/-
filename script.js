let pwData = JSON.parse(localStorage.getItem("box_pw_data")) || [];
let activeItem = null;
let deleteCounter = 0;
let currentTab = 'home';

// 页面切换
function showPage(id, isBack = false) {
    currentTab = id;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(id + "Page").classList.remove('hidden');
    
    if (id === 'password') {
        // --- 核心修复：进入列表页时清空搜索框 ---
        const searchInput = document.getElementById("pwSearchInput");
        if (searchInput) searchInput.value = ""; 
        renderList(); 
    }
    
    resetDeleteBtn();
    if (!isBack) window.history.pushState({ page: id }, "");
}

// 物理返回键 & 手势拦截
window.onpopstate = function() {
    const modal = document.getElementById("pwModal");
    if (!modal.classList.contains("hidden")) {
        closeModals();
        window.history.pushState({ page: currentTab }, ""); 
        return;
    }
    if (currentTab === 'pwDetail') showPage('password', true);
    else if (currentTab === 'password') showPage('home', true);
};

// 左右滑返回
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
document.addEventListener('touchend', e => {
    if (e.changedTouches[0].screenX - touchStartX > 100) window.history.back();
});

// 全局点击：用于取消删除状态
document.addEventListener('click', (e) => {
    const delBtn = document.getElementById("btnDelPw");
    if (deleteCounter === 1 && e.target !== delBtn) resetDeleteBtn();
});

function resetDeleteBtn() {
    deleteCounter = 0;
    const btn = document.getElementById("btnDelPw");
    if(btn) { btn.innerText = "删除密码"; btn.classList.remove("warning"); }
}

// 删除逻辑
document.getElementById("btnDelPw").onclick = function(e) {
    e.stopPropagation();
    if (deleteCounter === 0) {
        deleteCounter = 1;
        this.innerText = "确定删除";
        this.classList.add("warning");
    } else {
        pwData = pwData.filter(i => i.id !== activeItem.id);
        localStorage.setItem("box_pw_data", JSON.stringify(pwData));
        window.history.back(); 
    }
};

// 列表渲染
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
            renderDetails(item);
            showPage('pwDetail');
        };
        container.appendChild(div);
    });
}

// 详情渲染（按需显示手机和邮箱）
function renderDetails(item) {
    document.getElementById("viewPwTitle").innerText = item.site;
    document.getElementById("viewAcc").innerText = item.acc;
    document.getElementById("viewPass").innerText = item.pass;

    const phoneArea = document.getElementById("detailPhoneArea");
    if (item.phone && item.phone.trim() !== "") {
        document.getElementById("viewPhone").innerText = item.phone;
        phoneArea.classList.remove("hidden");
    } else {
        phoneArea.classList.add("hidden");
    }

    const emailArea = document.getElementById("detailEmailArea");
    if (item.email && item.email.trim() !== "") {
        document.getElementById("viewEmail").innerText = item.email;
        emailArea.classList.remove("hidden");
    } else {
        emailArea.classList.add("hidden");
    }
}

function closeModals() {
    document.getElementById("pwModal").classList.add("hidden");
}

// 保存数据
document.getElementById("btnSavePw").onclick = function() {
    const s = document.getElementById("inPwSite").value.trim();
    const a = document.getElementById("inPwAcc").value.trim();
    const p = document.getElementById("inPwPass").value.trim();
    const ph = document.getElementById("inPwPhone").value.trim();
    const em = document.getElementById("inPwEmail").value.trim();

    if(!s || !a || !p) {
        alert("项目名称、账号和密码为必填项");
        return;
    }

    const newData = { site: s, acc: a, pass: p, phone: ph, email: em };

    if(activeItem) {
        Object.assign(activeItem, newData);
    } else {
        pwData.push({ id: Date.now(), ...newData });
    }
    
    localStorage.setItem("box_pw_data", JSON.stringify(pwData));
    closeModals();
    
    if (currentTab === 'pwDetail') renderDetails(activeItem);
    else showPage('password', true);
};

// 按钮绑定
document.getElementById("btnGoPassword").onclick = () => showPage('password');
document.getElementById("btnBackHome").onclick = () => window.history.back();
document.getElementById("btnBackPwList").onclick = () => window.history.back();
document.getElementById("btnCancelModal").onclick = () => window.history.back();

document.getElementById("btnAddPw").onclick = function() {
    activeItem = null;
    document.getElementById("pwModalTitle").innerText = "添加密码";
    ["inPwSite", "inPwAcc", "inPwPass", "inPwPhone", "inPwEmail"].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.getElementById("pwModal").classList.remove("hidden");
    window.history.pushState({ modal: 'open' }, "");
};

document.getElementById("btnEditPw").onclick = function() {
    document.getElementById("pwModalTitle").innerText = "编辑密码";
    document.getElementById("inPwSite").value = activeItem.site;
    document.getElementById("inPwAcc").value = activeItem.acc;
    document.getElementById("inPwPass").value = activeItem.pass;
    document.getElementById("inPwPhone").value = activeItem.phone || "";
    document.getElementById("inPwEmail").value = activeItem.email || "";
    document.getElementById("pwModal").classList.remove("hidden");
    window.history.pushState({ modal: 'open' }, "");
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

window.onload = () => {
    window.history.replaceState({ page: 'home' }, "");
    showPage('home', true);
};