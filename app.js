import express from "express";
const app = express()
import nodemailer from "nodemailer"
import webpush from 'web-push';
import hbs from "nodemailer-express-handlebars"
const vapidKeys = webpush.generateVAPIDKeys();

const hbsOption = {
    viewEngine:{
        defaultLayout: false,    
    },
    viewPath: "views",
};
app.use(express.json())
app.use(express.urlencoded({extended:true}))

webpush.setVapidDetails(
  'mailto:ajjha5244@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:"ajjha5244@gmail.com",
            pass:"nxjjngcibmsjeatw",
        },
});
app.use(express.static('public'));
transporter.use("compile", hbs(hbsOption));
const mailer=(email,msg,template,name)=>{
    return new Promise((resolve,reject)=>{

    var mailOptions ={
        from: "ajjha5244@gmail.com",
        to: email,
        subject:msg,
        template:template,
        context:{
            username:name
        }
    }
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
        console.log(error);
        return reject(false)
    }else{
        console.log("Email sent " + info.response);
        return resolve(true)
    }
});
})}
app.post("/sendMail",async(req,res,next)=>{
    try{
        const {email,msg,name}=req.body
        await mailer(email,msg,"ShopingList",name)
        next()
    }catch(err){
        console.log(err)
    }
},(req,res)=>{
    res.status(200).json({status:true,msg:"mail sent"})
})
let subscriptions = [];
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
      subscriptions.push(subscription);
      res.status(201).json({});

  });

app.post("/sendNotification",async(req,res)=>{
    const notificationPayload = {
        notification: {
          title: 'Push Notification!',
          body: req.body.message || 'This is a test notification.',
          icon: 'assets/icons/icon-512x512.png',
          badge: 'assets/icons/icon-128x128.png'
        }
    }
    
    Promise.all(subscriptions.map(sub =>
        webpush.sendNotification(sub, JSON.stringify(notificationPayload))
      ))
        .then(() => res.status(200).json({ message: 'Notification sent successfully' }))
        .catch(error => {
          console.error('Error sending notification:', error);
          res.status(500).json({ error: 'Error sending notification' });
        });
})

app.listen(80,()=>{
    console.log("Server is running")
})