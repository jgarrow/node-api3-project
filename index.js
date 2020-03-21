// code away!
const express = require("express");
const users = require("./users/userDb");
const posts = require("./posts/postDb");

const server = express();
const port = 5000;
const baseUrl = "/";

const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);

    next();
};

const validateUserId = async (req, res, next) => {
    const { id } = req.params;

    const usersArray = await users.get();
    console.log("usersArray: ", usersArray);
    const userIndex = usersArray.findIndex(user => parseInt(id) === user.id);

    if (userIndex > -1) {
        req.user = usersArray[userIndex];
        next();
    } else {
        res.status(400).json({ errorMessage: "Invalid user id" });
    }
};

const validateUser = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ errorMessage: "Missing user data" });
    } else if (!req.body.name) {
        res.status(400).json({ errorMessage: "Missing required name field" });
    } else {
        next();
    }
};

const validatePost = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ errorMessage: "Missing post data" });
    } else if (!req.body.text) {
        res.status(400).json({ errorMessage: "Missing required text field" });
    } else {
        next();
    }
};

server.use(express.json());
server.use(logger);

server.get("/", (req, res) => {
    users
        .get()
        .then(response => res.status(200).send(response))
        .catch(err =>
            res.status(500).json({ errorMessage: "Error retrieving users" })
        );
});

server.get("/:id", validateUserId, (req, res) => {
    const { id } = req.params;

    users
        .getById(id)
        .then(response =>
            response // response is undefined if no user with the id is found
                ? res.status(200).send(response)
                : res.status(404).json({
                      errorMessage: `User with id ${id} was not found`
                  })
        )
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error retrieving user of id ${id}` })
        );
});

server.get("/:id/posts", validateUserId, (req, res) => {
    const { id } = req.params;

    users
        .getUserPosts(id)
        .then(resp => res.status(200).send(resp))
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error retrieving posts for user ${id}` })
        );
});

server.post("/", validateUser, (req, res) => {
    const newUser = req.body;

    users
        .insert(newUser)
        .then(response => res.status(201).send(response))
        .catch(err =>
            res.status(500).json({ errorMessage: "Error adding new user" })
        );
});

server.post("/:id/posts", validateUserId, validatePost, (req, res) => {
    const { id } = req.params;

    const newPost = { ...req.body, user_id: id };
    console.log("newPost: ", newPost);

    posts
        .insert(newPost)
        .then(resp => res.status(201).send(resp))
        .catch(err => {
            console.log("err: ", err);
            res.status(500).json({ errorMessage: "Error adding post" });
        });
});

server.put("/:id", validateUserId, (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    users
        .update(id, updatedUser)
        .then(response => {
            response === 1
                ? res
                      .status(200)
                      .json(`Successfully updated user with id ${id}`)
                : res.status(404).json({
                      errorMessage: `User with id ${id} does not exist`
                  });
        })
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error updating user with id ${id}` })
        );
});

server.delete("/:id", validateUserId, (req, res) => {
    const { id } = req.params;

    users
        .remove(id)
        .then(response => {
            response === 1
                ? res
                      .status(200)
                      .send(`Successfully deleted user with id ${id}`)
                : res.status(404).json({
                      errorMessage: `User with id ${id} could not be found`
                  });
        })
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error removing user with id ${id}` })
        );
});

server.listen(port, () => console.log(`Server listening on port ${port}`));
