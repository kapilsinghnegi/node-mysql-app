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

app.get("/users", (req, res) => {
  const page = parseInt(req.query.page) || 1; // current page
  const limit = 10; // users per page
  const offset = (page - 1) * limit;

  // Count total users
  db.query("SELECT COUNT(*) AS total FROM user_tb", (err, countResult) => {
    if (err) throw err;

    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch users for the current page
    db.query(
      "SELECT * FROM user_tb ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, users) => {
        if (err) throw err;

        res.render("users", {
          title: "User Management",
          users,
          currentPage: page,
          totalPages,
        });
      }
    );
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
