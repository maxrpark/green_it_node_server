import { RequestHandler } from "express";

const notFound: RequestHandler = (req, res) =>
    res.status(404).send("Route does not exist");

module.exports = notFound;
