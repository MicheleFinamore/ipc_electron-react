const fs = require("fs");
const path = require('path')
const items = [];
const keys = [];
const links = [];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

for (let i = 0; i < 10000; i++) {
  let entity = {
    itemType: "entity",
    onMerge: "update",
    key: i.toString(),
    type: "SubscriberInfoANT",
    properties: {
      Numero: {
        value: i.toString(),
      },
    },
  };

  items.push(entity);
}
console.log("started generate");

while (keys.length < 5001) {
  console.log("keys.length ", keys.length);
  let n1 = getRandomInt(0, 10000);
  let n2 = getRandomInt(0, 10000);
  let key = `LU:${n1}-${n2}`;
  if (!keys.includes(key)) keys.push(key);
}

keys.forEach((key, index) => {
  let keys = key.split(":")[1].split("-");

  let link = {
    itemType: "link",
    label: index,
    key: key,
    type: "Database Link",
    properties: {
      identityProperty: {
        value: key,
      },
    },
    key1: keys[0],
    type1: "SubscriberInfoANT",
    key2: keys[1],
    type2: "SubscriberInfoANT",
  };

  items.push(link);
});

const datacart = JSON.stringify({items : items})
const file_path = path.join(__dirname,'/mock/generate.json')

fs.writeFile(file_path, datacart, (err) => {
  if (err) {
    
    //!error in writing
    console.error(`error while writing file in folder : ${err.message}`);
  } else {

    //?File written successfully
    console.log("File written successfully \n");
  }
});





