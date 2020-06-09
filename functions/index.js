const functions = require('firebase-functions');

var admin = require("firebase-admin");

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-crud-restapi-a8904.firebaseio.com"
});

const express = require('express');
const app = express();
const db  = admin.firestore();

const cors = require('cors');
app.use(cors({
    origin : true
}));

//Create
// app.post('/api/create', async (req,res) => {
//     try {
//         const user = req.body;
//         await db.collection('Users').add(user);

//         return res.status(200).send();
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send(error);
//     }
// })


/*
    POST AND GET
*/

//GET user by id 
app.get('/api/read/user/:uid', async (req,res) => {
    try {
    
        var query = db.collection('users');
        var response = [];

        await query.get().then(querySnapshot => {
            var docs = querySnapshot.docs; 

            for ( var doc of docs) {
                if(doc.data().user_id !== req.params.uid) continue;
                const selectedItem = {
                    gender : doc.data().gender,
                    dob : doc.data().date_of_birth,
                    planmasters : doc.data().planmasters,
		             phone : doc.data().phone
                }
                response.push(selectedItem);
            }
            
            return response;

        })

        return res.status(200).send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})
   
//POST User 
app.post('/api/regis', async (req,res) => {
    try {
        const user = req.body;
        await db.collection('users').add(user);

        return res.status(200).send({
            "status" : "success"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

//GET Test
/*app.get('/api/read/:id', async (req,res) => {
    try {
        const document = db.collection('MasterPlans').doc(req.params.id);
        let product = await document.get();
        let response = product.data();

        return res.status(200).send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}) */

//GET All Destinations
app.get('/api/read/destinations', async (req,res) => {
    try {
        
        const snapshot = await db.collection('destinations').get();

        var destinations = [];
        snapshot.forEach((doc) => {
            var id  = doc.id;
            var data = doc.data();

            destinations.push({id,...data});
        })
        
        res.status(200).send(destinations);

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

//POST Destination
app.post('/api/add/destination', async (req,res) => {
    try {
        const destination = req.body;
        await db.collection('destinations').add(destination)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            return res.status(200).send({
                "id" : docRef.id
            })
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})


//GET All cukup berhasil query in query ( Custom )
app.get('/api/read', async (req,res) => {
    try {
        var query = db.collection('users');
        var response = [];

        await query.get().then(querySnapshot => {
            var docs = querySnapshot.docs; 

            for ( var doc of docs) {
                const selectedItem = {
                    id : doc.id,
                    username : doc.data().username,
                    masterpl : doc.data().masterplans[0]
                }
                response.push(selectedItem);
            }
            
            return response;

        })
        const document123 = db.collection('MasterPlans').doc(response[0].masterpl);
        let product = await document123.get();
        let response123 = product.data();
        

        return res.status(200).send(response123);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})  

//GET All PlanMasters ( Jaga" kalo kepake la ya )
app.get('/api/read/planmasters/:uid', async (req,res) => {
    try {
        var query = db.collection('users');
        var planmastersid = [];
        var planmasters = [];

        await query.get().then(querySnapshot => {
            var docs = querySnapshot.docs; 

            for ( var doc of docs) {
                if(doc.data().user_id === req.params.uid) {
                    planmastersid = doc.data().planmasters
                    break;
                }
            }
            return planmastersid;
        })
        
        var query1 = db.collection('planmasters');
        var response = [];

        await query1.get().then(querySnapshot => {
            var docs = querySnapshot.docs; 

            for ( var doc of docs) {
                response.push({
                    "id" : doc.id,
                    ...doc.data()
                });
            }
            
            return response;

        })

        for ( var planmaster of response) {
            for ( id of planmastersid) {
                if (planmaster.id === id) {
                    planmasters.push(planmaster)
                    break;
                }
            }
        }

        return res.status(200).send(planmasters);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}) 

//GET Planmaster ( Show One ) 
app.get('/api/read/planmaster/:id', async (req,res) => {
    try {
        const document = db.collection('planmasters').doc(req.params.id);
        let planmaster = await document.get();
        let response = {
            "id" : req.params.id,
            ...planmaster.data()
        };

        return res.status(200).send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

//POST Planmaster 
app.post('/api/add/planmaster', async (req,res) => {
    try {
        const planmaster = req.body;
        await db.collection('planmasters').add(planmaster)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            return res.status(200).send({
                "id" : docRef.id
            })
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

/*
    UPDATE AND DELETE
*/

//Update User 
app.put('/api/update/user/:uid', async (req,res) => {
    try {
        var query = db.collection('users');
        var id;

        await query.get().then(querySnapshot => {
            var docs = querySnapshot.docs; 

            for ( var doc of docs) {
                if(doc.data().user_id === req.params.uid) {
                    id = doc.id;
                    break;
                }
               
            }
            
            return id;

        })

        await db.collection('users').doc(id).update({
            ...req.body
        })

    
        return res.status(200).send({
            "status" : "success"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

//Update Planmaster
app.put('/api/update/planmaster/:id', async (req,res) => {
    try {
        var query = db.collection('planmasters');
       
        query.doc(req.params.id).update({
            ...req.body
        })

    
        return res.status(200).send({
            "status" : "success"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

//Delete
app.delete('/api/delete/:id', async (req,res) => {
    try {
        const document = db.collection('products').doc(req.params.id);

        await document.delete();

        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

//Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);
