
const STORAGE_KEY = "greenspace-trees";
const TARGET_KEY = "greenspace-target";

const treeForm = document.getElementById("tree-form");
const treesContainer = document.getElementById("trees-container");
const emptyState = document.getElementById("empty-state");
const formMessage = document.getElementById("form-message");

const residentInput = document.getElementById("resident-name");
const speciesInput = document.getElementById("tree-species");
const locationInput = document.getElementById("tree-location");
const dateInput = document.getElementById("planting-date");

const customSpeciesGroup = document.getElementById("custom-species-group");
const customSpeciesInput = document.getElementById("custom-species");
const customLocationGroup = document.getElementById("custom-location-group");
const customLocationInput = document.getElementById("custom-location");

const speciesFilter = document.getElementById("filter-species");
const locationFilter = document.getElementById("filter-location");
const targetInput = document.getElementById("target-input");

const sampleTrees = [
    {
        id: 1,
        resident: "Chethan Gowda",
        species: "Neem",
        location: "PESCE",
        date: "2026-10-01"
    },
    {
        id: 2,
        resident: "Priya",
        species: "Mango",
        location: "Park",
        date: "2026-10-02"
    },
    {
        id: 3,
        resident: "Shivaraj",
        species: "Coconut",
        location: "PES Boys Hostel",
        date: "2026-10-06"
    },
    {
        id: 4,
        resident: "Sagar K",
        species: "Jacaranda",
        location: "Central Garden",
        date: "2026-10-04"
    },
    {
        id: 5,
        resident: "Prajwal Gowda",
        species: "Teak",
        location: "PESCE",
        date: "2026-10-05"
    },
    {
        id: 6,
        resident: "Ananya",
        species: "Banyan",
        location: "Park",
        date: "2026-10-03"
    },
    {
        id: 7,
        resident: "Chandan Kumar",
        species: "Ashoka",
        location: "PESCE",
        date: "2026-10-07"
    },
    {
        id: 8,
        resident: "Meghana S.",
        species: "Gulmohar",
        location: "Sports Complex",
        date: "2026-10-08"
    },
    {
        id: 9,
        resident: "Rakshith Raj",
        species: "Bamboo",
        location: "Park",
        date: "2026-10-09"
    },
    {
        id: 10,
        resident: "Keerthana N.",
        species: "Peepal",
        location: "Sports Complex",
        date: "2026-10-10"
    }
];

let trees = loadTrees();


function loadTrees() {
    try {
        const savedTrees = localStorage.getItem(STORAGE_KEY);

        if (savedTrees !== null) {
            const parsedTrees = JSON.parse(savedTrees);

            if (Array.isArray(parsedTrees)) {
                return parsedTrees;
            }
        }
    } catch (error) {
        console.error("Could not load saved trees:", error);
    }

    return null;
}

if (trees === null) {
    trees = [...sampleTrees];
    saveTrees();
}

function saveTrees() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
    } catch (error) {
        console.error("Could not save trees:", error);
        showMessage("Could not save data in this browser.", true);
    }
}

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


dateInput.value = getToday();
dateInput.max = getToday();


try {
    const savedTarget = Number(localStorage.getItem(TARGET_KEY));

    if (
        Number.isInteger(savedTarget) &&
        savedTarget >= 1 &&
        savedTarget <= 1000000
    ) {
        targetInput.value = savedTarget;
    }
} catch (error) {
    console.error("Could not load target:", error);
}

speciesInput.addEventListener("change", () => {
    const isOther = speciesInput.value === "Other";

    customSpeciesGroup.hidden = !isOther;
    customSpeciesInput.required = isOther;

    if (!isOther) {
        customSpeciesInput.value = "";
    }
});

locationInput.addEventListener("change", () => {
    const isOther = locationInput.value === "Other";

    customLocationGroup.hidden = !isOther;
    customLocationInput.required = isOther;

    if (!isOther) {
        customLocationInput.value = "";
    }
});


function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", isError);
}


treeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const resident = residentInput.value.trim();

    let species;
    if (speciesInput.value === "Other") {
        species = customSpeciesInput.value.trim();
    }
    else {
        species = speciesInput.value;
    }

    let location;
    if (locationInput.value === "Other") {
        location = customLocationInput.value.trim();
    }
    else {
        location = locationInput.value;
    }

    const date = dateInput.value;

    if (!resident || !species || !location || !date) {
        showMessage("Please fill in all the fields.", true);
        return;
    }

    if (date > getToday()) {
        showMessage("Planting date cannot be in the future.", true);
        return;
    }

    const newTree = {
        id: Date.now() + Math.random(),
        resident,
        species,
        location,
        date
    };

    trees.unshift(newTree);

    saveTrees();

    speciesFilter.value = "";
    locationFilter.value = "";

    updateDashboard();

    treeForm.reset();
    dateInput.value = getToday();

    customSpeciesGroup.hidden = true;
    customLocationGroup.hidden = true;
    customSpeciesInput.required = false;
    customLocationInput.required = false;

    showMessage(`${species} tree registered successfully!`);


    document.getElementById("tree-list").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


function updateFilters() {
    const selectedSpecies = speciesFilter.value;
    const selectedLocation = locationFilter.value;

    const species = [...new Set(trees.map((tree) => tree.species))]
        .sort((a, b) => a.localeCompare(b));

    const locations = [...new Set(trees.map((tree) => tree.location))]
        .sort((a, b) => a.localeCompare(b));

    speciesFilter.replaceChildren(new Option("All species", ""));

    species.forEach((name) => {
        speciesFilter.add(new Option(name, name));
    });

    locationFilter.replaceChildren(new Option("All locations", ""));

    locations.forEach((name) => {
        locationFilter.add(new Option(name, name));
    });

    speciesFilter.value = species.includes(selectedSpecies)
        ? selectedSpecies
        : "";

    locationFilter.value = locations.includes(selectedLocation)
        ? selectedLocation
        : "";
}

function getFilteredTrees() {
    const selectedSpecies = speciesFilter.value;
    const selectedLocation = locationFilter.value;

    return trees.filter((tree) => {
        const matchesSpecies =
            !selectedSpecies || tree.species === selectedSpecies;

        const matchesLocation =
            !selectedLocation || tree.location === selectedLocation;

        return matchesSpecies && matchesLocation;
    });
}

function getTreeEmoji(species) {
    const emojis = {
        Neem: "🌳",
        Mango: "🥭",
        Banyan: "🌳",
        Peepal: "🌿",
        Coconut: "🌴",
        Gulmohar: "🌺",
        Jacaranda: "🌸",
        Ashoka: "🌲",
        Teak: "🪵",
        Bamboo: "🎋",
        "Frangipani (Champa)": "🌼",
        "Amaltas (Golden Shower)": "✨",
        Bougainvillea: "💐",
        "Moringa (Drumstick)": "🌱",
        "Lemon Tree": "🍋",
        "Tulsi (Holy Basil)": "🪴"
    };

    return emojis[species] || "🌱";
}

function formatDate(date) {
    if (!date) {
        return "Date not available";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function createTreeCard(tree) {
    const card = document.createElement("article");
    card.className = "tree-card";

    const icon = document.createElement("div");
    icon.className = "tree-icon";
    icon.textContent = getTreeEmoji(tree.species);
    icon.setAttribute("aria-hidden", "true");

    const details = document.createElement("div");
    details.className = "tree-details";

    const heading = document.createElement("h3");
    heading.textContent = tree.species;

    const location = document.createElement("p");
    location.textContent = `📍 ${tree.location}`;

    const resident = document.createElement("p");
    resident.textContent = `Planted by ${tree.resident}`;

    const date = document.createElement("div");
    date.className = "tree-meta";
    date.textContent = `Planted on ${formatDate(tree.date)}`;

    details.append(heading, location, resident, date);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "✕";
    deleteButton.title = `Delete ${tree.species} tree`;
    deleteButton.setAttribute(
        "aria-label",
        `Delete ${tree.species} tree planted by ${tree.resident}`
    );
    deleteButton.dataset.id = String(tree.id);

    card.append(icon, details, deleteButton);

    return card;
}

function renderTrees() {
    const filteredTrees = getFilteredTrees();

    treesContainer.replaceChildren();

    filteredTrees.forEach((tree) => {
        treesContainer.appendChild(createTreeCard(tree));
    });

    emptyState.hidden = filteredTrees.length !== 0;

    const count = filteredTrees.length;

    document.getElementById("results-count").textContent =
        `${count} ${count === 1 ? "tree" : "trees"} found`;
}

function updateStatistics() {
    const totalTrees = trees.length;

    const uniqueSpecies = new Set(
        trees.map((tree) => tree.species)
    ).size;

    const uniqueLocations = new Set(
        trees.map((tree) => tree.location)
    ).size;

    document.getElementById("total-trees").textContent = totalTrees;

    document.getElementById("total-species").textContent =
        uniqueSpecies;

    document.getElementById("total-locations").textContent =
        uniqueLocations;

    const target = Number(targetInput.value);
    const validTarget =
        Number.isInteger(target) &&
        target >= 1 &&
        target <= 1000000;

    const effectiveTarget = validTarget ? target : 100;

    const percentage = Math.min(
        (totalTrees / effectiveTarget) * 100,
        100
    );

    document.getElementById("progress-count").textContent =
        `${totalTrees} / ${effectiveTarget}`;

    document.getElementById("progress-percent").textContent =
        `${Math.round(percentage)}%`;

    document.getElementById("progress-fill").style.width =
        `${percentage}%`;

    const progressTrack = document.getElementById("progress-track");

    progressTrack.setAttribute(
        "aria-valuenow",
        String(Math.round(percentage))
    );

    const message = document.getElementById("progress-message");

    if (totalTrees >= effectiveTarget) {
        message.textContent =
            "🎉 Amazing! Our community has reached its planting target!";
    } else if (percentage >= 75) {
        message.textContent =
            "Almost there! Just a few more trees to reach our goal.";
    } else if (percentage >= 40) {
        message.textContent =
            "Great progress! Keep planting and growing together.";
    } else {
        message.textContent =
            "Every tree brings us closer to our goal!";
    }
}

function updateDashboard() {
    updateFilters();
    updateStatistics();
    renderTrees();
}

speciesFilter.addEventListener("change", renderTrees);
locationFilter.addEventListener("change", renderTrees);

document.getElementById("clear-filters").addEventListener("click", () => {
    speciesFilter.value = "";
    locationFilter.value = "";

    renderTrees();
});

targetInput.addEventListener("change", () => {
    const target = Number(targetInput.value);

    if (
        !Number.isInteger(target) ||
        target < 1 ||
        target > 1000000
    ) {
        targetInput.value = 100;
        showMessage("Target must be between 1 and 1,000,000.", true);
    } else {
        showMessage("");
    }

    try {
        localStorage.setItem(TARGET_KEY, targetInput.value);
    } catch (error) {
        console.error("Could not save target:", error);
    }

    updateStatistics();
});

treesContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-button");

    if (!button) {
        return;
    }

    const treeId = Number(button.dataset.id);
    const tree = trees.find((item) => item.id === treeId);

    if (!tree) {
        return;
    }

    const confirmed = window.confirm(
        `Delete the ${tree.species} tree planted by ${tree.resident}?`
    );

    if (!confirmed) {
        return;
    }

    trees = trees.filter((item) => item.id !== treeId);

    saveTrees();
    updateDashboard();

    showMessage(`${tree.species} tree record deleted.`);
});

updateDashboard();
