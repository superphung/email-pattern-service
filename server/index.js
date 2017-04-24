import app from './app'
import body from 'body-parser'
import mail from './email'
import mongoose from 'mongoose'
import * as db from './models'
import amqp from 'amqplib/callback_api'
import cors from 'cors'
import fillPattern from './fillPattern'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo/patterndb'
const AMQP_URL = process.env.AMQP_URL || 'amqp://rabbit'

mongoose.connect(MONGO_URL)

app.use(cors())

amqp.connect(AMQP_URL, function (err, conn) {
  if (err) {
    console.log(err)
    return process.exit(1)
  }
  conn.createChannel(function (err, ch) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    const q = 'event'

    ch.assertQueue(q)

    ch.consume(q, async function (msg) {
      console.log('receive', msg.content.toString())
      const patterns = JSON.parse(msg.content.toString())
      for (let obj of patterns) {
        const {company, city, pattern, domain} = obj
        const found = await db.Pattern.findOne({company, city, pattern, domain})
        if (found) {
          found.count += 1
          await found.save()
        } else {
          await db.Pattern.create({company, city, pattern, domain})
        }
      }
    }, {noAck: true})
  })
})

app.use(body.json())
app.use(body.urlencoded({extended: true}))

app.post('/emailToPattern', (req, res) => {
  const {users} = req.body
  console.log(users)
  if (!users) {
    return res.status(400).send('missing params')
  }
  const patterns = users
    .filter(user => user && user.fname && user.lname && user.email)
    .map(user => {
      const { fname, lname, email, company } = user
      return Object.assign(user, { pattern: mail.EmailToPattern(fname, lname, email, company) })
    })
  res.status(200).json({patterns})
})

app.post('/guess', async (req, res) => {
  const {users} = req.body
  if (!users) {
    return res.status(400).send('missing params')
  }
  const mails = await Promise.all(
    users
      .filter(user => user && user.fname && user.lname && user.company)
      .map(async user => {
        const {fname, lname, company} = user
        if (company.includes('@')) {
          console.log('email')
          const [at, right] = company.split('@')
          const patterns = await db.Pattern.find({ domain: { '$regex': right, '$options': 'i' }})
          return Object.assign(user, {mails: fillPattern(fname, lname, patterns)});
        }
        console.log('no email')
        const patterns = await db.Pattern.find({ company: { '$regex': company, '$options': 'i' }})
        console.log('patterns', patterns);
        return Object.assign(user, {mails: fillPattern(fname, lname, patterns)});
      })
  )
  res.status(200).json({ mails })
})

app.listen(3000)
