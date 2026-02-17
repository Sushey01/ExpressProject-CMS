const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  getContactById,
  updateContact,
  deleteContact
} = require("../controllers/contactController");

const validateToken = require("../middleware/validateTokenHandler");
router.use(validateToken); // it will help us to protect the routes, it will be called before the controllers, it will check if the user is authenticated or not, if the user is authenticated then it will pass the control

router.route("/").get(getContacts).post(createContact); // it will help us to save us some line

// router.route("/").post(createContact);

router
  .route("/:id")
  .put(updateContact)
  .get(getContactById)
  .delete(deleteContact);

// router.route("/:id").get(getContactById);

// router.route("/:id").delete(deleteContact);

module.exports = router;
