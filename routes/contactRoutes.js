const express = require('express');
const router = express.Router();
const { getContacts, createContact, getContactById, updateContact, deleteContact} = require("../controllers/contactController");

router.route("/").get(getContacts).post(createContact); // it will help us to save us some line 

// router.route("/").post(createContact);

router.route("/:id").put(updateContact).get(getContactById).delete(deleteContact);

// router.route("/:id").get(getContactById);

// router.route("/:id").delete(deleteContact);





module.exports = router;