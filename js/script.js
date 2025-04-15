import { getALlElements, deleteElementById, createElement, updateElement } from "./service.js";

// Add a mapping between display categories and API categories
const categoryMapping = {
    pizza: 'pizza',
    papadias: 'papadias',
    salat: 'salat',
    pasta: 'pasta',
    souses: 'souses',
    drinks: 'icki',        // Map 'drinks' display category to 'icki' API endpoint
    desserts: 'desertlar'  // Map 'desserts' display category to 'desertlar' API endpoint
};

// Reverse mapping for converting API categories to display categories
const reverseMapping = {};
Object.keys(categoryMapping).forEach(displayCategory => {
    reverseMapping[categoryMapping[displayCategory]] = displayCategory;
});

// Category data storage
let categoryData = {
    pizza: [],
    papadias: [],
    salat: [],
    pasta: [],
    souses: [],
    drinks: [],
    desserts: []
};

// Current active category
let currentCategory = 'pizza';

// Load initial data for all categories
async function loadAllCategoryData() {
    try {
        // Load data for all categories in parallel, using the mapping
        const [pizzaData, papadiasData, salatData, pastaData, sousesData, drinksData, dessertsData] = await Promise.all([
            getALlElements(categoryMapping.pizza),
            getALlElements(categoryMapping.papadias),
            getALlElements(categoryMapping.salat),
            getALlElements(categoryMapping.pasta),
            getALlElements(categoryMapping.souses),
            getALlElements(categoryMapping.drinks),    // This will fetch from 'icki'
            getALlElements(categoryMapping.desserts)   // This will fetch from 'desertlar'
        ]);
        
        // Store data for each category
        categoryData.pizza = pizzaData || [];
        categoryData.papadias = papadiasData || [];
        categoryData.salat = salatData || [];
        categoryData.pasta = pastaData || [];
        categoryData.souses = sousesData || [];
        categoryData.drinks = drinksData || [];
        categoryData.desserts = dessertsData || [];
        
        console.log("All category data loaded:", categoryData);
        
        // Display all categories initially
        showCategory('all');
    } catch (error) {
        console.error("Error loading category data:", error);
    }
}

// Initialize the page
loadAllCategoryData();

// Function to create a card for an item
function createCardHTML(item, category) {
    // Handle different property names based on category
    const title = item.title || item.name || '';
    const description = item.composition || item.description || '';
    
    return `<div class="card" style="width: 18rem; height: 28rem; border: none; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 10px; overflow: hidden; background-color: #f5e8dc;">
        <img class="card-img-top" src="${item.img}" alt="${title}" style="height: 200px; object-fit: cover;">
        <div class="card-body" style="padding: 20px; text-align: center;">
            <h5 class="card-title" style="font-family: 'Arial', sans-serif; font-weight: 700; color: #333; margin-bottom: 10px;">${title}</h5>
            <p class="card-text" style="font-family: 'Arial', sans-serif; font-weight: 500; color: #555; margin-bottom: 15px;">${description}</p>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button onclick="handleDelete(event, '${item.id}', '${category}')" class="btn" style="background-color: crimson; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Delete</button>
                <button onclick="handleEdit('${item.id}', '${category}')" class="btn" style="background-color: #5a9b70; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Edit</button>
            </div>
        </div>
    </div>`;
}

// Display a specific category's items
function displayCategoryItems(category, data) {
    // Determine the target container based on category
    let containerSelector;
    
    if (category === 'pizza' || category === 'papadias') {
        containerSelector = '#cards';
    } else {
        containerSelector = `#${category}-cards`;
    }
    
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        console.error(`Container not found for category: ${category}`);
        return;
    }
    
    // Clear and populate the container
    container.innerHTML = '';
    data.forEach(item => {
        container.innerHTML += createCardHTML(item, category);
    });
}

// Show a specific category or all categories
function showCategory(categoryName) {
    // Update the current category
    currentCategory = categoryName === 'all' ? 'pizza' : categoryName;
    
    // Hide all containers first
    document.querySelectorAll('#cards, #salat-cards, #pasta-cards, #souses-cards, #drinks-cards, #desserts-cards')
        .forEach(container => {
            container.style.display = 'none';
        });
    
    // Show and populate the appropriate containers based on category
    if (categoryName === 'all') {
        // Show all categories
        document.querySelector('#cards').style.display = 'flex';
        document.querySelector('#salat-cards').style.display = 'flex';
        document.querySelector('#pasta-cards').style.display = 'flex';
        document.querySelector('#souses-cards').style.display = 'flex';
        document.querySelector('#drinks-cards').style.display = 'flex';
        document.querySelector('#desserts-cards').style.display = 'flex';
        
        // Display items for each category
        displayCategoryItems('pizza', categoryData.pizza);
        displayCategoryItems('papadias', categoryData.papadias);
        displayCategoryItems('salat', categoryData.salat);
        displayCategoryItems('pasta', categoryData.pasta);
        displayCategoryItems('souses', categoryData.souses);
        displayCategoryItems('drinks', categoryData.drinks);
        displayCategoryItems('desserts', categoryData.desserts);
    } else if (categoryName === 'pizza' || categoryName === 'papadias') {
        // Pizza and Papadias share the same container
        document.querySelector('#cards').style.display = 'flex';
        displayCategoryItems(categoryName, categoryData[categoryName]);
    } else {
        // Other categories have their own containers
        const containerSelector = `#${categoryName}-cards`;
        document.querySelector(containerSelector).style.display = 'flex';
        displayCategoryItems(categoryName, categoryData[categoryName]);
    }
    
    // Update active button state
    document.querySelectorAll('.categories div').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.${categoryName}`).classList.add('active');
}

// Handle delete operation for any category
function handleDelete(event, id, category) {
    event.preventDefault();
    
    // Determine category if not provided
    if (!category) {
        category = currentCategory;
    }
    
    // Use the mapped category name for the API call
    const apiCategory = categoryMapping[category] || category;
    
    deleteElementById(apiCategory, id).then(() => {
        // Refresh the specific category data
        getALlElements(apiCategory).then(data => {
            categoryData[category] = data || [];
            
            // Redisplay the current view
            if (document.querySelector('.all').classList.contains('active')) {
                showCategory('all');
            } else {
                showCategory(category);
            }
        });
    });
}

// Reference to input fields
const inps = document.querySelectorAll('#inps input');

// Get input values from the form
function getInpValues() {
    let category = inps[2].value || currentCategory;
    
    return {
        name: inps[0].value,
        img: inps[1].value,
        category: category,
        composition: inps[3].value,
        price: inps[4].value
    };
}

// Create a new item
function createPost() {
    const newItem = getInpValues();
    const displayCategory = newItem.category.toLowerCase();
    
    // Map the display category to the API category
    const apiCategory = categoryMapping[displayCategory] || displayCategory;
    
    createElement(apiCategory, newItem).then(() => {
        // Clear form inputs
        inps.forEach(inp => inp.value = '');
        
        // Refresh the specific category data
        getALlElements(apiCategory).then(data => {
            categoryData[displayCategory] = data || [];
            
            // Redisplay the current view
            if (document.querySelector('.all').classList.contains('active')) {
                showCategory('all');
            } else {
                showCategory(displayCategory);
            }
        });
        
        // Hide the input section after creation
        document.getElementById('section-inps').style.display = 'none';
    });
}

// ID for item being edited
let globId;
let editCategory;

// Edit an item
function handleEdit(id, category) {
    // Show the input section
    document.getElementById('section-inps').style.display = 'block';
    
    // Set the item ID and category for update
    globId = id;
    editCategory = category || currentCategory;
    
    // Find the item to edit
    const item = categoryData[editCategory].find(item => item.id == id);
    if (!item) {
        console.error(`Item with ID ${id} not found in category ${editCategory}`);
        return;
    }
    
    // Fill form with item data
    inps[0].value = item.name || item.title || '';
    inps[1].value = item.img || '';
    inps[2].value = editCategory;
    inps[3].value = item.composition || item.description || '';
    inps[4].value = item.price || '';
    
    // Scroll to form
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Update an item
function updatePost() {
    const updatedObj = getInpValues();
    const displayCategory = editCategory || currentCategory;
    
    // Map the display category to the API category
    const apiCategory = categoryMapping[displayCategory] || displayCategory;
    
    updateElement(apiCategory, globId, updatedObj).then(() => {
        // Clear form inputs
        inps.forEach(inp => inp.value = '');
        
        // Reset edit tracking
        globId = null;
        editCategory = null;
        
        // Hide the input section after update
        document.getElementById('section-inps').style.display = 'none';
        
        // Refresh the specific category data
        getALlElements(apiCategory).then(data => {
            categoryData[displayCategory] = data || [];
            
            // Redisplay the current view
            if (document.querySelector('.all').classList.contains('active')) {
                showCategory('all');
            } else {
                showCategory(displayCategory);
            }
        });
    });
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide the input section initially
    const inputSection = document.getElementById('section-inps');
    if (inputSection) {
        inputSection.style.display = 'none';
    }
    
    // Add click handlers to category buttons
    const categoryButtons = document.querySelectorAll('.categories div');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Extract the category name from the class (handle multiple classes)
            const classList = this.classList;
            let categoryName = '';
            
            // Find the class that matches a category name
            ['all', 'pizza', 'papadias', 'salat', 'pasta', 'souses', 'drinks', 'desserts'].forEach(category => {
                if (classList.contains(category)) {
                    categoryName = category;
                }
            });
            
            if (!categoryName) {
                categoryName = this.className.toLowerCase();
            }
            
            // Show the selected category
            showCategory(categoryName);
        });
    });
    
    // Set "All" as the default active category
    const allButton = document.querySelector('.categories .all');
    if (allButton) {
        allButton.classList.add('active');
    }
    
    // Add CSS for flex display on card containers
    const style = document.createElement('style');
    style.textContent = `
        #cards, #salat-cards, #pasta-cards, #souses-cards, #drinks-cards, #desserts-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            margin-top: 20px;
        }
        .categories div {
            cursor: pointer;
            padding: 8px 16px;
            border-radius: 4px;
        }
        .categories div.active {
            background-color: #e53935;
            color: white;
        }
        /* Create new pizza button styling */
        #add-new-pizza {
            background-color: #5a9b70;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 20px auto;
            display: block;
        }
    `;
    document.head.appendChild(style);
    
    // Add a "Create New Pizza" button
    const addButton = document.createElement('button');
    addButton.id = 'add-new-pizza';
    addButton.textContent = 'Create New Pizza';
    addButton.addEventListener('click', function() {
        // Clear form inputs
        inps.forEach(inp => inp.value = '');
        // Show the input section
        document.getElementById('section-inps').style.display = 'block';
        // Scroll to form
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Insert the button after the categories
    const categoriesDiv = document.querySelector('.categories');
    if (categoriesDiv) {
        categoriesDiv.parentNode.insertBefore(addButton, categoriesDiv.nextSibling);
    }
});

// Add navbar items from API
async function addNavbarItems() {
    try {
        const res = await fetch("http://localhost:3000/category"); 
        if (!res.ok) {
            throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const categories = await res.json();
        const navbar = document.querySelector("#nav_bar_items");

        // Check if navbar element exists
        if (!navbar) {
            console.warn('Navbar element #nav_bar_items not found');
            return;
        }

        // Dynamically add navbar items
        categories.forEach((category) => {
            const navItem = document.createElement("a");
            navItem.href = `#${category.slug}`; 
            navItem.textContent = category.category; 
            navbar.appendChild(navItem);
        });
    } catch (error) {
        console.error("Error adding navbar items:", error.message);
    }
}

addNavbarItems();

window.handleDelete = handleDelete;
window.handleEdit = handleEdit;
window.createPost = createPost;
window.updatePost = updatePost;
window.showCategory = showCategory;


function cancelEdit() {
    // Clear the form inputs
    const inps = document.querySelectorAll('#inps input');
    inps.forEach(inp => inp.value = '');
    
    // Hide the input section
    document.getElementById('section-inps').style.display = 'none';
    
    // Reset editing state
    globId = null;
    editCategory = null;
}

// Don't forget to expose this function to the window
window.cancelEdit = cancelEdit;