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
        .then(response => {
            console.log("response: ", response);

            if (response) {
                res.status(200).send(response);
            } else {
                res.status(404).json({
                    errorMessage: `User with id ${id} was not found`
                });
            }
        })
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error retrieving user of id ${id}` })
        );
});

server.listen(port, () => console.log(`Server listening on port ${port}`));
