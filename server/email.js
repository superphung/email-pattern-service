////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*** GENERAL NOTICE */
// This code has been created by an AMATEUR dev
// I guess it could be optimized a lot...
// Feel free to send me your comments, questions or optimizations proposals.
// Thanks.
// Djamil Kemal
// info@djamilkemal.com
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/


/* /////////////////////////////////////////////////: REVISION NOTES ///////////////////////////////////////////////////////////////////////////////////

 code ok on Aug. 28 @ 13:53
 code ok on Nov 19 @ 13:13
 code under dev on Nov 13 @ 13:11 - Debugging composed Fnames ---> based based on "If CountWords(Fname) 1" but this doesn't work with parts separated by hypens or underscores


 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

module.exports = {
  EmailToPattern,
  RemoveDiacritics
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/***  MENU SETUP */
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function onOpen() {
  // Adds a custom menu to Google Spreadsheet Menu

  var ui = SpreadsheetApp.getUi();

  // Or DocumentApp or FormApp.
  ui.createMenu('Djamil Sales')
    .addItem('Test', 'Test')
    .addSeparator()
    .addItem('Isolate Organization', 'IsolateOrganization')
    .addSubMenu(ui.createMenu('Sub-menu')
      .addItem('Second item', 'menuItem2'))
    .addToUi();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/***   GLOBAL VARIABLES */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var nickNamesList = [
 // used to detect nicknames that replace first names
 // Example: Rober Smith --> bob.smith@company.com
 // Structure: [ "First Name", "Nickname1", "Nickname2"...]
 // IMPORTANT WARNING 1 : For each First Name, Nickames must be sorted from longest to shortest if one contains another
 // Example: ["Adelaide", "Della", "Dell"] AND NOT ["Adelaide", "Dell", "Della"] --> "Della" contains "Dell"
 // IMPORTANT WARNING 2 : First Names and Nicknames MUST NOT have accents
 // Example: "Stephane" and NOT "Stéphane", "Steph" and NOT "Stéph"

 ["Michael", "Mike", "Mickey"],
 ["Abigail", "Abbie", "Nabby", "Abby", "Gail"],
 ["Ada", "Adie", "Adee"],
 ["Adelaide", "Addie", "Adela", "Della", "Dell"],
 ["Stephane", "Steph"],



 /*

  https://github.com/dtrebbien/diminutives.db/blob/master/male_diminutives.csv
  https://github.com/dtrebbien/diminutives.db/blob/master/male_diminutives.csv

  https://en.wiktionary.org/wiki/Appendix:English_given_names
  https://github.com/carltonnorthern/nickname-and-diminutive-names-lookup/blob/master/names.csv
  http://prenoms.famili.fr/,les-prenoms-diminutifs,2347852.asp



  --> rajouter

  Alexandra, Alex
  Alexandre, Alex
  Alexandrine, Alex
  Antoine, Anto
  Aurelie, Aure
  Beatrice, Bea
  Beatrix, Bea
  Benjamin, Ben, Benji
  Brigitte, Brig, Bri
  Caroline, Caro, Caz
  Cassandre, Cas
  Chloe, Clo
  Christel, Cris
  Christelle, Cris
  Chrystelle, Crys, Cris
  Clémence, Clem
  Clémentine, Clem
  Clotilde, Clo
  Coralie, Cora
  Coraline, Cora
  Cristel, Cris
  Damien, Dam
  Daniel, Dan, Dany, Danny
  Danièle, Dan, Dany, Danny
  Danielle, Dan, Dany, Danny
  Delphine, Delph, Delf
  Dieudonné, Dieudo
  Dominique, Dom, Do
  Dorothée, Do
  Emmanuel, Manu
  Emmanuelle, Emma
  Evangeline, Eva
  Fabien, Fab
  Fabrice, Fab
  Florence, Flo
  Florent, Flo
  Florian, Flo
  Francoise, Fran
  Frédéric, Fred
  Frédérique, Fred
  Gwenaelle, Gwen
  Gwennaelle, Gwen
  Isabelle, Isa
  Jacques, Jaco
  Joachim,  Jo
  Jocelyn, Jo
  Joel, Jo
  Joelle, Jo
  Jonas, Jo
  Jonathan, Jo
  Jose, Jo
  Joseph, Jo
  Josselin, Jo
  Laurent, Lolo
  Ludovic, Ludo
  Marc, Marco
  Maxence, Max
  Maxime, Max
  Maximilien, Max
  Nadege, Nad
  Nadine, Nad
  Nicolas, Nico
  Patrice, Pat
  Pierre, Pierrot
  Sabine, Sab
  Samir, Sam
  Samuel, Samu, Sam
  Stanislas, Stan
  Stephane, Steph, Stef
  Stephanie, Steph, Stef
  Theodore, Theo, Teo
  Theophile, Theo, Teo
  Thomas, Tom
  Valentine, Val
  Valerie, Val
  Victor, Vic
  Vincent, Vince
  Xavier, Xav
  Yolande, Yo
  Yolando, Yo

  */



];



var particules = [
 // used to identify when a name is modified due to a particule
 // Example: Sara van der Voort --> sara.voort@company.com
 // Example: Sara de Mory Plessy --> sara.demory-plessy@company.com
 // Example: Sara de Mory Plessy --> sara.mory_plessy@company.com

 // !!! WARNING: to be sorted from longest to shortest !!

 "vanden", "vander", "der", "des", "dos", "las", "los", "ten", "ter", "the",
        "und", "van", "von", "zum", "zur",
 "af", "am", "an", "av", "da", "de", "di", "do", "du", "im", "lo", "of", "op",
        "te", "zu", "a", "y"


];


var genericPersonalDomains = [
 // used to identify personal emails (vs professionals)
 // ----------------------------------------> TO RECODE & TO BE USEDI IN Function IsPersonalEmail
 "facebook.com", "gmail", "hotmail", "live"
 

];


var confusingGenericDomains = [
// used to identify personal emails (vs professionals)

/* Same domain used for professional emails and private emails (cf. Yahoo.com employees have a yahoo addess 
   In this example, need to check whether person works at yahoo or not */

"yahoo" 

];


var personalDomains = [
 // used to identify personal emails (vs professionals)

 /* Default personalDomains included */
 "aol.com", "att.net", "comcast.net", "facebook.com", "gmail.com", "gmx.com",
        "googlemail.com",
 "hotmail.com", "hotmail.co.uk", "mac.com", "me.com", "mail.com",
        "msn.com",
 "live.com", "sbcglobal.net", "verizon.net", "yahoo.com", "yahoo.co.uk",

 /* Other global personalDomains */
 "email.com", "games.com" /* AOL */ , "gmx.net", "hush.com", "hushmail.com",
        "icloud.com", "inbox.com",
 "lavabit.com", "love.com" /* AOL */ , "outlook.com", "pobox.com",
        "rocketmail.com" /* Yahoo */ ,
 "safe-mail.net", "wow.com" /* AOL */ , "ygm.com" /* AOL */ , "ymail.com" /* Yahoo */ ,
        "zoho.com", "fastmail.fm",
 "yandex.com",

 /* United States ISP personalDomains */
 "bellsouth.net", "charter.net", "comcast.net", "cox.net", "earthlink.net",
        "juno.com",

 /* British ISP personalDomains */
 "btinternet.com", "virginmedia.com", "blueyonder.co.uk", "freeserve.co.uk",
        "live.co.uk",
 "ntlworld.com", "o2.co.uk", "orange.net", "sky.com", "talktalk.co.uk",
        "tiscali.co.uk",
 "virgin.net", "wanadoo.co.uk", "bt.com",

 /* personalDomains used in Asia */
 "sina.com", "qq.com", "naver.com", "hanmail.net", "daum.net", "nate.com",
        "yahoo.co.jp", "yahoo.co.kr", "yahoo.co.id", "yahoo.co.in",
        "yahoo.com.sg", "yahoo.com.ph",

 /* French ISP personalDomains */
 "hotmail.fr", "live.fr", "laposte.net", "yahoo.fr", "wanadoo.fr", "orange.fr",
        "gmx.fr", "sfr.fr", "neuf.fr", "free.fr",

 /* German ISP personalDomains */
 "gmx.de", "hotmail.de", "live.de", "online.de", "t-online.de" /* T-Mobile */ ,
        "web.de", "yahoo.de",

 /* Russian ISP personalDomains */
 "mail.ru", "rambler.ru", "yandex.ru", "ya.ru", "list.ru",

 /* Belgian ISP personalDomains */
 "hotmail.be", "live.be", "skynet.be", "voo.be", "tvcablenet.be", "telenet.be",

 /* Argentinian ISP personalDomains */
 "hotmail.com.ar", "live.com.ar", "yahoo.com.ar", "fibertel.com.ar",
        "speedy.com.ar", "arnet.com.ar",

 /* personalDomains used in Mexico */
 "hotmail.com", "gmail.com", "yahoo.com.mx", "live.com.mx", "yahoo.com",
        "hotmail.es", "live.com", "hotmail.com.mx", "prodigy.net.mx",
        "msn.com"
        
      

];




var genericEmails = [
// Used to identify Alumni emails


  "contact","contacts","info","infos","press","presse","sales","support","admin","candidature","candidatures","job","jobs","media",
  "no-eply","partenaires","partenariats","partnerhips","partners","partnership","pub","recrutement","webmaster","abonnement","abonnes","abuse","accueil",
  "accueil","admin","administrator","all","billing", "bonjour","booking","bookings","ceo","communication","competition","compliance","comptabilite","connect",
  "customersupport","demo","desabonnement","devnull","dns","editor","enquiries","everyone","facturation","feedback","finance","finances","form","formulaire","ftp",
  "generalinfo","hello","help","hostmaster","inoc","inscrtiption","inscrtiptions","investisseurs","investorrelations","invoice",
  "invoices","ir","ispfeedback","ispsupport","list","listadmin","list-request","maildaemon","mailing","mailinglist","manager","marketing","marketing",
  "nobody","office","president","registrar","registration","renseignement","renseignements","reservation","reservations","sav","social","spam","standard",
  "subcribe","subscription","team","vente","work"



];




var universities = [
 // Used to identify Alumni emails

 /* Alumni France */
 "m4x.org", "melix.org", "melix.net", "polytechnique.org", "alumni.essec.fr",
        "centraliens.net", "hec.edu", "epitech.eu",

 /* Alumni USA */
 "alumni.harvard.edu", "caa.columbia.edu", "alum.kellogg.northwestern.edu",
        "alumni-gsb.stanford.edu", "alumni.duke.edu",
        "alumni.brown.edu", "alumni.ie.edu",

];



var defaultDiacriticsRemovalMap = [
 // regex expressions used to replace special accentuated characters by regular characters
 // Example : éric --> eric
 // Example : Català --> Catala
  {
    'base': 'A',
    'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g
 }, {
    'base': 'AA',
    'letters': /[\uA732]/g
 }, {
    'base': 'AE',
    'letters': /[\u00C6\u01FC\u01E2]/g
 }, {
    'base': 'AO',
    'letters': /[\uA734]/g
 }, {
    'base': 'AU',
    'letters': /[\uA736]/g
 }, {
    'base': 'AV',
    'letters': /[\uA738\uA73A]/g
 }, {
    'base': 'AY',
    'letters': /[\uA73C]/g
 }, {
    'base': 'B',
    'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g
 }, {
    'base': 'C',
    'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g
 }, {
    'base': 'D',
    'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g
 }, {
    'base': 'DZ',
    'letters': /[\u01F1\u01C4]/g
 }, {
    'base': 'Dz',
    'letters': /[\u01F2\u01C5]/g
 }, {
    'base': 'E',
    'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g
 }, {
    'base': 'F',
    'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g
 }, {
    'base': 'G',
    'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g
 }, {
    'base': 'H',
    'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g
 }, {
    'base': 'I',
    'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g
 }, {
    'base': 'J',
    'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g
 }, {
    'base': 'K',
    'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g
 }, {
    'base': 'L',
    'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g
 }, {
    'base': 'LJ',
    'letters': /[\u01C7]/g
 }, {
    'base': 'Lj',
    'letters': /[\u01C8]/g
 }, {
    'base': 'M',
    'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g
 }, {
    'base': 'N',
    'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g
 }, {
    'base': 'NJ',
    'letters': /[\u01CA]/g
 }, {
    'base': 'Nj',
    'letters': /[\u01CB]/g
 }, {
    'base': 'O',
    'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g
 }, {
    'base': 'OI',
    'letters': /[\u01A2]/g
 }, {
    'base': 'OO',
    'letters': /[\uA74E]/g
 }, {
    'base': 'OU',
    'letters': /[\u0222]/g
 }, {
    'base': 'P',
    'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g
 }, {
    'base': 'Q',
    'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g
 }, {
    'base': 'R',
    'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g
 }, {
    'base': 'S',
    'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g
 }, {
    'base': 'T',
    'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g
 }, {
    'base': 'TZ',
    'letters': /[\uA728]/g
 }, {
    'base': 'U',
    'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g
 }, {
    'base': 'V',
    'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g
 }, {
    'base': 'VY',
    'letters': /[\uA760]/g
 }, {
    'base': 'W',
    'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g
 }, {
    'base': 'X',
    'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g
 }, {
    'base': 'Y',
    'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g
 }, {
    'base': 'Z',
    'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g
 }, {
    'base': 'a',
    'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g
 }, {
    'base': 'aa',
    'letters': /[\uA733]/g
 }, {
    'base': 'ae',
    'letters': /[\u00E6\u01FD\u01E3]/g
 }, {
    'base': 'ao',
    'letters': /[\uA735]/g
 }, {
    'base': 'au',
    'letters': /[\uA737]/g
 }, {
    'base': 'av',
    'letters': /[\uA739\uA73B]/g
 }, {
    'base': 'ay',
    'letters': /[\uA73D]/g
 }, {
    'base': 'b',
    'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g
 }, {
    'base': 'c',
    'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g
 }, {
    'base': 'd',
    'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g
 }, {
    'base': 'dz',
    'letters': /[\u01F3\u01C6]/g
 }, {
    'base': 'e',
    'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g
 }, {
    'base': 'f',
    'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g
 }, {
    'base': 'g',
    'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g
 }, {
    'base': 'h',
    'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g
 }, {
    'base': 'hv',
    'letters': /[\u0195]/g
 }, {
    'base': 'i',
    'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g
 }, {
    'base': 'j',
    'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g
 }, {
    'base': 'k',
    'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g
 }, {
    'base': 'l',
    'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g
 }, {
    'base': 'lj',
    'letters': /[\u01C9]/g
 }, {
    'base': 'm',
    'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g
 }, {
    'base': 'n',
    'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g
 }, {
    'base': 'nj',
    'letters': /[\u01CC]/g
 }, {
    'base': 'o',
    'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g
 }, {
    'base': 'oi',
    'letters': /[\u01A3]/g
 }, {
    'base': 'ou',
    'letters': /[\u0223]/g
 }, {
    'base': 'oo',
    'letters': /[\uA74F]/g
 }, {
    'base': 'p',
    'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g
 }, {
    'base': 'q',
    'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g
 }, {
    'base': 'r',
    'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g
 }, {
    'base': 's',
    'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g
 }, {
    'base': 't',
    'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g
 }, {
    'base': 'tz',
    'letters': /[\uA729]/g
 }, {
    'base': 'u',
    'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g
 }, {
    'base': 'v',
    'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g
 }, {
    'base': 'vy',
    'letters': /[\uA761]/g
 }, {
    'base': 'w',
    'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g
 }, {
    'base': 'x',
    'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g
 }, {
    'base': 'y',
    'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g
 }, {
    'base': 'z',
    'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
 }
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/***  GENERIC STRING FUNCTIONS */
/*** Some equivalent functions exist in native JS but I didn't find them convenient for code readability */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function isEmpty(str) {
  return (!str)
}


function LeftSep(text, sep) {
  // In a string, returns the sub-string that is left to the 1st sep
  // Example : ("jean@company.com", "@") --> "jean"
  // Example : ("aaa|bbb|ccc",  "|") --> ("aaa")

  var pos = text.indexOf(sep);
  if (pos != -1) {
    var res = text.slice(0, pos)
  } else {
    res = text;
  }
  return res;
}


function RightSep(text, sep) {
  // In a string, returns the sub-string that is ritghy to the 1st sep
    // Example : ("jean@company.com", "@") --> "company.com"
  // Example : ("aaa|bbb|ccc",  "|") --> ("bbb|ccc")

  var pos = text.indexOf(sep);
  if (pos != -1) {
    var res = text.slice(pos + 1, text.length)
  } else {
    res = text;
  }

  return res;
}


function FormatSeparators(str, sep) {
  sep = sep || " "
    // Takes a String and format it in order to have clean separations between every words (separator is ONE SPACE if not define or ONE SEP is specified)
    // Example: "Jean-Paul" --> "Jean Paul"
    // Example: "Jean---Paul" --> "Jean Paul"
    // Example: "Jean      de--- Saint    - Paul" --> "Jean de Saint Paul"
    // Example of sep  :  ("jean paul", "_") --> "jean_paul"
    // WARNING : doesn't work if sep is empty. In that case, use function CompactName()


  while (str.indexOf("-") > -1) {
    str = str.replace("-", " ");
  }

  while (str.indexOf("_") > -1) {
    str = str.replace("_", " ");
  }

  while (str.indexOf(".") > -1) {
    str = str.replace(".", " ");
  }

  while (str.indexOf("  ") > -1) {
    str = str.replace("  ", " ");
  }
  str = str.trim();

  while (str.indexOf("  ") > -1) {
    str = str.replace("  ", " ");
  }


  if (sep != " ") {

    while (str.indexOf(" ") > -1) {
      str = str.replace(" ", sep);
    }
  }


  return str;
}




function CompactName(str) {
  // Takes a String deletes separtor.
  // Example: ("Jean-Paul") --> ("JeanPaul")
  // Example: ("Jean-_- Paul") --> ("JeanPaul")

  str = str.replace(/[-._ ]/g, ""); // regex : suppresses any '_', '.' or '-'

  return str;
}




function isComposed (name) {
    // Check whether a Fname or Lname is composed

    var res = false;
    if (name.indexOf("-") > -1) {res = true};
    if (name.indexOf(" ") > -1) {res = true};

    return res;
}




function CountWords(str, sep) {
  sep = sep || " "
    // Counts the numbers of words. By default, the separator is SPACE


  // suppresses successive separators (eg.: several spaces between 2 words --> only one space)
  while (str.indexOf(sep + sep) > -1) {
    str = str.replace(sep + sep, sep);
  }

  str = str.trim();
  var list = str.split(sep);

  if (isEmpty(str)) {
    return 0;
  } else {
    return list.length;
  }

}



function NthWord(str, n, sep) {
  sep = sep || " "
  var res = "";
  // Returns the Nth word of a string (separated by Space by default or by sep)

  // tests whether the arguments are correct
  var nbparts = CountWords(str, sep);
  if (n > nbparts) {
    return ""
  }
  if (str.indexOf(sep) < 0) {
    return str
  }


  // suppresses successive separators (eg.: several spaces between 2 words --> only one space)
  while (str.indexOf(sep + sep) > -1) {
    str = str.replace(sep + sep, sep);
  }

  // creates an arrayof parts
  var list = str.split(sep);

  return list[n - 1];
}




function Initials(str, sep) {
  sep = sep || ""
    // Get the initials of the words within a string (separated by Spaces or hyphens or underscores)
    // Example Initials("jean")="j"; Initials("Jean-Charles") = "JC";
    // If sep is specified, returns initials separated by sep
    // if sep ="any", take any word in the string
    // Example: ("Jean     Claude", "-") --> "j-c"


  str = FormatSeparators(str);


  var res = "";
    
    
    if (str.indexOf("-") > -1) {
    
        var nbparts = CountWords(str, "-") }
    
    else {
    
        var nbparts = CountWords(str, " ")
    
    }
      
    


  if (nbparts > 1) {

    for (var i = 1; i < nbparts; i++) {
      res = res + NthWord(str, i).slice(0, 1) + sep;
    }
    res = res + NthWord(str, nbparts).slice(0, 1);
  } else {

    return str.slice(0, 1);

  }

  return res;
}




function FirstInitial(str, sep) {
  sep = sep || "";
  // For a string composed of several words, returns the initial of the 1st word followed by the other. Words separated by SEP in final string
  // Example : ("Jean-Charles", ".")  -> "J.Charles"

  str = FormatSeparators(str, sep);

  var nbparts = CountWords(str, sep);
  var res = "";

  if (nbparts < 2) {
    return Initials(str, sep);
  }

  res = Initials(NthWord(str, 1, sep)) + sep

  for (var i = 2; i < nbparts; i++) {
    res = res + NthWord(str, i, sep) + sep;
  }

  res = res + NthWord(str, nbparts, sep);

  return res;
}



function LastInitial(str, sep) {
  sep = sep || "";
  // For a string composed of several words, replaces the last word by its initial . Words separated by SEP in final string
  // Example : ("Jean-Charles", ".")  -> "Jeanc"


  str = FormatSeparators(str, sep);

  var nbparts = CountWords(str, sep);
  var res = "";

  if (nbparts < 2) {
    return Initials(str, sep);
  }

  for (var i = 1; i < nbparts; i++) {
    res = res + NthWord(str, i, sep) + sep;
  }

  res = res + Initials(NthWord(str, nbparts, sep));


  return res;
}




function RemoveDiacritics(str) {
  // Replace special characters by their non equivalent
  // Also removes the apostrophe (')
  // Example: "Stéphanie d'Orge" --> "Stephanie dOrge"


  var changes;
  if (!changes) {
    changes = defaultDiacriticsRemovalMap;
  }
  for (var i = 0; i < changes.length; i++) {
    str = str.replace(changes[i].letters, changes[i].base);
  }

  str = str.replace("'", "");
  return str;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*** SPECIFIC EMAIL-ORIENTED STRING FUNCTIONS */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function IsPersonalEmail(email) {
  // Checks whether an email has a private domain (vs corporate)


  // email = email.toLowerCase();
  email = RightSep(email, "@");

  var res = false;

  for (var i = 0; i < personalDomains.length; i++) {

    if (email == personalDomains[i].toLowerCase()) {
      return true;
    }
  }

  return res;
}



function IsAlumniEmail(email) {
  // Checks whether an email is an Alumni email (vs corporate)
  // note : for people working in universities, (exemple helene.truc@hec.edu), it's sometimes impossible to differenciate an alumni from  a worker.
  // if is important, add the argument FASLE in the EmailToPattern function



  email = email.toLowerCase();
  email = LeftSep(email, "@");

  var res = false;

  for (var i = 0; i < universities.length; i++) {

    if (email == universities[i].toLowerCase()) {
      res = true;
      break;
    }

  }

  return res;

}



function isGenericEmail (email)  {
  // Checks whether an email is generic (Example: contact@company.com)


  email = email.toLowerCase();
  email = LeftSep(email, "@");

  var res = false;

  for (var i = 0; i < genericEmails.length; i++) {

    if (email.valueOf() == genericEmails[i].toLowerCase() ) {
      res = true;
      break;
    }

  }

  return res;

}






function IsParticule(str) {
  // Check whether str is a particule (Jean DE Truc, Otto VAN machin...)


  str = str.toLowerCase().trim();
  var res = false;

  for (var i = 0; i < particules.length; i++) {

    if (str == particules[i].toLowerCase()) {
      res = true;
      break;
    }
  }

  return res;
}




function RemoveParticules(name) { //---------------------------------------------------> trier paritucles par ordre alpha Z-A
  // Removes the particules in a string
  // Example : "Alex Van der Voort" --> "Alex Voort"
  // Example : "de Saint Vincent" --> "Saint Vincent"
  // Example : "of the d'Urbervilles" --> "dUrbervilles"


  name = name.replace("'", "");
  var namespace = FormatSeparators(name);

  var nbParts = CountWords(namespace)

  for (var i = 1; i < nbParts + 1; i++) {
    var part = NthWord(namespace, i);
    if (IsParticule(part)) {
      name = name.replace(NthWord(part), "");
    }
  }

  name = name.trim();
  if (name.charAt(0) == "-") {
    name = name.substr(1, name.length)
  }

  return name;
}


function RemoveParticules2(name) {
  // Removes the particules in a string
  // Example : "Alex Van der Voort" --> "Alex Voort"
  // Example : "de Saint Vincent" --> "Saint Vincent"
  // Example : "of the d'Urbervilles" --> "dUrbervilles"


  name = name.replace("'", "");
  var namespace = FormatSeparators(name);
  var nbParts = CountWords(namespace)
  var nthParticule = [""];

  //for (var i= 1;


  for (var i = 1; i < nbParts + 1; i++) {
    var part = NthWord(namespace, i);
    if (IsParticule(part)) {
      name = name.replace(NthWord(part), "");
    }
  }

  name = name.trim();
  if (name.charAt(0) == "-") {
    name = name.substr(1, name.length)
  }

  return name;
}




function isEmail(email) {
  // makes sure the email looks like a valid email (only checks the string, not the email actual existence)

  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}



function isProperName(str) {
  // makes sure the name (Firt Name or Last NAme) looks like a name (no coma or other special characters)

  str = RemoveDiacritics(str);
  var re = /^[^&~#'(\[`\\\^@)=+}£$*%<>°?,;.\/:§!_]*$/ //A string containing anything but these special characters
  return re.test(str);
}



function GetFname(name) {
  // gets the First Name in a string like "Djamil Kemal"

  var res = LeftSep(name, " ");
  res = res.toLowerCase();
  return res.trim();
}



function GetLname(name) {
  // // gets the Last Name in a string like "Djamil Kemal" "Djamil Kemal de Saint Vincent"

  var res = RightSep(name, " ");
  res = res.toLowerCase();
  return res.trim();
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/***  SUB PATTERNS SEARCH FUNCTIONS */

/***  GENERAL NOTE ABOUT THE PROCESS

 The overall idea is to look for small sub-patterns and iterate until the full pattern is found
 Example : jean.dupont@company.com

 Step 1: The left part of the email is isolated --> jean.dupont
 Step 2: The Fname is looked for and replaced in the string --> jean.{Lname}
 Step 3: The Lname is looked for and replaced in the string --> {fname}.{Lname}

 And so on, with different sub-patterns, including the cases with a composed Fname and/or Lname */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var subPatterns = [
 // Used to identify a SubPattern
 // Check

 "Fname", "Lname", "init", "iP", "Pn"

];



function LockPattern(pat) {
  // Prevents the patterns that have already been found (example: {Fname}) to be mistaken with the original email.
    // Therefore, when looking for initials, the letters from the pattern are not taken into consideration
    // Example : in the case of valot@compay.com for Laurent Valot --> {Lname} --> the L of Lname is not mistaken with the initial of Laurent

  for (var i = 0; i < subPatterns.length; i++) {
    var currentpat = "[" + i.toString() + "]";
    pat = pat.replace(subPatterns[i], currentpat)
  }


  return pat;
}



function UnLockPattern(temp) {
  // This function reverses the result of LockPattern;
  // Example: "[1]" --> "{Lname}"


  for (var i = 0; i < subPatterns.length; i++) {
    var currentnum = "[" + i.toString() + "]";
    temp = temp.replace(currentnum, subPatterns[i])
  }

  return temp;
}



function LookForLastName(leftpart, lname) {
  // Search for the Last Name in the left part of the email
  // email structure : leftpart@rightpart

  /* Add these lines if this function is to be used as a standalone
  // In the EmailToPattern function, this formatting has already been is already done
  leftpart = leftpart.trim();
  leftpart = leftpart.toLowerCase();
  lname = lname.toLowerCase();
  lname = RemoveDiacritics(lname);
  lname = FormatSeparators(lname);
  */


  var nbparts = CountWords(lname);


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*** Lname is NOT composed name                                                                                 ***/
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (nbparts == 1) {
    if (leftpart.indexOf(lname) != -1) {
      leftpart = leftpart.replace(lname, "{Lname}");
    }
    return leftpart;
  } else {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*** Lname IS a composed name                                                                                   ***/
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // look for this pattern : Part1Part2-...-ParN (all parts attached)
    var pattern = CompactName(lname);

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Lname * P1Pn}");
    }


    // look for this pattern : Part1-Part2-...-ParN (words separated by "-")
    pattern = FormatSeparators(lname, "-");

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern,
        "{Lname * P1-Pn}");
    }



    // look for this pattern : Part1.Part2. ... ParN (words separated by ".")
    pattern = FormatSeparators(lname, ".");

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern,
        "{Lname * P1.Pn}");
    }



    // look for this pattern : Part1_Part2_ ..._ ParN (words separated by "_")
    pattern = FormatSeparators(lname, "_");

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern,
         "{Lname * P1_Pn}");
    }

    ////////////////////////////////////////////////////////////////////////////////




    // do the same analyses as above, but omitting the particules if Lname has any
    if (RemoveParticules(lname) !== "") {

      lname = RemoveParticules(lname);


      // look for this pattern : Part1Part2-...-ParN (all parts attached)
      pattern = CompactName(lname);
      if (leftpart.indexOf(pattern) > -1) {

        if (CountWords(lname) > 1) {
          return leftpart.replace(pattern,
            "{Lname * P1Pn }");
        } else {
          return leftpart.replace(pattern,
            "{Lname Pn}");
        }
      }



      // look for this pattern : Part1-Part2-...-ParN (words separated by "-")
      pattern = FormatSeparators(lname, "-");
      if (leftpart.indexOf(pattern) > -1) {

        if (CountWords(lname) > 1) {
          return leftpart.replace(pattern,
            "{Lname * P1-Pn}"
          );
        } else {
          return leftpart.replace(pattern,
            "{Lname * Pn}");
        }
      }


      // look for this pattern : Part1.Part2. ... ParN (words separated by ".")
      pattern = FormatSeparators(lname, ".");
      if (leftpart.indexOf(pattern) > -1) {

        if (CountWords(lname) > 1) {
          return leftpart.replace(pattern,
            "{Lname * P1.Pn}"
          );
        } else {
          return leftpart.replace(pattern,
            "{Lname * Pn}");
        }
      }
 


      // look for this pattern : Part1_Part2_ ..._ ParN (words separated by "_")
      pattern = FormatSeparators(lname, "_");
      if (leftpart.indexOf(pattern) > -1) {

        if (CountWords(lname) > 1) {
          return leftpart.replace(pattern,
            "{Lname * P1_Pn}"
          );
        } else {
          return leftpart.replace(pattern,
            "{Lname * Pn}");
        }
      }

    }



  } ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*** END of test whether Lname is Composed Lname or not                                                        */ //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return leftpart;
}



function LookForFirstName(leftpart, fname) {
  // Search for the Last Name in the left part of the email
  // email structure : leftpart@rightpart

  /* Add these lines if this function is to be used as a standalone
  // In the EmailToPattern function, this formatting has already been is already done
  leftpart = leftpart.trim();
  leftpart = leftpart.toLowerCase();
  lname = lname.toLowerCase();
  lname = RemoveDiacritics(lname);
  lname = FormatSeparators(lname);
  */


  var nbParts = CountWords(fname);


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*** Fname is NOT a composed name                                                                                 ***/
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (nbParts == 1) {
    if (leftpart.indexOf(fname) != -1) {
      leftpart = leftpart.replace(fname, "{Fname}");
    }
    return leftpart;
  } else {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*** Fname IS a composed name                                                                                   ***/
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // look for this pattern : Part1Part2-...-ParN (all parts attached)
    var pattern = CompactName(fname);

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Fname * P1Pn}");
    }

 
    // look for this pattern : Part1-Part2-...-ParN (words separated by "-")
    pattern = FormatSeparators(fname, "-");

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Fname * P1-Pn}");
    }



    // look for this pattern : Part1.Part2. ... ParN (words separated by ".")
    pattern = FormatSeparators(fname, ".");

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Fname * P1.Pn}");
    }



    // look for this pattern : Part1_Part2_ ..._ ParN (words separated by "_")
    pattern = FormatSeparators(fname, "_");

    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Fname * P1_Pn}");
    } 
        


  } /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*** END of test on Composed Fname or not                                                                       */ //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return leftpart;
}




function LookForCompactShorten(leftpart, Fol) {
  // For "Jean-Pierre", looks for a pattern such as "jpierre" or "jeanp" 
  // email structure : leftpart@rightpart
    // FoL stands for "Lname" or "Fname"

    name = name.toLowerCase();
    var nbParts = CountWords (Fol);
    
  if (CountWords(name) > 1) {

    // look for this pattern : "jpierre" for "Jean Pierre"
    var pattern = FirstInitial(Fol);
    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern,
        "{Fname * iP1Pn}");
    }


    // look for this pattern : "pierrep" for "Jean Pierre"
    pattern = LastInitial(Fol);
    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern,
        "{Fname * P1iPn}");
    }
        
        
    // look for this pattern : Pn
        for (var i = 1; i < nbParts+1; i++) {
        
            pattern = NthWord(Fol, i);
                if (leftpart.indexOf(pattern) > -1) {
                return leftpart.replace(pattern, "{Fname * P" +(i).toString() +  "}");
                }
        
        }  
        
  }
  return leftpart;
}



function LookForShortenFirstInitial3(leftpart, name, Fol) {
        // email structure : leftpart@rightpart
    // For "Jean-Pierre", looks for a pattern such as "j.pierre" or "jean.p", separated by SEP
    // Fol stands for Fname or Lname


  if (isComposed(name)) {


    // look for this kind of patterns : "jpierre" or "j.pierre" or "j-pierre" or "j_pierre" for "Jean Pierre" 
    
        
        var pattern = FirstInitial(name, "");
    if (leftpart.indexOf(pattern) > -1) {
                return leftpart.replace(pattern,"{" + Fol  + " * iP1Pn}");
               
    }
  
        var pattern = FirstInitial(name, ".");
    if (leftpart.indexOf(pattern) > -1) {
        return leftpart.replace(pattern,"{" + Fol + " * iP1.Pn}");
    }
    
        var pattern = FirstInitial(name, "-");
    if (leftpart.indexOf(pattern) > -1) {
        return leftpart.replace(pattern,"{" + Fol + " * iP1-Pn}");
    }


        var pattern = FirstInitial(name, "_");
    if (leftpart.indexOf(pattern) > -1) {
        return leftpart.replace(pattern,"{" + Fol + " * iP1_Pn}");
    }

    
  }
  return leftpart;
}


function LookForShortenLastInitial3(leftpart, name, Fol) {
        // email structure : leftpart@rightpart
    // For "Jean-Pierre", looks for a pattern such as "j.pierre" or "jean.p", separated by SEP
    // Fol stands for Fname or Lname


  if (isComposed(name)) {


    // look for this kind of patterns : "jpierre" or "j.pierre" or "j-pierre" or "j_pierre" for "Jean Pierre" 
    
        
        var pattern = LastInitial(name, "");
    if (leftpart.indexOf(pattern) > -1) {
                return leftpart.replace(pattern,"{" + Fol  + " * P1iPn}");
               
    }
  
        var pattern = LastInitial(name, ".");
    if (leftpart.indexOf(pattern) > -1) {
        return leftpart.replace(pattern,"{" + Fol + " * P1.iPn}");
    }
    
        var pattern = LastInitial(name, "-");
    if (leftpart.indexOf(pattern) > -1) {
        return leftpart.replace(pattern,"{" + Fol + " * P1-iPn}");
    }


        var pattern = LastInitial(name, "_");
    if (leftpart.indexOf(pattern) > -1) {
        return leftpart.replace(pattern,"{" + Fol + " * P1_iPn}");
    }

    
  }
  return leftpart;
}



/*

function LookForShortenLastInitialSep(leftpart, fname, sep) {
  sep = sep || "."
    // For "Jean-Pierre", looks for a pattern such as "j.pierre" or "jean.p", separated by SEP
    // email structure : leftpart@rightpart
  Utilities.sleep(300); // prevents server saturation

  // NOTE : LookForShortenLastInitialSep and LookForShortenLastInitial could be merged. But no time to do it. To be corrected later

  if (CountWords(fname) > 1) {

    // look for this kind of patterns : "jean.p" for "Jean Pierre"
    switch (sep) {

      case ".":
        var pattern = LastInitial(fname, sep);
        if (leftpart.indexOf(pattern) > -1) {
          return leftpart.replace(pattern,
            "{Fname * P1.iPn}"
          );
        }
        break;

      case "-":
        pattern = LastInitial(fname, sep);
        if (leftpart.indexOf(pattern) > -1) {
          return leftpart.replace(pattern,
            "{Fname * P1-iPn}"
          );
        }
        break;



      case "_":
        pattern = LastInitial(fname, sep);
        if (leftpart.indexOf(pattern) > -1) {
          return leftpart.replace(pattern,
            "{Fname * P1_iPn}"
          );
        }
        break;
    }
  }
  return leftpart;
}


function LookForShortenLastInitialSep2(leftpart, FoL, sep) {
// Fol stands for "Fname" or "Lname"

  sep = sep || "."
    // For "Jean-Pierre", looks for a pattern such as "j.pierre" or "jean.p", separated by SEP
    // email structure : leftpart@rightpart
  Utilities.sleep(300); // prevents server saturation 

  // NOTE : LookForShortenLastInitialSep and LookForShortenLastInitial could be merged. But no time to do it. To be corrected later

  if (CountWords(fname) > 1) {

    // look for this kind of patterns : "jean.p" for "Jean Pierre"
    switch (sep) {

      case ".":
        var pattern = LastInitial(fname, sep);
        if (leftpart.indexOf(pattern) > -1) {
          return leftpart.replace(pattern,
            "{Fname * P1.iPn}"
          );
        }
        break;

      case "-":
        pattern = LastInitial(fname, sep);
        if (leftpart.indexOf(pattern) > -1) {
          return leftpart.replace(pattern,
            "{Fname * P1-iPn}"
          );
        }
        break;



      case "_":
        pattern = LastInitial(fname, sep);
        if (leftpart.indexOf(pattern) > -1) {
          return leftpart.replace(pattern,
            "{Fname * P1_iPn}"
          );
        }
        break;
    }
  }
  return leftpart;
}






function LookForShortenLastInitial(leftpart, name) {

  // Shorthen by the initial of the last part. Separated by "-"  (Jean-Pierre --> j-pierre)
  if (!PatternIsFound(leftpart)) {
    leftpart = LookForShortenLastInitialSep(leftpart, name,
      "-")
  }


  // Shorthen by the initial of the last part. Separated by "."  (Jean-Pierre --> j.pierre)
  if (!PatternIsFound(leftpart)) {
    leftpart = LookForShortenLastInitialSep(leftpart, name,
      ".")
  }



  // Shorthen by the initial of the 1st last. Separated by "_"  (Jean-Pierre --> j_pierre)
  if (!PatternIsFound(leftpart)) {
    leftpart = LookForShortenLastInitialSep(leftpart, name,
      "_")
  }

  return leftpart;
}


*/



function LookForLnameParts(leftpart, lname) {
  // In a composed Fname (eg. : "Jean Pathé-Marconi", checks whether leftname contains a part (eg. "pathe")
    

  var partFname = [""];
  lname = RemoveParticules(lname);
  lname = FormatSeparators(lname);
  var nbParts = CountWords(lname)

  for (var i = 1; i < nbParts + 1; i++) {
    partFname[i] = NthWord(lname, i)
  }

  partFname = partFname.sort(function(a, b) {
    return b.length - a.length
  }); // Sorts P[i] by longest to shortest



  for ( i = 0; i < nbParts; i++) {
    leftpart = leftpart.replace(partFname[i], "[P]");
  }



  //Look for PnPn   // ---> could be done more elegantly using an array for "."  "-" "_" ""
      if (leftpart.indexOf("[P][P]") > -1) {

    while (leftpart.indexOf("[P][P]") > -1) {
      leftpart = leftpart.replace("[P][P]", "[P]")
    }
    return leftpart.replace("[P]", "{Lname * PnPn}")
  }

  //Look for Pn.Pn
  if (leftpart.indexOf("[P].[P]") > -1) {

    while (leftpart.indexOf("[P].[P]") > -1) {
      leftpart = leftpart.replace("[P].[P]", "[P]")
    }
    return leftpart.replace("[P]", "{Lname * Pn.Pn}")
 
  }

  //Look for Pn-Pn
  if (leftpart.indexOf("[P]-[P]") > -1) {

    while (leftpart.indexOf("[P]-[P]") > -1) {
      leftpart = leftpart.replace("[P]-[P]", "[P]")
    }
    return leftpart.replace("[P]", "{Lname * Pn-Pn}")
  }

  //Look for Pn_Pn
  if (leftpart.indexOf("[P]_[P]") > -1) {

    while (leftpart.indexOf("[P]_[P]") > -1) {
      leftpart = leftpart.replace("[P]_[P]", "[P]")
    }
    return leftpart.replace("[P]", "{Lname * Pn_Pn}")
  }


  //Look for Pn
  if (leftpart.indexOf("[P]") > -1) {

    return leftpart.replace("[P]", "{Lname * Pn}")
  }

  return leftpart;
}




function LookForNameParts(leftpart, name, Fol) {
  // In a composed Fname (eg. : "Jean Pathé-Marconi", checks whether leftname contains "name" as a specific part (eg. "pathe")
    // Fol stands for Fname or Lname
    



    // Replaces parts by [P]
  var partName = [""];
  name = RemoveParticules(name);
  name = FormatSeparators(name);
    
    
    if (leftpart.indexOf("-") > -1) {
    
        var nbParts = CountWords(name, "-") }
    
    else {
    
        nbParts = CountWords(name, " ")
    
    }
   

  for (var i = 1; i < nbParts + 1; i++) {
    partName[i] = NthWord(name, i)
  }

  partName = partName.sort(function(a, b) {
    return b.length - a.length
  }); // Sorts P[i] by longest to shortest



  for ( i = 0; i < nbParts; i++) {
    leftpart = leftpart.replace(partName[i], "[P]");
  }

   
    
    // Replaces [P][P] by [P]
    var sep = ["" , ".", "-", "_"];
    var pattern="";
        
    for (var i=0; i<sep.length ;  i++) {

  
      if (leftpart.indexOf("[P]" + sep[i]+"[P]") > -1) {

            while (leftpart.indexOf("[P]" + sep[i]+"[P]") > -1) {
      leftpart = leftpart.replace("[P]" + sep[i]+"[P]", "[P]")
            }
    return leftpart.replace("[P]", "{" + Fol +" * Pn"+ sep[i] +"Pn}")
 
        }
    }

  return leftpart;
}







function RemoveRemainingParticule(leftpart) {
  // checks whether their is a remaining particule

  var remain = OutOfPattern(leftpart);

  // look for this pattern : (particule){Fname Pn} / example: {Fname}.de{Lname Pn}@company.fr
  for (var i = 0; i < particules.length; i++) {
    if (leftpart.indexOf(particules[i] + "{Lname * Pn}") > -1) {
      return leftpart.replace(particules[i] +
        "{Lname * Pn }", "{Lname * Pn}")
    }
  }

  // look for this pattern : (particule).{Fname Pn} / example: {Fname}.de.{Lname Pn}@company.fr
  for ( i = 0; i < particules.length; i++) {
    if (leftpart.indexOf(particules[i] + ".{Lname * Pn}") > -
      1) {
      return leftpart.replace(particules[i] +
        ".{Lname * Pn}", "{Lname *  Pn.Pn}")
    }
  }

  // look for this pattern : (particule)-{Fname Pn} / example: {Fname}.de-{Lname Pn}@company.fr
  for ( i = 0; i < particules.length; i++) {
    if (leftpart.indexOf(particules[i] + "-{Lname Pn}") > -
      1) {
      return leftpart.replace(particules[i] +
        "-{Lname * Pn}", "{Lname * Pn-Pn}")
    }
  }


  // look for this pattern : (particule)_{Fname Pn} / example: {Fname}.de_{Lname Pn}@company.fr
  for ( i = 0; i < particules.length; i++) {
    if (leftpart.indexOf(particules[i] + "_{Lname * Pn}") > -
      1) {
      return leftpart.replace(particules[i] +
        "_{Lname * Pn}", "{Lname * Pn_Pn}")
    }
  }


  // Checks whether Lname in pattern is juste composed of one Particule
  if (IsParticule(remain)) {
    return leftpart.replace(remain, "{Lname * Pn}");
  }


  return leftpart;
}


function LookForInitials (leftpart, name, FoL) {
  
  // Fol stands for FirstName or LastName 

  var nbParts = CountWords(name);
    var sep = ["" , ".", "-", "_"];
  var pattern = "";
    

  // don't look for an initial if a Fname or a Lname has been found
    

  if (nbParts == 1) {
    pattern = Initials(name);
    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Init" + FoL + "}");
    }
  
    } else {
    
    
    //Look for initials not sepatared, or separated by ".", by "-" or by "_" (Example : Jean de Saint Simon --> j.d_s_s)
        for (var i=0; i<sep.length ;  i++) {
        
            pattern = Initials(name, sep[i]);
            if (leftpart.indexOf(pattern) > -1) {
                return leftpart.replace ( pattern, "{Init" + FoL + " * iP1"  +sep[i] + "iPn}" );
            }

        }

    //Tries the same, but without the particule (Example : Yves de Saint Martin --> yves_sm@company.com)
        name = RemoveParticules(name);
        nbParts = CountWords(name);
        
        for (i=0; i<sep.length ;  i++) {
        
            pattern = Initials(name, sep[i]);
            if (leftpart.indexOf(pattern) > -1) {
                return leftpart.replace ( pattern, "{Init" + FoL + " * iP1"  +sep[i] + "iPn}" );
            } 

        }

  }

  
  return leftpart;
}




function LookForNickname(leftpart, fname) {
  // Check whether the First Name has been replaced by a nickname
  // Example "Robert Smith" --> bob.smith@company.com

  var res = [];

  /* add these lines if LookForNickname is to be used as a standalone function
  // leftpart = leftpart.toLowerCase(); 
  // leftpart)= RemoveDiacritics(leftpart);
  */


  for (var i = 0; i < nickNamesList.length; i++) {
    res = nickNamesList[i];
    if (res[0].toLowerCase() == fname.toLowerCase()) { // If fname corresponds to a First Name that has a nickname
      var nicktest = "";
      for (var j = 1; j < res.length; j++) {
        nicktest = res[j].toLowerCase();

        if (leftpart.indexOf(nicktest) > -1) {
          return leftpart.replace(
            nicktest,
            "{Fname * Nickname}"
          )
        }

      }

    }

  }

  return leftpart;
}



function LookForFnameRemainingInitials(leftpart, fname) {
  // In some cases , some initials might have been left behind. Before replacing them, 
  // we want to check wheterh a part of the last name have already been found or not.
  // Example : Stéphane De Saint Vincent  --> steph.svincent@company.com -->  {Fname Nickname}.s{Lname Pn}@ddd.company
  // We want to replace "s{Lname Pn}" by "{Lname iP1Pn}"


  fname = RemoveParticules(fname);

  var sep = ["", ".", "-", "_"];
  var pattern = ""
  var initfirst = Initials(fname).slice(0, 1);
  var initlast = Initials(NthWord(fname, CountWords(fname)));

  // return initfirst + " " + initlast;


  // look for these patterns : s{Lname Pn},  s.{Lname Pn}, s-{Lname Pn}, s_{Lname Pn}
  for (var i = 0; i < sep.length; i++) {
    pattern = initfirst + sep[i] + "{Lname * Pn}"
    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Lname * iP1" + sep[i] + "Pn}")
    }
  }


  // look for these patterns :{Lname Pn}s,  {Lname Pn}s, {Lname Pn}-s, {Lname Pn}_s
  for (var i = 0; i < sep.length; i++) {
    pattern = "{Lname Pn}" + sep[i] + initlast;
    if (leftpart.indexOf(pattern) > -1) {
      return leftpart.replace(pattern, "{Lname * P1" +  sep[i] + "iPn}")
    }
  }

  return leftpart;
}




function LookForShortInitials (leftpart, name, FoL) { 
  // For composed Fname, look for this pattern : Anne-Juliette Laville -> a.laville@commany.com
    // FoL Stands for "FName" or "Lname"
    
    
    if (CountWords(name) >1) {
        var pattern = Initials(name).slice(0,1);
                if (leftpart.indexOf(pattern) > -1) {
                return leftpart.replace(pattern, "{Init"+FoL+" * iP1}")
            }
     }

return leftpart;
}





function OutOfPattern(leftpart) {
  // When a pattern has been looked for in leftpart, returns the stings that have not been recognized
  // Regognized patterns are between {}
  // Example: {Fname}.{Lname) ==> ""
  // Example: d{Lname} ==> "d"
  // Example: {Lname}.{Lname}75 ==> "75""
  // Example: {Fname}m.{Lname} =="m"


  leftpart = LeftSep(leftpart, "@");
  var res = leftpart.replace(/\{(.+?)\}/g, ""); // regex: removes anything between the { }
  res = res.replace(/[._-]/g, ""); // regex: removes anything between the { }

  return res;
}



function PatternIsFound(leftpart) {
  // checks whether a pattern has been found
  // Example : {***}.{***} = true
  // Example : j{****}.{****} = false.
  // there shouldn't be any characters outside the {}

  if (OutOfPattern(leftpart) == "") {
    return true
  } else {
    return false
  };

  return res;
}




/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  *************   EMAIL TO PATTERN   ****************

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/



function EmailToPattern(fname, lname, email, company, checkOption) {
  checkOption = checkOption || true;
  // Search for a pattern in the left part of the email
  // email structure : leftpart@rightpart


  if (checkOption == true) {

    // Check if email is a Personal Email
    if (IsPersonalEmail(email))  {
      return ">> Personnal Email <<";
    }


    // Check if email is an Alumni Email
    if (IsAlumniEmail(email)) {
      return ">> Alumni Email <<";
    }

  }


    // Checks is email is generic
    if (isGenericEmail(email)) {
        return ">> Generic email <<";
    }



  // Checks Fname & Lname validity
  if (  !isProperName(fname) ) {
    return ">> Invalid Fname <<"
  }
    if (  !isProperName(lname) ) {
    return ">> Invalid Lname <<"
  }




  // Checks checks whether a pattern can be found
  if (fname == lname) {
    return ">> Pattern can't be found <<"
  }
  //-----------------------------------------> chercher également les "Said SAID ALI" --> said.said@company.com !!!!!!!!!!! (out of pattern de remove lname et remove lname)


  // Check Email's struture
  if (!isEmail(email)) {
    return ">> Invalid Email  <<";
  }
    

    var fnameOrigin = fname;

  email = email.trim();
  email = email.toLowerCase();
  fname = RemoveDiacritics(fname);
  fname = FormatSeparators(fname);
  fname = fname.toLowerCase()
  lname = RemoveDiacritics(lname);
  lname = FormatSeparators(lname);
  lname = lname.toLowerCase();

  var leftpart = LeftSep(email, "@");
  var rightpart = RightSep(email, "@");
  var res = leftpart;


  // Look for Last Name
  res = LookForLastName(leftpart, lname);
  if (PatternIsFound(res)) {
    return res+"@"+rightpart;
  }


  // Look for First Name
  if (!PatternIsFound(res)) {
    res = LookForFirstName(res, fname);
  }


  // Look for Nickname
  if (!PatternIsFound(res)) {
    res = LookForNickname(res, fname)
  }



  // Look for Parts of LName
  if (!PatternIsFound(res)) {
    res = LookForLnameParts(res, lname)
  }






/*@todo

  // Look for Shorthen First Name by First Initial. Compact form  (Jean-Pierre --> jpierre)
  if (!PatternIsFound(res)) {
    res = LookForCompactShorten(res, fname)
  }


  // Look for Shorthen First Name by First Initial. All forms (Jean-Pierre --> j.pierre etc...)
  if (!PatternIsFound(res)) {
    res = LookForShortenFirstInitial(res, fname)
  }



  // Look for Shorthen First Name by Last Initial. All forms (Jean-Pierre --> jean.p etc...)
  if (!PatternIsFound(res)) {
    res = LookForShortenLastInitial(res, fname)
  }


*/


    // Look for Shorthen First Name by First Initial ( "jean-charles" -> "jcharles")
    if (!PatternIsFound(res)) {
        res = LookForShortenFirstInitial3(res, fname, "Fname")
    }
    
    // Look for Shorthen First Name by Last Initial ( "jean-charles" -> "jeanc")
    if (!PatternIsFound(res)) {
        res = LookForShortenLastInitial3(res, fname, "Fname")
    }

  // Look for Fname initials 
    res = LockPattern (res);
  if (!PatternIsFound(res)) {
    res = LookForInitials(res, fname, "Fname")
  }
    res = UnLockPattern (res);


  // RemoveRemaingParticules was here, but it created a but when Fname initial was "a", mistaken for a particule
  
    
    // Look for Shorthen Last Name by First Initial
    if (!PatternIsFound(res)) {
         res = LookForShortenFirstInitial3(res, lname, "Fname")
    }
    
    // Look for Shorthen Last Name by Last Initial
    if (!PatternIsFound(res)) {
         res = LookForShortenLastInitial3(res, lname, "Fname")
    }
        

  // Look for initials linked to a part of Lname
  if (!PatternIsFound(res)) {
    res = LookForFnameRemainingInitials(res, lname)
  }



  // Look for Lname initials
    res = LockPattern (res);
  if (!PatternIsFound(res)) {
    res = LookForInitials (res, lname, "Lname")
  }
    res = UnLockPattern (res);



  // Look for Fname shorten initials (Example : Anne-Juliette Laville -> a.laville@company.com)
    res = LockPattern (res);
  if (!PatternIsFound(res)) {
    res = LookForShortInitials (res, fname, "Fname");
  }
    res = UnLockPattern (res);


  // Look for Lname shorten initials (Example : Anne Laville Belo-> anne.l@company.com)
    res = LockPattern (res);
  if (!PatternIsFound(res)) {
    res = LookForShortInitials (res, lname, "Lname");
  }
    res = UnLockPattern (res);


/*
    
    // Remove particules that have been omitted
  if (!PatternIsFound(res)) {
    res = RemoveRemainingParticule(res, fname)
  }

*/

  // Make sure the pattern found is ok // ----------------------------------------------------------> à corriger
  /*
 if (res.indexOf("{InitFname}") > -1 && res.indexOf("{InitFLname}") > -1 ) {
     if (Initials(fname) == Initials (lname) || Initials(fname) == Initials (RemoveParticules(lname)) ) {
         return "[not enough data to find a pattern]";
     }
 }
 */




    if (PatternIsFound(res)) { 
        return res + "@" + rightpart
    } else {
        return ">> No pattern found <<"
    }


return res + "@" + rightpart;
}

console.log(EmailToPattern('eric', 'phung', 'eric.phung@goshaba.com'))
console.log(EmailToPattern('Sylvie', ' Richefeu-Perrin', 'sylvie.richefeu-perrin@audemarspiguet.com'))
console.log(EmailToPattern('jean claude', 'van dame', 'j-c_v.d@ouf.com'))


/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  *************   PATTERN TO EMAIL   ****************

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/


function PatternToEmail(fname, lname, pattern) {
  // ------------------------------------------------------------------------------------------> A faire

    var res = "";
    var NbPartsLn = CountWords(Lname);
    var NbPartsFn = CountWords(Fname)



    // Is Pattern a proper patern?
    
    


    // Is Lname composed?
    if (CountWords (Lname) >1) {
    
    
    } else {
    
    
    }
    
    
    
    
    // Has Lname a particule?
    
    
    
    // Is Fname composed?














}








function ValidateEmail(email) {
/*

Validations externes:
pour noms composés, vérifier LinkedIn et/ou Google (florence "carron cabaret" disneyland linkedin -top)
tester SMTP
1) smtp
2) si smtp false -> plusieur pattern diff, / par le nombre de pattern
3) google -> nom prenom "@mail.com"

*/


}






function GuessEmail(fname, lname, company) {
  // ------------------------------------------------------------------------------------------> A faire


  /* A FAIRE 


 Regarder la récurrence des patterns des noms particules (FR d'abbord, le reste ensuite) (faire stats sur la base totale)
 > Gestion des PARTICULES (ex. de conservé et collé au mot d'après ?)
 > Fname composés : quand 1 seul : plutôt le premier ou le second ?





 Pour company, mettre soit un domaine (@ccie.com) soit un nom de société.

 Si nom de domaine non spécifié :
 Si 1 seule société et en exact match, revoyer l'email ou les emails

     > Pour Jean Pottin
     jean.potting@ubisoft.fr
     
     > Pour Jean de Pottin Very
     
     jean.pottinvery@ubisoft.fr, jean.depottinvery@ubisoft.fr

 Si 1 seule société mais fuzzy match (ubisoft vs Ubisoft France), renvoyer : UNISOFT FRANCE | jean.pottin@ubisoft.fr
 Si plusieurs matchs possible, renvoyer :

     > préciser parmi UBISOFT | UBISOFT FRANCE

 */

}
