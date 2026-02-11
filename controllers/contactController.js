const asynchandler = require("express-async-handler");


//@desc Get all contacts
//@route GET /api/contacts
//@access public
const getContacts = asynchandler(async (req, res) => {
    res.status(200).json({message: "Get all contacts"});
})


//@desc Create a new contact
//@route POST /api/contacts
//@access public
const createContact =asynchandler(async (req, res) => {
    console.log("The request body is : ", req.body);
    const {name, email, phone} = req.body;
    if (!name || !email || !phone) {
        res.status(400);
        // res.status(400).json({message: "All fields are mandatory"})
        throw new Error("All fields are mandatory");
    }
    res.status(201).json({message: "Create a new contact"});
})

//@desc Get a single contact
//@route GET /api/contacts/:id
//@access public
const getContactById = asynchandler(async(req, res) => {
    res.status(200).json({message: `Get a contact for ${req.params.id}`});
})

//@desc Update a new contact
//@route PUT /api/contacts/:id
//@access public
const updateContact =asynchandler(async (req, res) => {
    res.status(200).json({message: `Update a contact for ${req.params.id}`});
})


//@desc Delete a new contact
//@route DELETE /api/contacts/:id
//@access public
const deleteContact = asynchandler(async(req, res) => {
    res.status(200).json({message: `Delete a contact for ${req.params.id}`});
})


module.exports = {
    getContacts,
    createContact,
    getContactById,
    updateContact,
    deleteContact
}