import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import db from "./db.js";
import logger from "./logger.js";
import expressEjsLayouts from "express-ejs-layouts";

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "layout");
app.use(express.static("public"));

app.get("/", (_, res) => {
  logger.info("Counting users");
  db.query("SELECT COUNT(*) AS total FROM user_tb", (err, results) => {
    if (err) {
      logger.error("Error counting users:", err);
      throw err;
    }

    const totalUsers = results[0].total;
    res.render("home", { title: "Dashboard", totalUsers });
  });
});

app.get("/users", (_, res) => {
  logger.info("Getting data from the database");
  db.query("SELECT * FROM user_tb", (err, results) => {
    logger.info("Data:", results);
    if (err) {
      logger.error("Error getting data from the database:", err);
      throw err;
    }
    res.render("users", { users: results, title: "All Users" });
  });
});

app.get("/add", (_, res) => {
  logger.info("Adding user");
  return res.render("add-user", { title: "Add user" });
});

app.post("/add", (req, res) => {
  const { name, email } = req.body;
  logger.info("Adding user: ", [name, email]);
  db.query(
    "INSERT INTO user_tb (name, email) VALUES (?, ?)",
    [name, email],
    (err) => {
      if (err) {
        logger.error("Error adding user:", err);
        throw err;
      }
      logger.info("Added user");
      res.redirect("/");
    }
  );
});

app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  logger.info("Fetching user:", userId);

  db.query("SELECT * FROM user_tb WHERE id = ?", [userId], (err, results) => {
    if (err) {
      logger.error("Error fetching user:", err);
      throw err;
    }
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }
    res.render("user-details", { title: "User Details", user: results[0] });
  });
});

app.get("/user/:id/edit", (req, res) => {
  const userId = req.params.id;

  db.query("SELECT * FROM user_tb WHERE id = ?", [userId], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    res.render("edit-user", {
      title: "Edit User",
      user: results[0],
    });
  });
});

app.post("/user/:id/edit", (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  logger.info("Editting user:", userId);

  db.query(
    "UPDATE user_tb SET name = ?, email = ? WHERE id = ?",
    [name, email, userId],
    (err) => {
      if (err) throw err;
      res.redirect("/user/" + userId);
    }
  );
});

app.post("/delete/:id", (req, res) => {
  console.log("Deleting user:", req.params.id);
  db.query("DELETE FROM user_tb WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      logger.error("Error deleting: ", err);
      throw err;
    }
    logger.info("Deleted user");
    res.redirect("/");
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  logger.info(`Server running on http://localhost:${port}`)
);
