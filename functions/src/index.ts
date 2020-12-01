import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
//import { promises } from 'dns';
admin.initializeApp()
//const cors = require('cors')({origin: true});
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


export const OnMessagePatientSendFCM2 =
  functions.firestore.document("PatientsMessages/{id}").onCreate( async (snap,context)=>{
   try {
           const AllPromises:  Promise<string>[]= []
           const devicearray =  await  admin.firestore().collection('RegisteredDevices') 
                         .where("PatientNo",'==',snap.data().PatientNo)
                         .where("HospitalId",'==',snap.data().HospitalId).get() ;    
           devicearray.docs.forEach(Patient => {                            
                                          const mesage ={                                  
                                             notification: {title:snap.data().title, body: snap.data().body    },                           
                                             token: Patient.data().FCMtoken // token :  Patient.data().token              
                                          } 
                                          const apromis =   admin.messaging().send(mesage);
                                          AllPromises.push(apromis);
                                          
                                        });
     return  Promise.all(AllPromises);
   } 
   catch (error) {
     return error;  
   } 
}
);


async function   GetToken( PatientNo :any ,HospitalId:any):Promise< FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>
{
  //var    data : FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
    return  await  admin.firestore().collection('RegisteredDevices')
                 .where("PatientNo",'==',PatientNo)
                 .where("HospitalId",'==',HospitalId)
                 .get().then( p=> {return p});//.catch (err=>{console.log(err)});
     
}




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
                               
                                notification: {
                                title:snap.data().title, 
                                body: '<a >snap.data().body'      , 
                                data: { url:'https://yahoo.com/' }, 
                                click_action: "https://google.com" },
                                      
                               fcm_options: {            link: 'https://yahoo.com/'    },                   
                               token: Patient.data().FCMtoken

                                // token :  Patient.data().token              
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
            (     
              async (body,context)=>
                { 
                 const Patients: { PatientId: FirebaseFirestore.DocumentData; id: string; }[] =[]
                 try {
                  const snapshot = await admin.firestore().collection('Patients') 
                                          .where("PatientNo", '==', body.PatientNo)
                                          .where("HospitalId", '==', body.HospitalId).get();               
                    
                        snapshot.docs.forEach(Patient =>{
                                              const appObj = { PatientId: Patient.data(), ['id']: Patient.id };
                                              Patients.push(appObj);
                                      });
                  return Patients;
                } catch (err) {
                  console.log(err);
                  return ({ id: err });
                }
            }
            )

export const ExistsPatientWtOpenStatus = functions.https.onCall
            (     
              async (body,context)=>
                { 
                 try {
                 const p= await admin.firestore().collection('Patients') 
                                          .where("PatientNo", '==', body.PatientNo)
                                          .where("Status", '==','OPEN')
                                          .where("HospitalId", '==', body.HospitalId).get();          

                  return ! p.empty;

                } catch (err) {
                  console.log(err);
                  return false;
                }
            }
            )


export const RegisterDeviceold = functions.https.onCall
(    async (body,context)=>
     {         
      try {

        
                  const x = await admin.firestore().collection("RegisteredDevices").add({
                        PatientNo: body.PatientNo,
                        RegDate: new Date(body.RegDate),
                        HospitalId: body.HospitalId,
                        Status: 'OPEN',
                        FCMtoken: body.token
                      });

                 return ({ id: x.id, ans: true });
         } 
      catch (err) {
            console.log(err);
             return ({ id: err, ans: false });
         }          
      }
)
export const RegisterDevice = functions.https.onCall
(    async (body,context)=>
     {         
      try {
           const p= await admin.firestore().collection('Patients')  .where("PatientNo", '==', body.PatientNo)         
                               .where("PatientId", '==', body.PatientId).get();       
            let deviceid=''   
                if (!p.empty)
               {
                   const q = await admin.firestore().collection('RegisteredDevices')  .where("FCMtoken", '==', body.token)     
                             .where("PatientId", '==', p.docs[0].id).get();    
                   if (q.empty)
                   {
                      const r = await admin.firestore().collection("RegisteredDevices").add({
                                PatientNo: body.PatientNo,  RegDate: new Date(body.RegDate), PatientId: p.docs[0].id,
                                HospitalId: body.HospitalId,  Status: 'OPEN',     FCMtoken: body.token})       
                       deviceid=r.id
                   }
                   return ({ id: p.docs[0].id, ...p.docs[0].data(), ans:true,deviceid:deviceid });
               }
               else  return ({ id: '', ans: false }); 
                
         } 
      catch (err) { console.log(err);  return ({ id: err, ans: false })  
         }          
    }
)

export const RegisterPatient = functions.https.onCall
(    async (body,context)=>
     {         
        try {
                

                  const x = await admin.firestore().collection("Patients").add({PatientNo: body.PatientNo,
                     RegDate: new Date(body.RegDate),  HospitalId: body.HospitalId, Status: body.Status });
                  const updateref= await  x.update( { PatientId: x.id});
                  const msg = { uid:  body.HospitalId,content:'Welcome..'   ,  createdAt:   new Date(Date.now())     }
                  const data = { uid: x.id, createdAt: admin.firestore.FieldValue.serverTimestamp(),count: 0, messages: [msg] };
                  const chatRef =  await admin.firestore().collection('chats').doc(x.id).set(data);
                return ({ id: x.id, chatRef:chatRef,updateref: updateref ,ans: true });
              } 
          catch (err) {
                  console.log(err);
                  return ({ id: err, ans: false });
          }          
      }  
)

export const MessagePatient = functions.https.onCall
(     async (body,context)=>
     {     
       try {
             const x = await admin.firestore().collection("PatientsMessages").add({
                        PatientNo: body.PatientNo,
                        PatientId:body.PatientId, // id from Patient document
                        RegDate: admin.firestore.FieldValue.serverTimestamp(),
                        HospitalId: body.HospitalId,    icon: body.icon,
                        title: body.title,  body: body.body,
                        extrabody: body.extrabody
                      });
               return ({ id: x.id, ans: true });
        } 
        catch (err) {
             console.log(err);
             return ({ id: err, ans: false });
         }
           
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