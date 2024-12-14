const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');

const data = require('./data.json');
console.log(typeof data);


app.set("view engiene", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));


const posts = data.posts;

app.get('/', (req, res) => {
    res.render('index.ejs', { posts: posts });
});

app.get('/posts', (req, res) => {
    res.render('posts.ejs');
})

app.post("/posts", (req, res) => {
    const { username, title, content } = req.body;
    const newPost = {
        id: (posts.length > 0 ? (parseInt(posts[posts.length - 1].id + 1)).toString : "0"),
        title,
        username,
        content
    }
    console.log(content);

    posts.push(newPost);

    fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify({ posts }, null, 2), (err) => {
        if(err){
            console.log(err);
            res.status(500).send("Error saving yout post");
            return;
        }else{
            console.log("Post saved successflly");
            res.redirect('/');
        }
    })

})

app.listen(port, () => {
    console.log(`listening port on ${port}`);
});