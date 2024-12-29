const BrandDetails = require('../Model/brandDetailsModel'); // Adjust the path as needed


// Controller to add brand details with image upload
const addBrandDetails = async (req, res) => {
  try {
    const {
      name,
      tagline,
      missionStatement,
      coreValues,
      brandLogo, // Base64 string
      brandImages, // Array of Base64 strings
      categories // Array of objects with { image: base64, caption: string }
    } = req.body;

    // Validate required fields
    if (!name || !tagline || !missionStatement || !coreValues || !brandLogo) {
      return res.status(400).json({
        message: 'All required fields must be provided',
        success: false,
      });
    }

    // Process categories
    const processedCategories = Array.isArray(categories)
      ? categories.map((category) => ({
          image: category.image, // Use the Base64 string
          caption: category.caption || 'No Caption Provided', // Provide a default caption if missing
        }))
      : [];

    // Process brand images
    const processedBrandImages = Array.isArray(brandImages)
      ? brandImages.map((image) => ({
          image, // Use the Base64 string
        }))
      : [];

    // Create a new brand details document
    const newBrand = new BrandDetails({
      name,
      tagline,
      missionStatement,
      coreValues,
      brandLogo, // Store the Base64 string
      categories: processedCategories, // Store processed categories
      brandImages: processedBrandImages, // Store processed brand images
    });

    // Save to the database
    const savedBrand = await newBrand.save();

    return res.status(201).json({
      message: 'Brand details added successfully',
      success: true,
      data: savedBrand,
    });
  } catch (error) {
    console.error('Error adding brand details:', error);
    return res.status(500).json({
      message: 'An error occurred while adding brand details',
      success: false,
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  const { brandId, categoryId } = req.params;

  try {
    // Find the brand by ID and remove the category with the matching ID
    const brand = await BrandDetails.findById(brandId);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const categoryIndex = brand.categories.findIndex(
      (category) => category._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Remove the category from the array
    brand.categories.splice(categoryIndex, 1);

    // Save the updated brand document
    await brand.save();

    res.status(200).json({ success: true, message: 'Category deleted successfully', brand });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//Update brand

const updateBrandDetails = async (req, res) => {
  try {
    const { id } = req.params; // ID of the brand to edit
    const {
      name,
      tagline,
      missionStatement,
      coreValues,
      brandLogo,
      brandImages
    } = req.body;
    console.log(req.body);
    
    const updates = {};

    // Update fields if provided in the request body
    if (name) updates.name = name;
    if (tagline) updates.tagline = tagline;
    if (missionStatement) updates.missionStatement = missionStatement;
    if (coreValues) updates.coreValues = coreValues;

    // Process brandLogo string if provided
    if (brandLogo) {
      updates.brandLogo = brandLogo; // Save base64 string or URL
    }

    // Process brandImages if provided
    if (brandImages) {
      updates.brandImages =brandImages; // Map base64 strings or URLs
    }

    // Find the brand by ID and update it
    const updatedBrand = await BrandDetails.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });

    if (!updatedBrand) {
      return res.status(404).json({ message: 'Brand not found', success: false });
    }

    return res.status(200).json({
      message: 'Brand details updated successfully',
      success: true,
      data: updatedBrand
    });

  } catch (error) {
    console.error('Error editing brand details:', error);
    return res.status(500).json({
      message: 'An error occurred while editing brand details',
      success: false,
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  const { brandId, categoryId } = req.params;
  const { caption, image } = req.body;

  try {
    // Find the brand by ID
    const brand = await BrandDetails.findById(brandId);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const categoryIndex = brand.categories.findIndex(
      (category) => category._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Update or delete the category based on request
    if (caption) {
      brand.categories[categoryIndex].caption = caption;
    }

    if (image) {
      brand.categories[categoryIndex].image = image;  // Update image with base64 string or URL
    }

    // Save the updated brand document
    await brand.save();

    res.status(200).json({ success: true, message: 'Category updated successfully', brand });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addCategory = async (req, res) => {
  const { brandId } = req.params;
  const { caption, image } = req.body;

  try {
    // Find the brand by ID
    const brand = await BrandDetails.findById(brandId);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // Create a new category object
    const newCategory = {
      caption: caption || '',
      image: image || null // Base64 string or URL
    };

    // Add the new category to the brand's categories array
    brand.categories.push(newCategory);

    // Save the updated brand document
    await brand.save();

    res.status(201).json({ success: true, message: 'Category added successfully', brand });
  } catch (error) {
    console.error('Error adding new category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Controller to fetch all brand details
const fetchBrandDetails = async (req, res) => {
  try {
    const brands = await BrandDetails.find(); // Fetch brand details from the database.

    if (brands.length === 0) {
      // Static fallback data
      const staticBrands = [
        { _id: '1', name: 'RAK CERAMICS', brandLogo: '/assets/img/BRAND1.jpg' },
        { _id: '2', name: 'ELIE SAAB', brandLogo: '/assets/img/BRAND2.jpg' },
        { _id: '3', name: 'HEIMBERG', brandLogo: '/assets/img/brand33.jpg' },
        { _id: '4', name: 'RAK', brandLogo: '/assets/img/BRAND1.jpg' },
      ];
      return res.status(200).json({staticBrands:staticBrands,static:true});
    }

    // Return database data if available
    return res.status(200).json({brands:brands,static:false});
  } catch (error) {
    console.error('Error fetching brand details:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching brand details',
      success: false,
      error: error.message,
    });
  }
};
// Controller to fetch brand details by ID
const fetchBrandDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Static fallback data
    const staticBrands = [
      { _id: '1', name: 'RAK CERAMICS', brandLogo: '/assets/img/BRAND1.jpg' },
      { _id: '2', name: 'ELIE SAAB', brandLogo: '/assets/img/BRAND2.jpg' },
      { _id: '3', name: 'HEIMBERG', brandLogo: '/assets/img/brand33.jpg' },
      { _id: '4', name: 'RAK', brandLogo: '/assets/img/BRAND1.jpg' },
    ];

    // Validate the ID
    if (!id) {
      return res.status(400).json({ message: "ID is not available", success: false });
    }

    // Attempt to fetch brand details from the database
    const brandDetails = await BrandDetails.findById(id);

    if (!brandDetails) {
      // Check the static fallback data for a match
      const staticBrand = staticBrands.find(brand => brand._id === id);

      if (staticBrand) {
        return res.status(200).json({ brandDetails: staticBrand, success: true });
      }

      return res.status(404).json({ message: "Brand details not found", success: false });
    }

    // Return database data if available
    return res.status(200).json({ brandDetails, success: true });
  } catch (error) {
    console.error('Error fetching brand details by ID:', error);
    return res.status(500).json({
      message: "An error occurred while fetching the brand details",
      success: false,
      error: error.message,
    });
  }
};


// Controller to delete brand details by ID
const deleteBrandDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId format
    if (!id) {
      return res.status(400).json({ message: "ID is not provided", success: false });
    }

    // Find and delete the brand by ID
    const deletedBrand = await BrandDetails.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found", success: false });
    }

    return res.status(200).json({ 
      message: "Brand deleted successfully", 
      success: true, 
      deletedBrand 
    });
  } catch (error) {
    console.error('Error deleting brand details:', error);
    return res.status(500).json({
      message: "An error occurred while deleting the brand details",
      success: false,
      error: error.message,
    });
  }
};


module.exports = {
    addBrandDetails,
    fetchBrandDetails,
    fetchBrandDetailsById,
    deleteBrandDetailsById,
    updateBrandDetails,
    deleteCategory,
    updateCategory,
    addCategory,
};
