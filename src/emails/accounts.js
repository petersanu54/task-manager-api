const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)


const sendMsg = (toemail,name)=>{
    console.log('sending mail')
    sgMail.send({
        from : 'petersanu222@outlook.com',
        to: toemail,
        subject:'Thanks for joining in',
        text:`Welcome to the app, ${name}. Let me know how you get along with the app.`
    }) 
    
}

const sendMsgOnDeletion = (toemail, name)=>{
    console.log('sending email')
    sgMail.send({
        from : 'petersanu222@outlook.com',
        to : toemail,
        subject : 'Thanks for this wonderful journey with us',
        text: `Good bye! ${name}. We wish you a Goodluck.`
    })
}

module.exports = {
    sendMsg,
    sendMsgOnDeletion
}

// sgMail.send(msg).then(()=>{
//     console.log('message sent')
// }).catch((error)=>{
//     console.log(error)
// })