const API_URL = "https://6abdf734c4d5ac5483018ba2.mockapi.io/jobs";


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const jobForm = document.getElementById("jobForm");

const jobId = document.getElementById("jobId");
const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const packageInput = document.getElementById("package");
const statusInput = document.getElementById("status");

const jobList = document.getElementById("jobList");
const loading = document.getElementById("loading");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

const totalJobs = document.getElementById("totalJobs");
const interviewJobs = document.getElementById("interviewJobs");
const selectedJobs = document.getElementById("selectedJobs");
const rejectedJobs = document.getElementById("rejectedJobs");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");


// ==========================================
// STORE JOBS
// ==========================================

let jobs = [];


// ==========================================
// LOAD JOBS WHEN PAGE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    getJobs();
});


// ==========================================
// READ - GET ALL JOBS
// ==========================================

async function getJobs() {

    loading.style.display = "block";
    jobList.innerHTML = "";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch jobs");
        }

        jobs = await response.json();

        loading.style.display = "none";

        displayJobs(jobs);
        updateStatistics();

    } catch (error) {

        console.error(error);

        loading.style.display = "none";

        jobList.innerHTML = `
            <div class="empty-message">
                <h3>Unable to load applications</h3>
                <p>Please check your internet connection and try again.</p>
            </div>
        `;
    }
}


// ==========================================
// DISPLAY JOBS
// ==========================================

function displayJobs(jobData) {

    jobList.innerHTML = "";

    if (jobData.length === 0) {

        jobList.innerHTML = `
            <div class="empty-message">
                <h3>No applications found</h3>
                <p>Add a job application to get started.</p>
            </div>
        `;

        return;
    }


    jobData.forEach(job => {

        const card = document.createElement("div");

        card.className = "job-card";


        // Create safe status class
        const statusClass = getStatusClass(job.status);


        card.innerHTML = `
            <div class="job-info">

                <div>
                    <span class="job-label">Company</span>
                    <span class="job-value">${escapeHTML(job.company)}</span>
                </div>

                <div>
                    <span class="job-label">Role</span>
                    <span class="job-value">${escapeHTML(job.role)}</span>
                </div>

                <div>
                    <span class="job-label">Package</span>
                    <span class="job-value">${escapeHTML(job.package)}</span>
                </div>

                <div>
                    <span class="job-label">Status</span>
                    <span class="status ${statusClass}">
                        ${escapeHTML(job.status)}
                    </span>
                </div>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editJob('${job.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteJob('${job.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

        jobList.appendChild(card);
    });
}


// ==========================================
// CREATE + UPDATE
// ==========================================

jobForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const company = companyInput.value.trim();
    const role = roleInput.value.trim();
    const packageValue = packageInput.value.trim();
    const status = statusInput.value;


    // Basic validation

    if (!company || !role || !packageValue || !status) {

        alert("Please fill in all fields.");

        return;
    }


    // Create job object

    const jobData = {
        company: company,
        role: role,
        package: packageValue,
        status: status
    };


    try {

        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";


        // UPDATE

        if (jobId.value) {

            const response = await fetch(
                `${API_URL}/${jobId.value}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(jobData)
                }
            );


            if (!response.ok) {
                throw new Error("Failed to update job");
            }

            alert("Application updated successfully.");

        }

        // CREATE

        else {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(jobData)
                }
            );


            if (!response.ok) {
                throw new Error("Failed to add job");
            }

            alert("Application added successfully.");
        }


        // Reset form

        cancelEdit();

        // Reload data

        await getJobs();


    } catch (error) {

        console.error(error);

        alert("Something went wrong. Please try again.");

    } finally {

        submitBtn.disabled = false;

        submitBtn.textContent = jobId.value
            ? "Update Application"
            : "Add Application";
    }

});


// ==========================================
// EDIT JOB
// ==========================================

function editJob(id) {

    const job = jobs.find(item => item.id == id);


    if (!job) {
        return;
    }


    // Put existing values into form

    jobId.value = job.id;

    companyInput.value = job.company || "";

    roleInput.value = job.role || "";

    packageInput.value = job.package || "";

    statusInput.value = job.status || "";


    // Change form appearance

    formTitle.textContent = "Edit Job Application";

    submitBtn.textContent = "Update Application";

    cancelBtn.style.display = "block";


    // Scroll to form

    document.querySelector(".form-section").scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// CANCEL EDIT
// ==========================================

function cancelEdit() {

    jobForm.reset();

    jobId.value = "";

    formTitle.textContent = "Add Job Application";

    submitBtn.textContent = "Add Application";

    cancelBtn.style.display = "none";
}


// ==========================================
// DELETE JOB
// ==========================================

async function deleteJob(id) {

    const job = jobs.find(item => item.id == id);


    if (!job) {
        return;
    }


    const confirmation = confirm(
        `Are you sure you want to delete the application for ${job.company}?`
    );


    if (!confirmation) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to delete job");
        }

