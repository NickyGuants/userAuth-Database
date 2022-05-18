const express = require( 'express' );
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' )
const { connectDb, connection }= require('./db')

const app = express();

app.use(express.json())

connectDb( connection );

//Get users from the database
app.get('/users', async (req, res) => {
  let users = `select * from users`;
  connection.query(users, (error, results) => {
    if (error) {
      return console.log(error.message);
    }
    res.status(200).send(results);
  });;
  
});

//get a single user from the database
app.get('/users/:user_id', async (req, res) => {
  let id = parseInt(req.params.user_id)
  let user = `select * from users WHERE user_id=${id}`;
  connection.query(user, (error, results) => {
    if (error) {
      return console.log(error.message);
    }
    if (results.length===0) {
      return res.status(406).send("No user with that id exists");
    } else {
      return res.status(200).send(results);
    }
    
  })
})

//Update an existing user in the database
app.put('/users/:user_id', async (req, res) => {
  let id = parseInt(req.params.user_id);
  let updatedUser = `Update users set username=? where user_id=${id}`;
  const { username } = req.body;
  connection.query(updatedUser, username, (error, results) => {
    if (error) {
      return console.log(error.message);
    }
    return res.status(201).send(`User with id ${id} updated sucessfully`);
  })
});

//Delete a user from the database

app.delete('/users/:user_id', async (req, res) => {
  let id = parseInt(req.params.user_id);
  let sql = `Delete from users where user_id=${id}`;
  connection.query(sql, (error, results) => {
    if (error) {
      return console.log(error.message);
    }
    if (!id) {
      return res.send(`No user with id ${id} exists`)
    }
    return res.status(201).send(`User with id ${id} deleted sucessfully`);
  })

})

//signup route
app.post('/users/signup', async (req, res) => {
  try {
    const capsAndNumber = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"
    );
    const numberOfCharacters = new RegExp("^(?=.{8,})");
    const specialCharacters = new RegExp("^(?=.*[!@#$%^&*])");
    const { email, username, password, confirmPassword, first_name, last_name, project } = req.body;


    //ensure the user has entered an email address
    if (!email) {
      res.status(406).send("Fill in your email please.");
    }
    //ensure the user has entered a username
    else if (!username) {
      res.status(406).send("fill in your username");
    }
    //ensure the user has entered a password
    else if (!password) {
      res.status(406).send("fill in your password");
    }
    //ensure the user has confirmed their passoword
    else if (!confirmPassword) {
      res.status(406).send("You must fill in the confirm password field");
    }

    //Check that the password is eight characters long
    else if (!numberOfCharacters.test(password)) {
      res
        .status(406)
        .send(
          "Password must be atleast 8 characters long"
        );
    }
    //Check that the password contain special characters
    else if (!specialCharacters.test(password)) {
      res
        .status(406)
        .send(
          "Password must contain special characters"
        );
    }
    //Check that the password contain small letters, caps, and numbers
    else if (!capsAndNumber.test(password)) {
      res
        .status(406)
        .send(
          "Password must have small letters, caps and numbers  "
        );
    }

    //Check that the password is the same as the confirm password field
    else if (password !== confirmPassword) {
      res.status(406).send("password and Confirm password entries should match.")

      //Use bcrypt to hash the password and add the user to the users array
    } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        let sql = `INSERT INTO users(username,email,password,first_name,last_name,project)VALUES('${username}','${email}','${hashedPassword}','${first_name}','${last_name}','${project}')`;
        
        connection.query(sql);;
     
        res.status(201).send("user added successfully")
    }
    //return any other error
  } catch {
    res.status(500).send()
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let users = `select * from users`;
    connection.query(users, (error, results) => {
      if (error) {
      return console.log(error.message);
      }
      const user = results.find((user) => user.email === email);
      if (!user) {
        return res.status(401).json({ message: "No such user exists" });
      } else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (!result) {
            return res.status(401).json({ message: "wrong password" });
          }
          jwt.sign({ email: user.email, username: user.username, password: user.password }, 'secretkey', (err, token) => {
            return res.status(200).json({
              message: `${user.username} has been logged in successfully`,
              token
            });
          });
        });
      }

   });;
    
  } catch (error) {
    res.status(500).send();
  }
}
)
module.exports = app;