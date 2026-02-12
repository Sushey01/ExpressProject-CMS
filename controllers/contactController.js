const asynchandler = require("express-async-handler");
const Contact = require("../models/contactModel");


//@desc Get all contacts
//@route GET /api/contacts
//@access public
const getContacts = asynchandler(async (req, res) => {
    const contacts = await Contact.find();  //contact is the name of the contactmodel and find is the method to get all the contacts from the database
    res.status(200).json(contacts);
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

    const contact = await Contact.create({
        name,
        email,
        phone
    })
    res.status(201).json(contact);
})

// if there was no destrucuture then we would have to write like this
//  if (!req.body.name || !req.body.email  || !req.body.phone) {
//     res.status(400);
//     throw new Error("All fields are mandatory");
//  }

//  const contact = await Contact.create({
//     name:req.body.name,
//     email:req.body.email,
//     phone:req.body.phone
//  })

//@desc Get a single contact
//@route GET /api/contacts/:id
//@access public
const getContactById = asynchandler(async(req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }
    res.status(200).json(contact);
})

//@desc Update a new contact
//@route PUT /api/contacts/:id
//@access public
const updateContact =asynchandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact) {
        res.status(404);
        throw new Error("Contact not found");

    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true} //to return the updated document instead of the old one
    )
    res.status(200).json(updatedContact);
})


//@desc Delete a new contact
//@route DELETE /api/contacts/:id
//@access public
const deleteContact = asynchandler(async(req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }

    await Contact.remove();
    res.status(200).json(contact);
})


module.exports = {
    getContacts,
    createContact,
    getContactById,
    updateContact,
    deleteContact
}