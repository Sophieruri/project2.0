const express= require("express")
const mysql = require("mysql")
const bcrypt = require('bcrypt');
const session=require("express-session")
const path=require("path")
const multer=require('multer');
const { log, error } = require("console");
const dbconn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'music streaming db',
})



const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")))
app.use(session({
    secret:'yourencryptionkey',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
}))


app.set('view engine','ejs');

app.get("/home",(req,res)=>{
  res.render("home")

})
                    
    app.get("/signup",(req,res)=>{
        res.render("signup")
    })
    
    
    app.post("/signup",(req,res)=>{
     
      dbconn.query(`SELECT Email FROM users WHERE Email="${req.body.email}"`,(err,result)=>{
          if(err){
            console.log(err);
            
              res.status(500).send("server error")
          }else{
              if(result.length>0){
                  res.render("signup",{errorMessage:"Email already in use.Signup"})
              }else{
                  const hashedPassword=bcrypt.hashSync(req.body.password,5);
                  //now store the data--remember hashed pasword and default club
                  dbconn.query(`INSERT INTO users (user_id,username, Email,Password,created_at) VALUES("${req.body.user_id}","${req.body.username}","${req.body.email}","${hashedPassword}",99)`,
                      
                      
                  (error)=>{
                      if(error){ res.status(500).send("Server Error")
                          console.log(error);
                  }else{
                      res.redirect("/signin")
                  }
                  })
              }
          }
      })
     
  })
    app.get("/signin",(req,res)=>{
        res.render("signin.ejs")
    })
  app.post("/signin",(req,res)=>{
    //receive email and password --req.body
    //check if email is registered
    //compare passwords (from req.body and from database--bcrypt.comparesync)
    //if correct--login/create a session --what are sessions (why is http stateless) , what are cookies in web
    console.log(req.body);
    dbconn.query(`SELECT * FROM users WHERE Email= "${req.body.email}"`,(error,user)=>{
        if(error){
            console.log(error);
            res.status(500).send("Server Error")
            
        }else{
            
            if(user.length==0){
                res.render("signin.ejs",{errorMessage:"Email not Registered"})
            }else{

                //compare
                console.log(user);
                console.log(req.body);
                let passwordMatch=bcrypt.compareSync(req.body.password,user[0].password)
                
                if(passwordMatch){
                    req.session.user=user[0]
                    res.render('profile.ejs')
      
            }else{
                res.render("signin",{errorMessage:"Incorrect Password!"})
            }
        }
     }
    })
})
app.get("/logout",(req,res)=>{
    req.session.destroy(err=>{
        /*
        if(err){
            res.status(500).send("Server Error")
        }else{
            res.redirect("/")
        }
    })
})
/*
app.get('/profile', (req, res) => {
    const userData = {
        name: 'Jane Musiclover',
        profilePic: '/images/profile-pic.jpg', // Add an image in the public/images directory
        favoriteArtists: ['Artist 1', 'Artist 2', 'Artist 3'],
        playlists: [
            { name: 'Chill Vibes', trackCount: 25 },
            { name: 'Workout Mix', trackCount: 40 },
            { name: 'Top Hits', trackCount: 50 }
        ],
        recentlyPlayed: [
            { title: 'Song A', artist: 'Artist 1' },
            { title: 'Song B', artist: 'Artist 2' },
            { title: 'Song C', artist: 'Artist 3' }
        ]
    };

    res.render('profile', { user: userData });
});*/
app.get("/profile", (req, res) => {
    const email = req.query.email;  // Use query parameters for the email

    if (!email) {
        return res.status(400).send("Email is required");
    }

    dbconn.query(`SELECT * FROM users WHERE email = ?`, [email], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Server Error");
        } else {
            if (results.length > 0) {
                const user = results[0];
                if (req.query.message) {
                    res.render("profile", { records: user, message: true });
                } else {
                    res.render("profile", { records: user });
                }
            } else {
                res.status(404).send("User not found");
            }
        }
    });
});


app.post('/profile', (req, res) => {

    res.redirect('/profile');
});

// Start the server


app.listen(3000, ()=>console.log("app listening on port 3000"))






})})

