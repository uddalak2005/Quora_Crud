const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');
const{v4: uuidv4} = require('uuid');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));

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

app.get('/posts/:id', (req, res) => {
    const { id } = req.params;
    const post = posts.find(p => p.id === id);
    res.render('editPost.ejs', {post}) ; 
});


app.patch('/posts/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    const {title, content} = req.body;
    const postIndex = posts.findIndex(post => post.id === id);

    if(postIndex === -1){
        res.status(404).send("No such post found");
    }

    posts[postIndex].title = title || posts[postIndex].title;
    posts[postIndex].content = content || posts[postIndex].content;

    fs.writeFile(path.join(__dirname, "data.json"),JSON.stringify({posts}, null, 2), (err) => {
        if(err){
            console.log(err);
            res.status(500).send("Changes not saved");
        }
        else{
            res.redirect('/');
        }
    })

})

app.post("/posts", (req, res) => {
    const { username, title, content } = req.body;
    const newPost = {
        // id: (posts.length > 0 ? (parseInt(posts[posts.length - 1].id + 1)).toString : "0"),
        id: uuidv4(),
        title,
        username,
        content
    }
    console.log(content);

    posts.push(newPost);

    fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify({ posts }, null, 2), (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error saving yout post");
            return;
        } else {
            console.log("Post saved successflly");
            res.redirect('/');
        }
    })

})

app.listen(port, () => {
    console.log(`listening port on ${port}`);
});