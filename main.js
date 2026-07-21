/* Rosengrund Immobilienmanagement – Onepage Interaktionen */
(function () {
  "use strict";

  /* ---- Jahreszahl im Footer ---- */
  document.querySelectorAll("[data-jahr]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Header: Schatten/Deckkraft beim Scrollen ---- */
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobilmenü ---- */
  var toggle = document.getElementById("navToggle");
  var list = document.getElementById("navList");
  if (toggle && list) {
    var closeMenu = function () {
      list.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = list.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    list.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---- Scroll-Reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Kontaktformular ----
     Standard: öffnet das E-Mail-Programm (mailto). Kein Server nötig.
     Für echten Versand: dem <form> ein data-endpoint="https://..." geben,
     dann wird per fetch() gesendet. */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var MAIL_TO = "info@rosengrund.de"; // <-- echte Adresse eintragen

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.className = "form-note";
      note.textContent = "";

      // Honeypot: Bots füllen dieses Feld
      if (form.website && form.website.value) return;

      if (!form.checkValidity()) {
        note.classList.add("err");
        note.textContent = "Bitte füllen Sie die Pflichtfelder aus.";
        form.reportValidity();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim()
      };

      var endpoint = form.getAttribute("data-endpoint");

      if (endpoint) {
        // Echter Versand (z. B. Formspree / Web3Forms)
        note.textContent = "Wird gesendet …";
        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (r) {
            if (!r.ok) throw new Error("Fehler");
            form.reset();
            note.classList.add("ok");
            note.textContent = "Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns zeitnah.";
          })
          .catch(function () {
            note.classList.add("err");
            note.textContent = "Senden fehlgeschlagen. Bitte schreiben Sie an " + MAIL_TO + ".";
          });
      } else {
        // Fallback: mailto
        var body =
          "Name: " + data.name + "\n" +
          "E-Mail: " + data.email + "\n" +
          "Telefon: " + data.phone + "\n" +
          "Anliegen: " + data.subject + "\n\n" +
          data.message;
        var href =
          "mailto:" + MAIL_TO +
          "?subject=" + encodeURIComponent("Anfrage: " + data.subject) +
          "&body=" + encodeURIComponent(body);
        window.location.href = href;
        note.classList.add("ok");
        note.textContent = "Ihr E-Mail-Programm öffnet sich. Falls nicht, schreiben Sie an " + MAIL_TO + ".";
      }
    });
  }
})();
