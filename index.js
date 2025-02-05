const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const mysql = require("mysql2");
const { faker } = require("@faker-js/faker");


// let getRandomData = () => {
//     return [
//         faker.person.firstName(),
//         faker.lorem.lines(1),
//         faker.lorem.paragraph({ min: 1, max: 3 }),
//         uuidv4()
//     ]
// }

// let data  = [];
// for(let i = 1; i <= 10; i++){
//     data.push(getRandomData());
// }




const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Quora",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// pool.query("INSERT INTO Posts(username, title, content, id) VALUES ?", [data], (err, results) => {
//     if(err) {
//         console.log(err);
//     }
//     console.log(results);
// });


app.use(methodOverride('_method'));

// const data = require('./data.json');
const { get } = require('https');
console.log(typeof data);


app.set("view engiene", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));


// let posts = data.posts;

app.get('/', (req, res) => {
    pool.query("SELECT * FROM posts", (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.render('index.ejs', { posts: results });
    });
});

app.get('/posts', (req, res) => {
    res.render('posts.ejs');
})

app.get('/posts/:id', (req, res) => {
    const { id } = req.params;
    // const post = posts.find(p => p.id === id);
    // res.render('editPost.ejs', { post });

    const q = "SELECT * FROM Posts WHERE id = ?"

    try {
        pool.query(q, [id], (err, results) => {
            if (err) throw err

            if (results.length == 0) {
                return res.status(400).send("Post not found");
            }
            const post = results[0];
            res.render('editPost.ejs', { post });
        })
    } catch (err) {
        return res.status(500).send("Internal Server Error");
    }


});


app.patch('/posts/:id', (req, res) => {
    const id = req.params.id;
    console.log("Updating post with ID:", id);

    const { title, content } = req.body;

    const q3 = "UPDATE Posts SET title = ?, content = ? WHERE id = ?";

    pool.query(q3, [title, content, id], (err, results) => {
        if (err) {
            console.log("Database Error:", err);
            return res.status(500).send("Internal Server Error");
        }

        if (!results) {
            return res.status(500).json({ error: "Unexpected Error: No results returned" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).send("No such Post Found");
        }

        res.redirect("/");
    });
});


app.post("/posts", (req, res) => {
    const { username, title, content } = req.body;
    const newPost = [
        username,
        title,
        content,
        uuidv4()
    ]
    console.log(content);

    const q1 = "INSERT INTO Posts(username, title, content, id) VALUES (?, ?, ?, ?)";

    try {
        pool.query(q1, newPost, (err, results) => {
            if (err) throw err;
            return res.redirect('/');
        })
    } catch (err) {
        return res.status(500).send('Internal Server Error');
    }

    // fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify({ posts }, null, 2), (err) => {
    //     if (err) {
    //         console.log(err);
    //         res.status(500).send("Error saving yout post");
    //         return;
    //     } else {
    //         console.log("Post saved successflly");
    //         res.redirect('/');
    //     }
    // })

})

app.delete('/posts/delete/:id', (req, res) => {
    const { id } = req.params;

    const q4 = "DELETE FROM Posts WHERE id = ?";

    pool.query(q4, [id], (err, results) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if (results.affectedRows == 0) {
            return res.status(404).send("No such post found");
        }
        res.redirect("/");
    })

    // posts = posts.filter(p => p.id !== id);

    // fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify({ posts }, null, 2), (err) => {
    //     if (err) {
    //         console.log(err);
    //         res.status(500).send("Error saving your post");
    //         return;
    //     } else {
    //         console.log("Post deleted successfully");
    //         res.redirect("/");
    //     }
    // });
});



// app.delete('/posts/delete/:id', (req, res) => {
//     const { id } = req.params;
//     console.log("Received DELETE request for ID:", id);

//     // Check posts array before deletion
//     console.log("Posts before deletion:", posts);

//     // Convert id to match type of post.id
//     const parsedId = parseInt(id, 10);
//     if (isNaN(parsedId)) {
//         console.error("Invalid ID format:", id);
//         return res.status(400).json({ error: "Invalid ID" });
//     }

//     // Filter out the post
//     posts = posts.filter(p => p.id !== parsedId);
//     console.log("Posts after deletion:", posts);

//     // Write to data.json
//     const filePath = path.join(__dirname, "data.json");
//     console.log("Writing updated posts to:", filePath);

//     fs.writeFile(filePath, JSON.stringify({ posts }, null, 2), (err) => {
//         if (err) {
//             console.error("File write error:", err);
//             return res.status(500).json({ error: "Failed to save changes" });
//         }
//         console.log("Post deleted successfully");
//         res.status(200).json({ message: "Post deleted successfully" });
//     });
// });


app.listen(port, () => {
    console.log(`listening port on ${port}`);
});
