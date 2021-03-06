const express = require("express");
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs'); 
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const jquery = require("jquery");
const rest = require('./getjson')

// const { google } = require('./google')



router.get("/test", (req, res) => {
    res.json({msg: "this is the user route"})
});


router.get("/current", passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ msg: 'Success' });
})

router.get("/",  (req, res) => {
    User.find().then(users => {
        return res.json(users)
    })})


router.post('/register', async (req, res) =>{
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    let registeringUser = await User.findOne({email: req.body.email})
        if (registeringUser) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {

            var answer
            let urlAddress = req.body.address.split(" ").join("+").toLowerCase()

            const options = {
                host: 'maps.googleapis.com',
                port: 443,
                path: `/maps/api/geocode/json?address=${urlAddress}&key=AIzaSyDdPczcBVlfk3Zs1YT-TFQDvm6f4TMfLSA`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            await rest.getJSON(options, async (statusCode, result) => {
                // I could work with the resulting HTML/JSON here. I could also just return it
                // console.log(`onResult: (${statusCode})\n\n${JSON.stringify(result)}`);
                // res.statusCode = statusCode;
                if (result.status !== "ZERO_RESULTS") {
                    answer = await `${result.results[0].geometry.location.lat}, ${result.results[0].geometry.location.lng}`
                    await console.log(answer)
                    // user.update()
                //    await User.update({email: req.body.email}, {$set: { latlong: answer}})
                }
                // res.send(result);
            });

            await console.log(answer)
            setTimeout( async ()=> {
            const newUser =  new User({
                handle: req.body.handle,
                email: req.body.email,
                password: req.body.password,
                age: req.body.age,
                address: req.body.address,
                latlong: answer
            })

            console.log(newUser)

            

            await bcrypt.genSalt(10, (err, salt)=> {
                 bcrypt.hash(newUser.password, salt, (err,hash) => {
                    if (err) throw err; 
                    newUser.password = hash; 
                    newUser.save()
                        .then(user =>  {
                            const payload = {
                                id: user.id,
                                handle: user.handle,
                                // email: user.email
                                address: user.address,
                                latlong: user.latlong  
                            }
                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                { expiresIn: 14400 },
                                (err, token) => {
                                    res.json({
                                        sucess: true,
                                        token: 'Bearer ' + token
                                    });
                                }
                            )
                        })
                        .catch(err => console.log(err))
                })  
            })
            }, 1500)
        }
    })





router.post('/login', async (req, res)=> {

    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }



    
    const email = req.body.email;
    const password = req.body.password;

    var user = await User.findOne({ email })
    if (user.address.length !== 0 && user.latlong.length === 0) {
        let urlAddress = user.address.split(" ").join("+").toLowerCase()

        const options = {
            host: 'maps.googleapis.com',
            port: 443,
            path: `/maps/api/geocode/json?address=${urlAddress}&key=AIzaSyDdPczcBVlfk3Zs1YT-TFQDvm6f4TMfLSA`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        rest.getJSON(options, (statusCode, result) => {
            // I could work with the resulting HTML/JSON here. I could also just return it
            console.log(`onResult: (${statusCode})\n\n${JSON.stringify(result)}`);
            // res.statusCode = statusCode;
            if (result.status !== "ZERO_RESULTS") {
                user.latlong = `${result.results[0].geometry.location.lat}, ${result.results[0].geometry.location.lng}`
                // user.update()
                user.save()
            }
            // res.send(result);
            console.log(user)
        });
    };


    await User.findOne({email})
        .then(user => {
            if (!user){
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch){
                        const payload={
                            id: user.id,
                            handle: user.handle,
                            address: user.address,
                            latlong: user.latlong   

                            // email: user.email
                        }
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token,
                                });
                            }
                        )           

                    } else {
                        errors.password = 'Incorrect password'
                        return res.status(400).json(errors);
                    }
                    
                }).catch(err => console.log(err))
                               


            // console.log("YOU MADE IT IN")
            // console.log(user)
         
            //     console.log(user.address)
            //     jquery.ajax({
            //         url: `https://maps.googleapis.com/maps/api/geocode/json?address=${urlAddress}&key=${google}`
            //     })
            //     // ).then(
            //     //     user.save(), user.save()
            //     // ).catch(
            //     //     err => console.log(err)
            //     // )
            // }         


        })


    
   
   



})


exports.re

module.exports = router;