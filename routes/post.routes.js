const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const MovieDBService = require('../service/moviedb.service');
const movieDatabase = new MovieDBService();


router.get("/posts/create", isLoggedIn, (req, res, next) => {
    let movieId, tvId;
    if(req.query.movieId) {
        movieId = req.query.movieId;
        User.findById(req.session.currentUser._id)
        .then((dbUser) => {
            if(req.session.lang !== 'es') {
                res.render("posts/en-create", { dbUser, movieId });
              } else {
                res.render("posts/es-create", { dbUser, movieId });
              }
        })
        .catch((err) => console.log(`error while displaying the post: ${err}`));
    } else {
        tvId = req.query.tvId;
        User.findById(req.session.currentUser._id)
        .then((dbUser) => {
            if(req.session.lang !== 'es') {
                res.render("posts/en-create", { dbUser, tvId });
              } else {
                res.render("posts/es-create", { dbUser, tvId });
              }
        })
        .catch((err) => console.log(`error while displaying the post: ${err}`));
    }
});

router.post('/posts/create', isLoggedIn, (req, res, next) => {
    const { title, content, rating } = req.body;
    let movieId, tvId;
    const author = req.session.currentUser._id;

    if(req.query.movieId) {
        movieId = req.query.movieId
        Post.create({ title, content, rating, movieId, author })
        .then(dbPost => {
            return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
        })
        .then(() => {
            if(req.session.lang !== 'es') {
                res.redirect('/en-post-list');
              } else {
                res.redirect('/es-post-list');
              }
            })
            
        .catch(err => {
            throw new Error(`Error while creating the post! ${err}`);
        });
    } else {
        tvId = req.query.tvId
        Post.create({ title, content, rating, tvId, author })
        .then(dbPost => {
            return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
        })
        .then(() => {
            if(req.session.lang !== 'es') {
                res.redirect('/en-post-list');
              } else {
                res.redirect('/es-post-list');
              }
        })
        .catch(err => {
            throw new Error(`Error while creating the post! ${err}`);
        });
    }


});

router.get('/post-list', (req, res, next) => {
    Post.find()
        .populate('author')
        .then(dbPosts => {
            if(req.session.lang !== 'es') {
                res.render('posts/en-post-list', { dbPosts });
              } else {
                res.render('posts/es-post-list', { dbPosts });
              }
        })
        .catch(err => {
            console.log(`Err retrieving posts from database: ${err}`);
            next(err);
        });
});

router.get('/posts/:postId', (req, res, next) => {
    const { postId } = req.params;

    Post.findById(postId)
        .populate('author')
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                model: 'User'
            }
        })
        .then(foundPost => {
        if(foundPost.movieId) {
            movieDatabase.getMovieDetails(foundPost.movieId, req.session.lang)
                .then(movieDetailsObject => {
                    if(req.session.lang !== 'es') {
                        res.render("posts/en-post-detail", { foundPost, movieDetailsObject })
                      } else {
                        res.render("posts/es-post-detail", { foundPost, movieDetailsObject })
                      }
                })
                .catch(error => console.log(error));
        } else {
            movieDatabase.getTvDetails(foundPost.tvId, req.session.lang)
            .then(tvDetailsObject => {
            if(req.session.lang !== 'es') {                
                res.render("posts/en-post-detail", { foundPost, tvDetailsObject })
            } else {
              res.render("posts/es-post-detail", { foundPost, tvDetailsObject })
            }                
            })
            .catch(error => console.log(error));
        }
        })
            // res.render('posts/post-detail', foundPost))
        .catch(err => {
            console.log(`Err retreiving the post from the database: ${err}`);
            next(err);
        });
});

router.get('/posts/:postId/edit', (req, res, next) => {
    const { postId } = req.params;

    Post.findById(postId)
        .then(postToEdit => {
            if(req.session.lang !== 'es') {                
                res.render('posts/en-edit', { post: postToEdit });
            } else {
                res.render('posts/es-edit', { post: postToEdit });
            } 
        })
        .catch(err => next(err));
});

router.post('/posts/:postId/edit', (req, res, next) => {
    const { postId } = req.params;
    const { title, content, rating } = req.body;

    Post.findByIdAndUpdate(postId, { title, content, rating }, { new: true })
        .then(updatePost => {
            if(req.session.lang !== 'es') {                
                res.redirect('/en-post-list', updatePost)
            } else {
                res.redirect('/es-post-list', updatePost)
            }  
        })
        .catch(err => next(err));
});

router.post('/posts/:postId/delete', (req, res, next) => {
    const { postId } = req.params;

    Post.findByIdAndDelete(postId)
        .then(() => {
            if(req.session.lang !== 'es') {                
                res.redirect('/en-post-list')
            } else {
                res.redirect('/es-post-list')
            }             

        })
        .catch(err => next(err));
});

router.get('/posts/author/:userId', (req, res, next) => {
    const { userId } = req.params;
    // const author = req.session.currentUser;
console.log(userId)
    User.findById(userId)
        .populate('posts')
        .then(user => {
            if(req.session.lang !== 'es') {                
                res.render('posts/en-author-posts', { posts: user.posts })
            } else {
                res.render('posts/es-author-posts', { posts: user.posts })
            } 

        })
        .catch(error => console.log(error));
});

module.exports = router;