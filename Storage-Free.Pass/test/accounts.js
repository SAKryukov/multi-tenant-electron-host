"use strict";

(() => {

   const defaultPasswordLength = 16;
   const basicCharacterRepertoire = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   const testCharacterRepertoire = basicCharacterRepertoire;
   const strongCharacterRepertoire = "!#$%&()+-0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^abcdefghijkmnopqrstuvwxyz|~/";
   const easiestCharacterRepertoire = "0123456789abcdefghijkmnopqrstuvwxyz";
   const easyCharacterRepertoire = "0123456789abcdefghijkmnopqrstuvwxyz[]-=/";
   const ultimateCharacterRepertoire =
      "!#$%&()*+/0123456789<=>?@ABCDEFG" +
      "HIJKLMNOPQRSTUVWXYZ[]^abcdefghij" +
      "klmnopqrstuvwxyz{|}~¡¢£¤¥¦§©«¬­®" +
      "±µ»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÐÑÒÓÔÕÖ×ØÜÝÞß" +
      "ႠႡႢႣႤႥႦႧႨႩႪႫႬႭႮႯႰႱႲႳႴႵႶႷႸႹႺႻႼႽႾႿ" +
      "աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտր" +
      "ሀሁሂሃሄህሆሇለሉሊላሌልሎሏሐሑሒሓሔሕሖሗመሙሚማሜምሞሟ" +
      "ሠሡሢሣሤሥሦሧረሩሪራሬርሮሯሰሱሲሳሴስሶሷሸሹሺሻሼሽሾሿ";

   const groups = {
      no: String.fromCodePoint(0x26D4), //String.fromCodePoint(0x1F590),
      dollar: String.fromCodePoint(0x1F4B2),
      work: String.fromCodePoint(0x2692),
      software: String.fromCodePoint(0x1F4BB),
      wiki: String.fromCodePoint(0x1F4DA),
      car: String.fromCodePoint(0x1F698),
   }; //groupCharacters

   const metadata = {
      title: `User Data Sample ${String.fromCodePoint(0x1f9e1)}`, version: "1.0.0",
   };

   const accounts = [
      {
         identity: {
            seed: "Test",
            selection: { characterRepertoire: testCharacterRepertoire, start: 0, length: 8, shift: 0 }
         },
         display: { name: "Test", user: { name: "Test User", url: "./account-info/test.html" } }
      },
      {
         identity: {
            seed: "MDB 2022/07/25",
            selection: { characterRepertoire: ultimateCharacterRepertoire, start: 3, length: 15, shift: 1, inserts: { value: "dF1", position: 3 } }
         },
         display: { name: "Most Dependable Bank", group: groups.dollar, url: "https://www.fictional-bank.com/login/", user: { name: "Responsible-bank-user", url: "./account-info/bank.html" } }
      },
      {
         identity: {
            seed: "WikipediA 2020/02/12 13:16",
            selection: { start: 0, length: 32, shift: 201 }
         },
         display: { name: "WikipediA", group: groups.wiki, url: "https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page", user: { name: "me", url: "./account-info/Wikipeda.html" } }
      },
      {
         identity: {
            seed: "GitHub 2022/07/25",
            selection: { start: 1, length: 16, shift: 0 }
         },
         display: { name: "GitHub", group: groups.software, url: "https://github.com", user: { name: "SAKryukov", url: "./account-info/GitHub.html" } }
      },
      {
         identity: {
            seed: "CodeProject 2022/07/25",
            selection: { start: 1, length: 16, shift: 0 }
         },
         display: { name: "CodeProject", group: groups.software, url: "https://www.codeproject.com", user: { name: "Sergey Aleksandrovich Kryukov", url: "./account-info/CodeProject.html" } }
      },
      {
         identity: {
            seed: "My work 2022/07/16",
            selection: { characterRepertoire: strongCharacterRepertoire, inserts: { value: "1Fb", position: 4 }, start: 0, length: 16, shift: 0 }
         },
         display: { group: groups.work, name: "My work", user: { name: "employee", url: "./account-info/work.html" } },
      },

      {
         identity: {
            seed: "Car insurance 2025/1/15",
            selection: { characterRepertoire: strongCharacterRepertoire, inserts: { value: "1Fb", position: 4 }, start: 0, length: 16, shift: 0 }
         },
         display: { group: groups.car, name: "Car Insurance", user: { name: "Insured", url: "./account-info/car.html" } },
      },
      {
         identity: {
            seed: "Car repair shop 2025/1/15",
            selection: { characterRepertoire: strongCharacterRepertoire, inserts: { value: "1Fb", position: 4 }, start: 0, length: 16, shift: 0 }
         },
         display: { group: groups.car, name: "Car Repair Shop", user: { name: "Insured", url: "./account-info/car.html" } },
      },
      {
         identity: {
            seed: "Unvalid user info",
            selection: { characterRepertoire: strongCharacterRepertoire, inserts: { value: "1Fb", position: 4 }, start: 0, length: 16, shift: 0 }
         },
         display: { group: groups.no, name: "Invalid User Demo (click on User)", user: { name: "employee", url: "./account-info/invalid-user.html" } },
      },
      {
         identity: {
            seed: "Missing user info",
            selection: { characterRepertoire: strongCharacterRepertoire, inserts: { value: "1Fb", position: 4 }, start: 0, length: 16, shift: 0 }
         },
         display: { group: groups.no, name: "Missing User Info Demo", user: { name: "employee", url: "" } },
      },
   ]; // accounts

   const defaultAccount = {
      identity: {
         seed: "ERROR! define seed!",
         selection: { characterRepertoire: strongCharacterRepertoire, start: 0, length: defaultPasswordLength, shift: 0, }
      },
      display: { name: "Incomplete account", url: "https://www.undefined.account", user: { name: "unknown user", url: new String() } }
   };

   return { metadata, accounts, default: defaultAccount };

})();
