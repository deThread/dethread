importScripts('md5.js', 'base26Table.js');

let begin;
let end;
let hash;
let length;

this.addEventListener('message', (e) => {
  switch (e.data.cmd) {
    case 'start':
      begin = e.data.begin;
      end = e.data.end;
      hash = e.data.hash;
      length = e.data.length
      crackMD5(begin, end, hash);
      break;
    default:
      break;
  }
});

function crackMD5(begin, end, hash) {
  console.log('START AT', Date(), 'begin is : ', begin, 'end is ', end);
  for (let i = begin; i <= end; i += 1) {
    // call i to str, compare hashed string to actual hash
    const base26 = padWithZeros(i.toString(26));
    const convertedStr = base26toSTR(base26);
    
    if (MD5(convertedStr) === hash) {
      console.log('worker succeeded', convertedStr)
      postMessage({ cmd: 'success', clearText: convertedStr});
    }
  }
  
  console.log('Worker Failed');
  postMessage({ cmd: 'fail' });
}

function padWithZeros(baseNum) {
  while (baseNum.length < length) {
    baseNum = '0' + baseNum;
  }
  return baseNum;
}

function base26toSTR(base26Val) {
  let newStr = '';
  for (let i = 0; i < base26Val.length; i += 1) {
    newStr += base26Table[base26Val[i]];
  }

  return newStr;
}
