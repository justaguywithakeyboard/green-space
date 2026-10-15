
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

let trees = loadTrees();

// Sample records make the dashboard interesting on the first visit.
const sampleTrees = [
  {
    id: 1,
    resident: "Rahul",
    species: "Neem",
    location: "Block A",
    date: "2026-10-10"
  },
  {
    id: 2,
    resident: "Priya",
    species: "Mango",
    location: "Block B",
    date: "2026-10-11"
  },
  {
    id: 3,
    resident: "Ananya",
    species: "Banyan",
    location: "Community Park",
    date: "2026-10-12"
  },
  {
    id: 4,
    resident: "Kiran",
    species: "Neem",
    location: "Block A",
    date: "2026-10-13"
  },
  {
    id: 5,
    resident: "Arjun",
    species: "Coconut",
    location: "Block C",
    date: "2026-10-14"
  }
];

// Load saved trees or initialize the sample data.
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

// Initialize sample data only when no saved data exists.
if (trees === null) {
  trees = [
    {
      id: 1,
      resident: "Rahul",
      species: "Neem",
      location: "Block A",
      date: "2026-10-10"
    },
    {
      id: 2,
      resident: "Priya",
      species: "Mango",
      location: "Block B",
      date: "2026-10-11"
    },
    {
      id: 3,
      resident: "Ananya",
      species: "Banyan",
      location: "Community Park",
      date: "2026-10-12"
    },
    {
      id: 4,
      resident: "Kiran",
      species: "Neem",
      location: "Block A",
      date: "2026-10-13"
    },
    {
      id: 5,
      resident: "Arjun",
      species: "Coconut",
      location: "Block C",
      date: "2026-10-14"
    }
  ];

  saveTrees();
}

// Save all tree records to localStorage.
function saveTrees() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  } catch (error) {
    console.error("Could not save trees:", error);
    showMessage("Could not save data in this browser.", true);
  }
}

// Get today's date in local time.
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Use today's date as the default planting date.
dateInput.value = getToday();
dateInput.max = getToday();

// Restore the community target.
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

// Show or hide the custom species field.
speciesInput.addEventListener("change", () => {
  const isOther = speciesInput.value === "Other";

  customSpeciesGroup.hidden = !isOther;
  customSpeciesInput.required = isOther;

  if (!isOther) {
    customSpeciesInput.value = "";
  }
});

// Show or hide the custom location field.
locationInput.addEventListener("change", () => {
  const isOther = locationInput.value === "Other";

  customLocationGroup.hidden = !isOther;
  customLocationInput.required = isOther;

  if (!isOther) {
    customLocationInput.value = "";
  }
});

// Display a message below the registration form.
function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
}

// Add a tree when the form is submitted.
treeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const resident = residentInput.value.trim();

  const species =
    speciesInput.value === "Other"
      ? customSpeciesInput.value.trim()
      : speciesInput.value;

  const location =
    locationInput.value === "Other"
      ? customLocationInput.value.trim()
      : locationInput.value;

  const date = dateInput.value;

  if (!resident || !species || !location || !date) {
    showMessage("Please fill in all the fields.", true);
    return;
  }

  if (date > getToday()) {
    showMessage("Planting date cannot be in the future.", true);
    return;
  }

  // Generate a unique ID for the new record.
  const newTree = {
    id: Date.now() + Math.random(),
    resident,
    species,
    location,
    date
  };

  trees.unshift(newTree);

  saveTrees();

  // Reset the filters so the newly added tree is visible.
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

  // Scroll to the updated tree list.
  document.getElementById("tree-list").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// Build the available filter options from the tree records.
function updateFilters() {
  const selectedSpecies = speciesFilter.value;
  const selectedLocation = locationFilter.value;

  const species = [...new Set(trees.map((tree) => tree.species))]
    .sort((a, b) => a.localeCompare(b));

  const locations = [...new Set(trees.map((tree) => tree.location))]
    .sort((a, b) => a.localeCompare(b));

  // Rebuild the species filter.
  speciesFilter.replaceChildren(new Option("All species", ""));

  species.forEach((name) => {
    speciesFilter.add(new Option(name, name));
  });

  // Rebuild the location filter.
  locationFilter.replaceChildren(new Option("All locations", ""));

  locations.forEach((name) => {
    locationFilter.add(new Option(name, name));
  });

  // Preserve selections when they still exist.
  speciesFilter.value = species.includes(selectedSpecies)
    ? selectedSpecies
    : "";

  locationFilter.value = locations.includes(selectedLocation)
    ? selectedLocation
    : "";
}

// Filter trees using the selected species and location.
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

// Return a suitable emoji for each species.
function getTreeEmoji(species) {
  const emojis = {
    Neem: "🌳",
    Mango: "🥭",
    Banyan: "🌳",
    Peepal: "🌿",
    Coconut: "🌴",
    Gulmohar: "🌺"
  };

  return emojis[species] || "🌱";
}

// Format dates for display.
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

// Create a tree card without inserting user input as HTML.
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

// Render the filtered tree records.
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

// Update the statistics and progress bar.
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

  // Avoid division by zero or an invalid target.
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

// Update all dashboard components.
function updateDashboard() {
  updateFilters();
  updateStatistics();
  renderTrees();
}

// Update the list when a filter changes.
speciesFilter.addEventListener("change", renderTrees);
locationFilter.addEventListener("change", renderTrees);

// Clear both filters.
document.getElementById("clear-filters").addEventListener("click", () => {
  speciesFilter.value = "";
  locationFilter.value = "";

  renderTrees();
});

// Allow the community target to be changed.
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

// Delete a tree using event delegation.
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

// Initial dashboard render.
updateDashboard();
