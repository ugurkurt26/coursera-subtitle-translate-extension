//author= Mücahit Sahin
//github=https://github.com/mucahit-sahin


async function openBilingual () {
  
  let tracks = document.getElementsByTagName('track')
  let en
  
  if (tracks.length) {

    for (let i = 0; i < tracks.length; i++) 
    {
      if (tracks[i].srclang === 'en')
      {
        en = tracks[i]
      }
    }

    if (en)
    {
      en.track.mode = 'showing'

      await sleep(500)
      
      let cues_org = en.track.cues
      let tempcues = [];
      for(let i=0;i<cues_org.length;i++)
      {
          tempcues.push(cues_org[i].text)

      }
      var cues = JSON.parse(JSON.stringify(tempcues));
      
      var endSentence = []
      for(let i=0;i<cues.length;i++)
      {
          for(let j=0;j<cues[i].length;j++)
          {
              if((cues[i][j] == '.' ||
              cues[i][j] == '?' ||
              cues[i][j] == '!') && cues[i][j+1] == undefined)
              {
              endSentence.push(i)
              }
          }
      }

      var cuesTextList = getTexts(cues)

      for(let n=0;n<=cuesTextList.length;n++)
      {
        getTranslation(cuesTextList[n].text, translatedText => 
          { 

          var translatedList = translatedText.split(' _ * _ .')
          translatedList.splice(-1,1)

          for(let i=cuesTextList[n].start;i<=cuesTextList[n].end;i++)
          {
            if(i!=0)
            {
              for(let j=endSentence[i-1]+1;j<=endSentence[i];j++)
              {
                cues_org[j].text = translatedList[i-cuesTextList[n].start]
              }
            }
            else
            {
              for(let j=0;j<=endSentence[i];j++)
              {
                cues_org[j].text = translatedList[i]
              }
            }
          }
        });
        await sleep(500)
      };

    }
  }
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getTexts(cues_sep)
{
    let cuesTextList = ""
    for(let i=0;i < cues_sep.length;i++)
    {

    if(cues_sep[i][cues_sep[i].length-1] == '.')
        cues_sep[i] = cues_sep[i].replaceAt(cues_sep[i].length-1, "._~_")
    else if(cues_sep[i][cues_sep[i].length-1] == '?')
        cues_sep[i] = cues_sep[i].replaceAt(cues_sep[i].length-1, "?_~_")
    else if(cues_sep[i][cues_sep[i].length-1] == '!')
        cues_sep[i] = cues_sep[i].replaceAt(cues_sep[i].length-1, "!_~_")

    cues_sep[i] = cues_sep[i].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    cuesTextList+= cues_sep[i].replace(/\n/g, ' ') + " "
    }

    var cuesSepList = cuesTextList.split('_~_')
    cuesSepList.splice(-1,1)

    let listOutput = []
    let text = "";
    let j = 0;
    let i =0;

    while(i<cuesSepList.length)
    {
        if(text.length>4000)
        {
            listOutput.push({text : text , start : j , end : i-1});
            text = "";
            j = i;
            
        }
        else
        {   var temp_punctuation = cuesSepList[i][cuesSepList[i].length-1]+" _ * _ . "
            temp_punctuation = cuesSepList[i].substr(0,cuesSepList[i].length-1) + temp_punctuation
            cuesSepList[i] = temp_punctuation
            text+=cuesSepList[i]
            i++;
        }

    }
    listOutput.push({text : text , start : j , end : cuesSepList.length-1});

    return listOutput
}


function getTranslation (words, callback) {

 const xhr = new XMLHttpRequest()
 let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURI(words)}`
  xhr.open('GET', url, true)
  xhr.responseType = 'text'
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200 || xhr.status === 304) {
      
        const translatedList = JSON.parse(xhr.responseText)[0]
        let translatedText = ''
        for (let i = 0; i < translatedList.length; i++) {
          translatedText += translatedList[i][0]
        }
        callback(translatedText)
      }
    }
  }
  xhr.send()
}

chrome.runtime.onMessage.addListener
(
  function (request, sender) {
    openBilingual()
  }
)
