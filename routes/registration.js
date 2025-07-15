const express = require("express");
const RegistrationController = require("../controllers/registrationController");
const { authenticateToken, authorizeRoles } = require("../middlewares/authMiddlewares");
const router = express.Router();

router.post("/", authenticateToken, authorizeRoles("student"), RegistrationController.registerForEvent);

router.delete("/:id", authenticateToken, authorizeRoles("student"), RegistrationController.cancelRegistration);

// Get student's registrations
router.get("/my-registrations", authenticateToken, authorizeRoles("student"), RegistrationController.getMyRegistrations);

// Get all registrations (admin only)
router.get("/listRegistrations", authenticateToken, authorizeRoles("admin"), RegistrationController.getAllRegistrations);

// Search registrations by date range (admin only)
router.get("/getRegistrationsByDate", authenticateToken, authorizeRoles("admin"), RegistrationController.searchRegistrationsByDate);

// Get registration statistics (admin only)
router.get("/stats", authenticateToken, authorizeRoles("admin"), RegistrationController.getRegistrationStats);

module.exports = router;
