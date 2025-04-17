'use strict';

// Initialize EmailJS - !!! REPLACE WITH YOUR ACTUAL CREDENTIALS !!!
const EMAILJS_USER_ID = 'nk2_AACji1t_hH3D1';
const EMAILJS_SERVICE_ID = 'service_2iqa2py';
const EMAILJS_TEMPLATE_ID = 'template_91v2ohq';
const YOUR_RECEIVING_EMAIL = 'kgvsaikumar51@gmail.com';

// Check if EmailJS credentials are placeholders
if (EMAILJS_USER_ID === 'YOUR_EMAILJS_USER_ID' || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
    console.warn("EmailJS credentials are placeholders. Contact form will not work until they are replaced in script.js.");
} else {
    try {
        emailjs.init(EMAILJS_USER_ID);
    } catch (error) {
        console.error("Failed to initialize EmailJS. Check User ID (Public Key).", error);
    }
}

// --- DOM Elements ---
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
const sidebarBtnIcon = sidebarBtn ? sidebarBtn.querySelector("ion-icon") : null;

const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");
const mainContent = document.querySelector(".main-content"); // Get main content area

const contactForm = document.getElementById("contactForm");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formMessage = document.getElementById("form-message");

// --- Functions ---

/**
 * Toggles the sidebar visibility (contacts section).
 */
const toggleSidebar = () => {
    if (!sidebar || !sidebarBtn || !sidebarBtnIcon) {
        console.error("Sidebar elements not found for toggle.");
        return;
    }

    const isActive = sidebar.classList.toggle("active"); // Toggle and get new state

    // Change the icon based on the new state
    sidebarBtnIcon.setAttribute('name', isActive ? 'chevron-up' : 'chevron-down');

    console.log("Sidebar toggled. Is active:", isActive); // Debug log
};


/**
 * Switches the currently visible page based on the navigation link clicked.
 * @param {string} pageName - The value of the data-page attribute for the target page.
 */
const switchPage = (pageName) => {
    if (!mainContent) {
        console.error("Main content area not found.");
        return;
    }

    let foundPage = false;
    // Deactivate all pages and activate the target page
    pages.forEach(page => {
        const isTargetPage = page.dataset.page === pageName;
        page.classList.toggle("active", isTargetPage);
        if (isTargetPage) foundPage = true;
    });

    if (!foundPage) {
         console.warn(`Page with data-page="${pageName}" not found.`);
         return; // Don't change nav links if page doesn't exist
    }

    // Deactivate all nav links and activate the target link
    navLinks.forEach(link => {
        link.classList.toggle("active", link.dataset.navLink === pageName);
    });

    // Scroll main content area to top (better than window for layout changes)
    mainContent.scrollTo(0, 0);
    // Or fallback to window scroll if needed:
    // window.scrollTo(0, 0);

    console.log("Switched to page:", pageName); // Debug log
};


/**
 * Handles the contact form submission using EmailJS.
 * @param {Event} e - The form submission event.
 */
const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Basic client-side validation (though 'required' handles most)
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity(); // Show browser validation messages
        return;
    }

    // Check if EmailJS is configured
    if (EMAILJS_USER_ID === 'YOUR_EMAILJS_USER_ID' || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
        console.error("EmailJS is not configured. Cannot send message.");
        if (formMessage) {
            formMessage.textContent = "Contact form is not configured correctly by the site owner.";
            formMessage.className = "form-message error";
            formMessage.style.display = "block";
            setTimeout(() => { formMessage.style.display = "none"; }, 6000);
        }
        return;
    }

    // Show loading state
    if (formBtn) {
        formBtn.disabled = true;
        formBtn.innerHTML = '<ion-icon name="time-outline"></ion-icon><span>Sending...</span>';
    }
    if (formMessage) {
        formMessage.style.display = "none";
        formMessage.className = "form-message";
    }

    try {
        console.log("Sending email via EmailJS...");
        // Ensure the 'to_email' parameter matches how you set it up in your EmailJS template,
        // or remove it if the template handles the destination directly.
        const templateParams = {
            // Include parameters expected by your EmailJS template
            // Example: fullname, email, message are often derived from form input names
            fullname: contactForm.elements.fullname.value,
            email: contactForm.elements.email.value,
            message: contactForm.elements.message.value,
            // Add 'to_email' ONLY if your EmailJS template *requires* it as a parameter
            // to_email: YOUR_RECEIVING_EMAIL
        };

        // Use sendForm if your template directly uses form field names
        // Use send if you pass parameters explicitly
        const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        // OR: const response = await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm);

        console.log('EmailJS SUCCESS!', response.status, response.text);
        if (formMessage) {
            formMessage.textContent = "Message sent successfully! I'll get back to you soon.";
            formMessage.className = "form-message success";
            formMessage.style.display = "block";
        }
        if (contactForm) contactForm.reset();

    } catch (error) {
        console.error("EmailJS FAILED...", error);
        if (formMessage) {
            formMessage.textContent = `Failed to send message. ${error?.text || 'Please try again later or contact me directly.'}`;
            formMessage.className = "form-message error";
            formMessage.style.display = "block";
        }
    } finally {
        // Restore button state
        if (formBtn) {
            formBtn.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span>Send Message</span>';
            // Button stays disabled until next input because form is reset
            formBtn.disabled = true; // Explicitly disable after reset
        }

        // Hide the message after a delay
        if (formMessage) {
            setTimeout(() => {
                formMessage.style.display = "none";
            }, 6000); // Hide after 6 seconds
        }
    }
};

/**
 * Enables/disables the form submit button based on form validity.
 */
const handleFormInput = () => {
    if (contactForm && formBtn) {
        // Disable button if form is invalid
        formBtn.disabled = !contactForm.checkValidity();
    }
};


// --- Event Listeners ---

// Toggle sidebar
if (sidebarBtn) {
    sidebarBtn.addEventListener("click", toggleSidebar);
} else {
    console.warn("Sidebar toggle button ([data-sidebar-btn]) not found.");
}

// Switch pages via navbar links
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const pageName = link.dataset.navLink;
        if (pageName) {
            switchPage(pageName);
        } else {
            console.warn("Navbar link clicked, but data-nav-link attribute is missing or empty.", link);
        }
    });
});

// Handle contact form submission
if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);
} else {
    console.warn("Contact form (#contactForm) not found.");
}

// Add input listeners to form fields for real-time validation feedback
// This enables/disables the submit button as the user types
if (contactForm && formBtn) {
    formInputs.forEach(input => {
        input.addEventListener("input", handleFormInput);
    });
}


// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");

    // Set sidebar initial state based on HTML class and update icon accordingly
    if (sidebar && sidebarBtnIcon) {
        const isInitiallyActive = sidebar.classList.contains("active");
        sidebarBtnIcon.setAttribute('name', isInitiallyActive ? 'chevron-up' : 'chevron-down');
    } else {
        console.warn("Could not set initial sidebar icon state.");
    }

    // Set the initial active page (default to "about")
    switchPage("about");

    // Initial check for form validity to set button state correctly on load
    handleFormInput();

    console.log("Portfolio Initialized.");
});