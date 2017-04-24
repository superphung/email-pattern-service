import test from 'ava'
import guessEmail from './'

test('lol', t => {
  console.log(guessEmail('eric', 'phung', 'goshaba'));
  t.pass();
})
