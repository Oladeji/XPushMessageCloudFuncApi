import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
//import { promises } from 'dns';
admin.initializeApp()
//const cors = require('cors')({origin: true});
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
//recursive 
// export const OngetPatient =
// functions.firestore.document("Patients/{id}").onCreate( async (snap,context)=>{
//     //const id : string =snap.data().id
//     const Name : string =snap.data().Name
//     const School : string =snap.data().School
//   //  await admin.firestore().doc(`Patients/${id}`).set
//      await admin.firestore().collection("Patients").add
//         ({
//             Name : Name,
//             School:School
//         });
    
//    console.log(Name,School)
//    return  ({
//             Name : Name,
//             School:School
//         })
//    })


// async function   GetToken( PatientNo :any ,HospitalId:any)
// {
//   const tokens: FirebaseFirestore.DocumentData [] =[]
//   return await admin.firestore().collection('RegisteredDevices')
//                  .where("PatientNo",'==',PatientNo)
//                  .where("HospitalId",'==',HospitalId)
//                  .get().then(        
//                    snapshot => {
//                                   snapshot.docs.forEach(device => {
//                                       //const appObj = { devices: device.data() }
//                                       //tokens.push(appObj)
//                                       tokens.push(device.data())
//                                     })

//                           return tokens
//                           }                   
//                         ) .catch(err=>{console.log(err);
//                         // res.status(500).send(err) 
//                          return ({id: err});
//                          })


// }
 async function   GetToken( PatientNo :any ,HospitalId:any):Promise< FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>
{
  //var    data : FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
    return  await  admin.firestore().collection('RegisteredDevices')
                 .where("PatientNo",'==',PatientNo)
                 .where("HospitalId",'==',HospitalId)
                 .get().then( p=> {return p});//.catch (err=>{console.log(err)});
     
}

// async  function   GetTokenold( PatientNo :any ,HospitalId:any): FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
// {
//   var    data : Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>;
//    var    data2 : FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
//     data2 =  await  admin.firestore().collection('RegisteredDevices')
//                  .where("PatientNo",'==',PatientNo)
//                  .where("HospitalId",'==',HospitalId)
//                  .get().then( p=> {return  p});//.catch (err=>{console.log(err)});
//   // data.then( x =>{data2=x;})
//    return data2;
// }

export const OnMessagePatientSendFCM =
functions.firestore.document("PatientsMessages/{id}").onCreate( async (snap,context)=>{
   
    //const token='ckL3wD_t8ekq9GQCVrzlPo:APA91bEytK7392MJeOwK5xsfI-BDl3AqoRydcDR5J6axyZFC_ownIr15pKyE0jtQTd9ilSpfa30cFpZb4abT1P0LzHJX4zRnx3fbF2LIGmbyR2LNtLZIZItjEJfXqxUtfFo3-2sRmEQZ'
    // take the PatientNo and HospitaiId and get the device id and get the token from there
 // const tokens:{ devices: FirebaseFirestore.DocumentData }[] =[]
return  await GetToken(snap.data().PatientNo,snap.data().HospitalId).then ( (devicearray) =>
   {   const AllPromises:  Promise<string>[]= []
       let res =''
       devicearray.docs.forEach(Patient => {
                               res = res +' : '+Patient.id
                  const mesage ={   
                               
                                notification: {title:snap.data().title,
                                body: snap.data().body,
                               // link:  'www.google.com'
                                },

                                 token: Patient.data().FCMtoken // token :  Patient.data().token              
                                }
                                
                   const apromis =   admin.messaging().send(mesage);
                   AllPromises.push(apromis);
          })
         return  Promise.all(AllPromises);
   }
   ).catch(err=>{console.log(err)})




 
   })

 export const RegisterPatientHttp = functions.https.onRequest
            (    (req,res)=>
                { 

                

                //  cors(req, res, () => {
                  admin.firestore().collection("Patients").add
                      ({
                        PatientNo:req.body.PatientNo,
                        RegDate:req.body.RegDate,
                        HospitalId:req.body.HospitalId,
                        Status:req.body.Status,
                        PassCode  :req.body.PassCode

                      })
                      .then( x=>{res.send(x.id)})
                      .catch(err=>{
                          console.log(err)
                            res.status(500).send(err)
                          })

                         //  })
            }
            )


            export const FindPatientHttp = functions.https.onRequest
            (     (req,res)=>
                { 
                 const Patients: { PatientId: FirebaseFirestore.DocumentData; id: string; }[] =[]
                 admin.firestore().collection('Patients')
                 .where("PatientNo",'==',req.body.PatientNo)
                .where("HospitalId",'==',req.body.HospitalId)
                 .get().then(        
                   snapshot => {
                                  snapshot.docs.forEach(Patient => {
                                  const currentID = Patient.id
                                  const appObj = { PatientId: Patient.data(), ['id']: currentID }
                                  Patients.push(appObj)
                                    })
                          res.send(Patients)
                          }                   
                        ) .catch(err=>{console.log(err); res.status(500).send(err) })
            }
            )

            export const FindPatient = functions.https.onCall
            (     (body,context)=>
                { 
                 const Patients: { PatientId: FirebaseFirestore.DocumentData; id: string; }[] =[]
                 return admin.firestore().collection('Patients')
                 .where("PatientNo",'==',body.PatientNo)
                 .where("HospitalId",'==',body.HospitalId)
                 .get().then(        
                   snapshot => {
                                  snapshot.docs.forEach(Patient => {
                                  const currentID = Patient.id
                                  const appObj = { PatientId: Patient.data(), ['id']: currentID }
                                  Patients.push(appObj)
                                    })
                          //res.send(Patients)
                          return Patients
                          }                   
                        ) .catch(err=>{console.log(err);
                        // res.status(500).send(err) 
                         return ({id: err});
                         })
            }
            )

            export const FindPatientSnap = functions.https.onCall
            (     (body,context)=>
                { 
                 const Patients: { PatientId: FirebaseFirestore.DocumentData; id: string; }[] =[]
                 return admin.firestore().collection('Patients')
                 .where("PatientNo",'==',body.PatientNo)
                 .where("HospitalId",'==',body.HospitalId)
                 .get().then(        
                   snapshot => {
                                  snapshot.docs.forEach(Patient => {
                                  const currentID = Patient.id
                                  const appObj = { PatientId: Patient.data(), ['id']: currentID }
                                  Patients.push(appObj)
                                    })
                          //res.send(Patients)
                          return Patients
                          }                   
                        ) .catch(err=>{console.log(err);
                        // res.status(500).send(err) 
                         return ({id: err});
                         })
            }
            )


export const RegisterDevice = functions.https.onCall
(    (body,context)=>
     {  
        
     return  admin.firestore().collection("RegisteredDevices").add
          ({
            
            PatientNo:body.PatientNo,
            RegDate:   new Date(body.RegDate)  ,
            HospitalId:body.HospitalId,
            Status:'OPEN',
            FCMtoken  :body.token
           })
           .then( x=>
           {
             console.log ('In then Register Patient Part') 
             //console.log (x) 
             console.log(x.id)
             console.log({id: x.id})
             return ({id: x.id,ans:true});
          })
           .catch(err=>
           {
             console.log(err)
             return ({id: err,ans:false});
               
           })
           
}
)

export const RegisterPatient = functions.https.onCall
(    (body,context)=>
     {  
        
     return  admin.firestore().collection("Patients").add
          ({
            
            PatientNo:body.PatientNo,
            RegDate:   new Date(body.RegDate)  ,
            HospitalId:body.HospitalId,
            Status:body.Status,
            PassCode  :body.PassCode

           })
           .then( x=>
           {
             console.log ('In then Register Patient Part') 
             //console.log (x) 
            
             console.log(x.id)
             console.log({id: x.id})
             return ({id: x.id,ans:true});
          })
           .catch(err=>
           {
             console.log(err)
             return ({id: err,ans:false});
               
           })
           
}
)

export const MessagePatient = functions.https.onCall
(     (body,context)=>
     { 
     
    return   admin.firestore().collection("PatientsMessages").add
          ({

            PatientNo:body.PatientNo,
            //PatientId:req.body.PatientId, // id from Patient document
            RegDate : admin.firestore.FieldValue.serverTimestamp(),//  new Date(body.RegDate),
            HospitalId : body.HospitalId,
            title : body.title,
            body : body.body,
            icon : body.icon,
            extrabody : body.extrabody,
          
            PassCode  :body.PassCode

           })
            .then( x=>
           {
             console.log ('In PatientsMessages Part') 
             //console.log (x) 
            
             console.log(x.id)
             console.log({id: x.id})
             return ({id: x.id,ans:true});
          })
           .catch(err=>
           {
             console.log(err)
             return ({id: err,ans:false});
               
           })
           
}
)



// export const getPatient = functions.https.onRequest
// ( (req,res)=>

// {  const id= req.body.id
//   const promise =  admin.firestore().doc('Patients/'+id).get()
//   const p2 =      promise.then( snapshot =>{
//             const data = snapshot.data()
//             res.send(data)
//         })
//     p2.catch(err=>{
//         console.log(err)
//         res.status(500).send(err)

//     })
// }
// )