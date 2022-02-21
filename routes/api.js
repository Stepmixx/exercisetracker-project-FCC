const express = require("express");
const router = express.Router();
const Exercices = require("../models/Exercises");
const Users = require("../models/Users");

//Create user
router.post("/users", async (req, res) => {
  const newUser = new Users({ username: req.body.username });

  newUser.save((err, data) => {
    if (err) {
      if (err.code === 11000) {
        res.json({ message: "this username is taken" });
        return;
      }
      res.json(err);
      return;
    }
    const { username, _id } = data;
    res.json({ username, _id });
  });
});

//Get users
router.get("/users", (req, res) => {
  Users.find()
    .select("_id username")
    .exec((err, users) => (err ? res.json(err) : res.json(users)));
});

//Create exercise
router.post("/users/:userId/exercises", (req, res) => {
  const requestedId = req.params.userId;

  Users.findById(requestedId, async (err, user) => {
    if (err || !user) {
      res.json({ message: "Unknown userId" });
      return;
    }

    const newExercise = new Exercices({
      username: user.username,
      userId: requestedId,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date || Date.now(),
    });

    const { userId, username, description, duration, date } =
      await newExercise.save();

    res.json({
      _id: userId,
      username,
      description,
      duration,
      date: new Date(date).toDateString(),
    });
  });
});

//Get exercises
router.get("/users/:userId/logs", (req, res) => {
  const requestedId = req.params.userId;
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  const limit = Number(req.query.limit);

  if (from > to) {
    res.json({ message: "'from' date is grater than 'to' date" });
  }

  Exercices.find(
    {
      userId: requestedId,
      date: {
        $lte:
          to != "Invalid Date"
            ? to.toISOString()
            : new Date(8640000000000000).toISOString(),
        $gte: from != "Invalid Date" ? from.toISOString() : 0,
      },
    },
    {
      __v: 0,
      _id: 0,
    }
  )
    .limit(limit)
    .sort("-date")
    .exec((err, exercises) => {
      if (err) {
        res.json({ message: err });
        return;
      }

      if (!exercises) {
        res.json({ message: "Unknown userId" });
        return;
      }

      const formatedOutput = {
        _id: requestedId,
        username: exercises[0].username,
        from: from != "Invalid Date" ? from.toDateString() : undefined,
        to: to != "Invalid Date" ? to.toDateString() : undefined,
        limit: limit || undefined,
        count: exercises.length,
        log: exercises.map((exercise) => ({
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString(),
        })),
      };

      res.json(formatedOutput);
    });
});

module.exports = router;
