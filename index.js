// code away!
const express = require("express");

const server = express();
const port = 5000;
const users = require("./users/userDb");

const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);

    next();
};

const validateUserId = (req, res, next) => {
    const { id } = req.params;

    next();
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

server.get("/:id", (req, res) => {
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

server.post("/", (req, res) => {
    const newUser = req.body;

    if (!newUser.name) {
        res.status(404).json({ errorMessage: "Please give the user a name" });
    }

    users
        .insert(newUser)
        .then(response => res.status(201).send(response))
        .catch(err =>
            res.status(500).json({ errorMessage: "Error adding new user" })
        );
});

server.put("/:id", (req, res) => {
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

server.delete("/:id", (req, res) => {
    const { id } = req.params;

    users
        .remove(id)
        .then(response => {
            response === 1
                ? res
                      .status(200)
                      .send(`Successfully deleted user with id ${id}`)
                : res
                      .status(404)
                      .json({
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
