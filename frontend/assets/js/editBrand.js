(async () => {
    const brandId = window.location.pathname.split("/").pop();
    const fetchUrl = `/api/admin/brand-details/${brandId}`;
    const updateBrandUrl = `/api/admin/update-brand/${brandId}`;
    const updateCategoryUrl = `/api/admin/update-category`;
    const addCategoryUrl = `/api/admin/add-category/${brandId}`;
  
    const form = document.getElementById("brandDetailsForm");
    const categoryContainer = document.getElementById("categoryContainer");
    
    // Track existing brand images
    let existingBrandImages = [];
  
    // Helper function to convert File to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };
  
    // Populate form with initial data
    const populateForm = (data) => {
        document.getElementById("name").value = data.name;
        document.getElementById("tagline").value = data.tagline;
        document.getElementById("missionStatement").value = data.missionStatement;
        document.getElementById("coreValues").value = data.coreValues;
        document.getElementById("brandLogoImage").src = data.brandLogo;
        
        // Store existing brand images
        existingBrandImages = data.brandImages || [];
        
        // Display existing brand images
        const brandImagesContainer = document.getElementById("brandImagesContainer");
        brandImagesContainer.innerHTML = existingBrandImages.map((data, index) => `
            <div class="brand-image-item" data-index="${index}" style="width: 100px;height: 100px; overflow: hidden;border-radius: 5px;margin-top: 10px;position: relative;">
                <img src="${data.image}" style="width: 100%;height: 100%;object-fit: cover;" alt="">
               
            </div>
        `).join('');
  
        // Display categories
        data.categories.forEach((category) => {
            const categoryItem = document.createElement("div");
            categoryItem.classList.add("category-item");
            categoryItem.innerHTML = `
                <input type="file" name="categories" data-category-id="${category._id}" class="form-control mb-2" />
                <input type="text" name="categoryCaption" class="form-control" placeholder="Caption" value="${category.caption}" />
                <div class="brandlogo-image-container" id="brandlogo-image-container">
                    <img src="${category.image}" id="categoryImage" alt="${category.caption}">
                </div>
                <button type="button" class="btn btn-danger mt-2 btn-sm remove-category" data-category-id="${category._id}">Remove</button>
            `;
            categoryContainer.appendChild(categoryItem);
        });
    };

    // Brand Logo Preview Handler
    document.getElementById("brandLogo").addEventListener("change", async function(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                const base64String = await fileToBase64(file);
                document.getElementById("brandLogoImage").src = base64String;
            } catch (error) {
                console.error("Error converting logo to base64:", error);
                alert("Error processing brand logo image");
            }
        }
    });

    // Category Image Preview Handler
    document.addEventListener("change", async function(event) {
        if (event.target.name === "categories" && event.target.type === "file") {
            const file = event.target.files[0];
            if (file) {
                try {
                    const base64String = await fileToBase64(file);
                    const imgContainer = event.target.closest(".category-item").querySelector("img");
                    if (imgContainer) {
                        imgContainer.src = base64String;
                    }
                } catch (error) {
                    console.error("Error converting category image to base64:", error);
                    alert("Error processing category image");
                }
            }
        }
    });
let newImages;
 


  
    const loadingIndicator = document.getElementById("loadingIndicator");
   
    // Fetch and populate brand details with loading indicator
    const fetchBrandDetails = async () => {
        try {
            loadingIndicator.style.display = "block"; // Show the loading indicator
            const response = await fetch(fetchUrl, { method: "GET" });
            const result = await response.json();

            if (result.success) {
                populateForm(result.brandDetails);
            } else {
                alert("Error fetching brand details: " + result.message);
            }
        } catch (error) {
            console.error("Error fetching brand details:", error);
            alert("Error loading brand details");
        } finally {
            loadingIndicator.style.display = "none"; // Hide the loading indicator
        }
    };
    document.getElementById("brandImages").addEventListener("change", async function(event) {
        const files = Array.from(event.target.files);
        const container = document.getElementById("brandImagesContainer");
    
        try {
            // Process new images
            newImages = await Promise.all(files.map(async (file) => ({
                image: await fileToBase64(file)
            })));
    
            // Add new images to existing ones
            existingBrandImages = [ ...newImages];
    
            // Update display
            container.innerHTML = existingBrandImages.map((data, index) => `
                <div class="brand-image-item" data-index="${index}" data-id="${data._id || ''}" style="width: 100px;height: 100px; overflow: hidden;border-radius: 5px;margin-top: 10px;position: relative;">
                    <img src="${data.image}" style="width: 100%;height: 100%;object-fit: cover;" alt="">
                   
                </div>
            `).join('');
        } catch (error) {
            console.error("Error processing brand images:", error);
            alert("Error processing brand images");
        }
    });
    
    // Add new category button handler
    const addCategoryButton = document.getElementById("addCategoryButton");
    addCategoryButton.addEventListener("click", () => {
        const newCategoryInput = document.createElement("div");
        newCategoryInput.classList.add("category-item");
        newCategoryInput.innerHTML = `
            <input type="file" name="categories" class="form-control mb-2" required />
            <input type="text" name="categoryCaption" class="form-control" placeholder="Caption" required />
            <button type="button" class="btn btn-danger mt-2 btn-sm remove-category">Remove</button>
            <button type="button" class="btn btn-success mt-2 btn-sm add-category">Add</button>
        `;
        categoryContainer.appendChild(newCategoryInput);
    });

    // Delete category handler
    const deleteCategory = async (catId) => {
        try {
            const response = await fetch(`/api/admin/delete-category/${brandId}/${catId}`, { 
                method: "DELETE" 
            });
            const result = await response.json();
    
            if (result.success) {
                window.location.reload();
            } else {
                console.error("Error deleting category:", result.message);
                alert("Error deleting category: " + result.message);
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Error deleting category");
        }
    };

    // Add new category handler
    const addNewCategory = async (categoryItem) => {
        const inputFile = categoryItem.querySelector('input[name="categories"]');
        const captionInput = categoryItem.querySelector('input[name="categoryCaption"]');
    
        if (!inputFile.files.length || !captionInput.value.trim()) {
            alert("Please provide both image and caption for the new category");
            return;
        }

        try {
            const imageBase64 = await fileToBase64(inputFile.files[0]);
    
            const response = await fetch(addCategoryUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    caption: captionInput.value.trim(),
                    image: imageBase64
                }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                window.location.reload();
            } else {
                console.error("Error adding new category:", result.message);
                alert("Failed to add category: " + result.message);
            }
        } catch (error) {
            console.error("Error adding new category:", error);
            alert("Error adding new category");
        }
    };

    // Form submission handler
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector("button[type='submit']");
    
        try {
             // Change button text and disable it
        submitButton.textContent = "Updating ...";
        submitButton.disabled = true;
            // Create the data object to match schema
            const updateData = {
                name: document.getElementById("name").value,
                tagline: document.getElementById("tagline").value,
                missionStatement: document.getElementById("missionStatement").value,
                coreValues: document.getElementById("coreValues").value,
                // Ensure brandImages matches the schema structure
                brandImages: newImages
            };
            console.log(updateData);
            
            
            // Handle brand logo
            const brandLogoInput = document.getElementById("brandLogo");
            if (brandLogoInput.files.length > 0) {
                const logoBase64 = await fileToBase64(brandLogoInput.files[0]);
                updateData.brandLogo = logoBase64;
            }

            console.log('Sending update data:', updateData); // Debug log
    
            // Update brand details
            const updateBrandResponse = await fetch(updateBrandUrl, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
    
            const result = await updateBrandResponse.json();
            console.log('Server response:', result); // Debug log
    
            if (result.success) {
                // Update categories
                const categories = Array.from(categoryContainer.children);
                const categoryUpdates = categories.map(async (category) => {
                    const inputFile = category.querySelector('input[name="categories"]');
                    const captionInput = category.querySelector('input[name="categoryCaption"]');
                    const categoryId = inputFile.getAttribute('data-category-id');
    
                    if (!categoryId) return;
    
                    const categoryData = {
                        caption: captionInput.value.trim(),
                    };
    
                    if (inputFile.files.length > 0) {
                        categoryData.image = await fileToBase64(inputFile.files[0]);
                    }
    
                    const updateCategoryResponse = await fetch(`${updateCategoryUrl}/${brandId}/${categoryId}`, {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(categoryData),
                    });
    
                    const categoryResult = await updateCategoryResponse.json();
    
                    if (!categoryResult.success) {
                        throw new Error(`Failed to update category: ${categoryResult.message}`);
                    }
                });
    
                await Promise.all(categoryUpdates);
                alert("Brand and category details updated successfully");
                window.location.href = `/admin/admin-brand-details/${brandId}`;
            } else {
                alert("Error updating brand details: " + result.message);
            }
        } catch (error) {
            console.error("Error updating brand details:", error);
            alert("Error updating brand details: " + error.message);
        }finally {
            // Restore button text and enable it
            submitButton.textContent = "Submit";
            submitButton.disabled = false;
        }
    });

    // Category button click handlers
    document.addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('remove-category')) {
            const catId = e.target.getAttribute('data-category-id');
            if (catId) {
                if (confirm('Are you sure you want to delete this category?')) {
                    await deleteCategory(catId);
                }
            } else {
                e.target.closest('.category-item').remove();
            }
        }
    
        if (e.target && e.target.classList.contains('add-category')) {
            const categoryItem = e.target.closest('.category-item');
            await addNewCategory(categoryItem);
        }
    });

    // Initialize form
    await fetchBrandDetails();
})();