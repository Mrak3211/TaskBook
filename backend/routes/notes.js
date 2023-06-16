const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// Fetch All Notes
router.get("/allnotes", fetchuser, async (req, res) => {
  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
});

// Create/Add Notes
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter A Valid Title").isLength({ min: 3 }),
    body("description", "Description Must Be Atleast 5 Characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      // Send Validation Errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;
      const note = new Note({
        title: title,
        description: description,
        tag: tag,
        user: req.user._id,
      });
      const savedNotes = await note.save();
      res.json({ savedNotes });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "Failed",
        message: "Internal Server Error",
      });
    }
  }
);

// Update Notes
router.put("/updateNote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // Create NewNote Object
    const newUpdateNote = {};
    if (title) {
      newUpdateNote.title = title;
    }
    if (title) {
      newUpdateNote.description = description;
    }
    if (title) {
      newUpdateNote.tag = tag;
    }
    // Find Note To Update it.
    let note = await Note.findById(req.params.id);
    // console.log("note=====>", note);
    if (!note) {
      res.status(404).json({
        status: "Failed",
        message: "Note Not Found",
      });
    }
    if (note.user.toString() !== req.user._id) {
      return res.status(401).json({
        status: "Failed",
        message: "Note Allowed",
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newUpdateNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
});

// Delete Notes
router.delete("/deleteNote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be delete and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Not Found");
    }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user._id) {
      return res.status(401).send("User Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      status: "Success",
      message: "Note has been deleted",
      DeletedNote: { note },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
