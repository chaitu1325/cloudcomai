// ===================================================================
// CloudComAI — shared front-end behaviour (demo only, no real backend)
// ===================================================================

(function () {
  const AUTH_KEY = "cloudcomai_demo_session";

  function getSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
    catch (e) { return null; }
  }
  function setSession(data) { localStorage.setItem(AUTH_KEY, JSON.stringify(data)); }
  function clearSession() { localStorage.removeItem(AUTH_KEY); }

  // ---------- Header auth state (index.html) ----------
  function renderHeaderAuthState() {
    const loggedOut = document.getElementById("loggedOutActions");
    const loggedIn = document.getElementById("loggedInActions");
    if (!loggedOut || !loggedIn) return;
    const session = getSession();
    if (session && session.name) {
      loggedOut.classList.add("hidden");
      loggedIn.classList.remove("hidden");
      loggedIn.style.display = "flex";
      document.getElementById("accountName").textContent = session.name;
      document.getElementById("avatarInitial").textContent = session.name.trim().charAt(0).toUpperCase() || "U";
    } else {
      loggedOut.classList.remove("hidden");
      loggedIn.classList.add("hidden");
    }
  }

  function initLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      clearSession();
      renderHeaderAuthState();
      // Send the user back to the homepage top after logging out
      window.location.hash = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Mobile nav ----------
  function initBurger() {
    const burger = document.getElementById("burgerBtn");
    const links = document.getElementById("navLinks");
    if (!burger || !links) return;
    burger.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // ---------- Contact form (demo submit) ----------
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("formNote").style.display = "block";
      form.reset();
    });
  }

  // ---------- Auth page (login.html) ----------
  function initAuthPage() {
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    if (!tabLogin || !tabRegister) return;

    const loginPanel = document.getElementById("loginPanel");
    const registerPanel = document.getElementById("registerPanel");
    const verifyPanel = document.getElementById("verifyPanel");

    function showPanel(which) {
      [loginPanel, registerPanel, verifyPanel].forEach(p => p && p.classList.add("hidden"));
      tabLogin.classList.remove("active");
      tabRegister.classList.remove("active");
      if (which === "login") { loginPanel.classList.remove("hidden"); tabLogin.classList.add("active"); }
      if (which === "register") { registerPanel.classList.remove("hidden"); tabRegister.classList.add("active"); }
      if (which === "verify") { verifyPanel.classList.remove("hidden"); }
    }

    // Deep-link support: login.html?tab=register
    const params = new URLSearchParams(window.location.search);
    showPanel(params.get("tab") === "register" ? "register" : "login");

    tabLogin.addEventListener("click", () => showPanel("login"));
    tabRegister.addEventListener("click", () => showPanel("register"));

    // Forgot password toggle
    const forgotLink = document.getElementById("forgotLink");
    const forgotPanel = document.getElementById("forgotPanel");
    const loginForm = document.getElementById("loginForm");
    if (forgotLink) {
      forgotLink.addEventListener("click", function (e) {
        e.preventDefault();
        loginForm.classList.toggle("hidden");
        forgotPanel.classList.toggle("hidden");
      });
    }
    const sendResetBtn = document.getElementById("sendResetBtn");
    if (sendResetBtn) {
      sendResetBtn.addEventListener("click", function () {
        alert("If an account exists for that email, a password reset link has been sent.");
      });
    }

    // Login submit -> go straight to homepage, logged in
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("liEmail").value || "User";
        const name = email.split("@")[0] || "User";
        setSession({ name: name });
        window.location.href = "index.html";
      });
    }

    // Register submit -> show verify-email step
    const registerForm = document.getElementById("registerForm");
    let pendingName = null;
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        pendingName = document.getElementById("rName").value || "User";
        showPanel("verify");
      });
    }

    // Verify submit -> create session, go to homepage
    const verifyForm = document.getElementById("verifyForm");
    if (verifyForm) {
      verifyForm.addEventListener("submit", function (e) {
        e.preventDefault();
        setSession({ name: pendingName || "User" });
        window.location.href = "index.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHeaderAuthState();
    initLogout();
    initBurger();
    initContactForm();
    initAuthPage();
  });
})();
