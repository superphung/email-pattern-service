import test from 'ava'
import patternToEmail from './'

test('{Fname}', t => {
  const mails = patternToEmail('Clement', 'Galiay', '{Fname}@2opengates.ii')
  t.is(mails.length, 1)
  t.is(mails[0], 'clement@2opengates.ii')
})

test('{Fname}.{Lname}', t => {
  const mails = patternToEmail('Denby', 'Grace', '{Fname}.{Lname}@2kgames.com')
  t.is(mails.length, 1)
  t.is(mails[0], 'denby.grace@2kgames.com',)
})

test('{Fname}.{Lname * Pn}', t => {
  const mails = patternToEmail('djamil', 'said ali kemal', '{Fname}.{Lname * Pn}@goshaba.com')
  t.is(mails.length, 3)
  t.true(mails.includes('djamil.said@goshaba.com'))
  t.true(mails.includes('djamil.ali@goshaba.com'))
  t.true(mails.includes('djamil.kemal@goshaba.com'))
})

test('{Fname}.{InitLname}', t => {
  const mails = patternToEmail('Cédric', 'Lagarrigue', '{Fname}{InitLname}@focus-home.com')
  t.is(mails.length, 1)
  t.is(mails[0], 'cedricl@focus-home.com')
})

test('{Fname * iP1Pn}{InitLname}', t => {
  const mails = patternToEmail('jean Julien', 'Bouanicheu', '{Fname * iP1Pn}{InitLname}@adzonesocial.atos')
  t.is(mails.length, 1)
  t.is(mails[0], 'jjulienb@adzonesocial.atos')
})

test('{Fname * P1-Pn}.{Lname}', t => {
  const mails = patternToEmail('Jean-Charles', 'Duyrat', '{Fname * P1-Pn}.{Lname}@alcatel-lucent.com')
  t.is(mails.length, 1)
  t.is(mails[0], 'jean-charles.duyrat@alcatel-lucent.com')
})

test('{Fname}.{Lname * P1.Pn}', t => {
  const mails = patternToEmail('Isaure', 'Nivard-Pierson', '{Fname}.{Lname * P1.Pn}@capfiassocies.fr')
  t.is(mails.length, 1)
  t.is(mails[0], 'isaure.nivard.pierson@capfiassocies.fr')
})

test('{InitFname * iP1iPn}{InitLname}', t => {
  const mails = patternToEmail('Anne-Marie', 'Joassim', '{InitFname * iP1iPn}{InitLname}@answersrecruitment.fr')
  t.is(mails.length, 1)
  t.is(mails[0], 'amj@answersrecruitment.fr')
})

test('{Fname}{Lname * P1Pn}', t => {
  const mails = patternToEmail('Sunil', 'R Nair', '{Fname}{Lname * P1Pn}@aol.in')
  t.is(mails.length, 1)
  t.is(mails[0], 'sunilrnair@aol.in')
})

test('{Fname * P1Pn}.{Lname}', t => {
  const mails = patternToEmail('Anne-Juliette', 'Hermant', '{Fname * P1Pn}.{Lname}@axa.com')
  t.is(mails.length, 1)
  t.is(mails[0], 'annejuliette.hermant@axa.com')
})

test('{InitFname * iP1}.{Lname}', t => {
  const mails = patternToEmail('Pierre-Alain', 'GAGNe', 'p.gagne@dowino.collou')
  t.is(mails.length, 1)
  t.is(mails[0], 'p.gagne@dowino.collou')
})
